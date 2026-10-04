import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldPath, type Transaction, type Query, type DocumentData } from 'firebase-admin/firestore';
import { randomUUID } from 'node:crypto';
import { CONFIG, type Config } from './config.js';
import type { Collections } from './domain.js';
import { digest } from './security.js';
import { fail } from './errors.js';
export { FieldPath };
export const MAX_PAYLOAD_BYTES=16*1024*1024;
const CHUNK_BYTES=400000;
export const keyId = (...values:string[]) => digest(JSON.stringify(values));
export function searchGrams(text:string) {
  const value=text.toLowerCase(); const grams=new Set<string>();
  for(let size=1;size<=3;size++) for(let i=0;i<=value.length-size;i++) grams.add(value.slice(i,i+size));
  return [...grams];
}
function dates(value:unknown):unknown {
  if(value instanceof Timestamp) return value.toDate();
  if(Array.isArray(value)) return value.map(dates);
  if(value && typeof value==='object' && !(value instanceof Date) && !Buffer.isBuffer(value)) return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,dates(v)]));
  return value;
}
const payloadFields:Partial<Record<keyof Collections,string[]>>={assets:['manifest'],revisions:['body'],scenes:['snapshot'],shares:['snapshot'],quizzes:['questions'],facilities:['evidence'],attempts:['result'],idempotency:['response']};
@Injectable()
export class Database implements OnModuleDestroy {
  readonly firestore;
  constructor(@Inject(CONFIG) config:Config) {
    const name=`hs-${config.FIREBASE_PROJECT_ID}`;
    const app=getApps().find(a=>a.name===name)??initializeApp({projectId:config.FIREBASE_PROJECT_ID,...(config.FIRESTORE_EMULATOR_HOST?{}:{credential:applicationDefault()})},name);
    this.firestore=getFirestore(app);
  }
  async onModuleDestroy() { /* Firebase Admin clients are shared by warm invocations. */ }
  collection<K extends keyof Collections>(name:K) { return this.firestore.collection(name); }
  ref<K extends keyof Collections>(name:K,id:string) { if(!id||id.includes('/')) fail(404,'NOT_FOUND'); return this.collection(name).doc(id); }
  transaction<T>(work:(tx:Transaction)=>Promise<T>) { return this.firestore.runTransaction(work); }
  async get<K extends keyof Collections>(name:K,id:string,tx?:Transaction):Promise<Collections[K]|null> {
    const ref=this.ref(name,id); const snap=await (tx?tx.get(ref):ref.get());
    return snap.exists?this.decode<K>(name,snap.data()!):null;
  }
  async decode<K extends keyof Collections>(name:K,data:DocumentData):Promise<Collections[K]> {
    const row=dates(data) as Record<string,unknown>;
    for(const field of payloadFields[name]??[]) {
      const ptr=row[`${field}Payload`] as {hash:string;count:number;bytes:number}|undefined;
      if(!ptr) continue;
      if(!/^[a-f0-9]{64}$/.test(ptr.hash)||!Number.isInteger(ptr.count)||ptr.count<1||ptr.count>Math.ceil(MAX_PAYLOAD_BYTES/CHUNK_BYTES)||!Number.isInteger(ptr.bytes)||ptr.bytes<1||ptr.bytes>MAX_PAYLOAD_BYTES||ptr.count!==Math.ceil(ptr.bytes/CHUNK_BYTES)) fail(503,'PAYLOAD_CORRUPT');
      const parts:Buffer[]=[];
      for(let start=0;start<ptr.count;start+=100) {
        const refs=Array.from({length:Math.min(100,ptr.count-start)},(_,i)=>this.firestore.collection('payloads').doc(`${ptr.hash}-${start+i}`));
        const snaps=await this.firestore.getAll(...refs);
        for(const snap of snaps) { const part=snap.data()?.bytes; if(!Buffer.isBuffer(part)||part.length>CHUNK_BYTES) fail(503,'PAYLOAD_CORRUPT'); parts.push(part); }
      }
      const bytes=Buffer.concat(parts);
      if(bytes.length!==ptr.bytes||digest(bytes.toString('utf8'))!==ptr.hash) fail(503,'PAYLOAD_CORRUPT');
      row[field]=JSON.parse(bytes.toString('utf8')); delete row[`${field}Payload`];
    }
    return row as unknown as Collections[K];
  }
  // Immutable content-addressed chunks are prepared before the authoritative document write.
  // Failed transactions may leave harmless unreachable chunks; no reader discovers them by listing.
  async put<K extends keyof Collections>(name:K,row:Collections[K],tx?:Transaction) {
    const data={...row} as Record<string,unknown>;
    if(name==='anatomy') data.grams=searchGrams(`${data.nameVi} ${data.nameEn??''}`);
    for(const field of payloadFields[name]??[]) {
      if(data[field]===undefined) continue;
      const json=JSON.stringify(data[field]); const bytes=Buffer.from(json); const hash=digest(json);
      const count=Math.ceil(bytes.length/CHUNK_BYTES);
      if(bytes.length>MAX_PAYLOAD_BYTES) fail(413,'PAYLOAD_TOO_LARGE');
      for(let start=0;start<count;start+=5) {
        const batch=this.firestore.batch();
        for(let i=start;i<Math.min(count,start+5);i++) batch.set(this.firestore.collection('payloads').doc(`${hash}-${i}`),{bytes:bytes.subarray(i*CHUNK_BYTES,(i+1)*CHUNK_BYTES)});
        await batch.commit();
      }
      delete data[field]; data[`${field}Payload`]={hash,count,bytes:bytes.length};
    }
    const ref=this.ref(name,row.id);
    if(name==='anatomy') {
      const systemId=String(data.systemId),catalog=this.ref('anatomySystems',keyId('system',systemId));
      const system={id:catalog.id,systemId};
      if(tx){tx.set(ref,data);tx.set(catalog,system);}else {const batch=this.firestore.batch();batch.set(ref,data);batch.set(catalog,system);await batch.commit();}
    } else if(tx) tx.set(ref,data); else await ref.set(data);
    return row;
  }
  remove<K extends keyof Collections>(name:K,id:string,tx:Transaction) { tx.delete(this.ref(name,id)); }
  async list<K extends keyof Collections>(name:K,query:Query,limit:number,tx?:Transaction):Promise<Collections[K][]> {
    const bounded=query.limit(limit); const snap=await(tx?tx.get(bounded):bounded.get());
    return Promise.all(snap.docs.map(d=>this.decode<K>(name,d.data())));
  }
  async scan<K extends keyof Collections>(name:K,query:Query,accept:(row:Collections[K])=>boolean,limit:number) {
    const found:Collections[K][]=[]; let cursor; let read=0;
    while(read<1024) {
      const size=Math.min(128,1024-read); const page=await (cursor?query.startAfter(cursor):query).limit(size).get();
      for(const doc of page.docs) { const row=await this.decode<K>(name,doc.data()); if(accept(row)) found.push(row); if(found.length===limit) return found; }
      read+=page.size; if(page.size<size) return found; cursor=page.docs.at(-1);
    }
    // A full final page cannot prove exhaustion; fail closed rather than return a partial success.
    fail(503,'SEARCH_CAPACITY_EXCEEDED');
  }
  async audit(actorId:string,action:string,objectId:string,tx:Transaction) { await this.put('audits',{id:randomUUID(),actorId,action,objectId,createdAt:new Date()},tx); }
  async ready() { await this.firestore.collection('_health').doc('ready').get(); }
}
