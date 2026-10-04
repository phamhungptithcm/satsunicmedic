/** Bounded, integrity checked byte reader. GLTF parsing may only follow successful verification. */
export async function readVerifiedBodyBytes(url:string, expected:{byteLength:number;sha256:string}, signal:AbortSignal):Promise<Uint8Array<ArrayBuffer>> {
 if(!Number.isSafeInteger(expected.byteLength)||expected.byteLength<=0||expected.byteLength>8_000_000)throw Error('Manifest');
 const response=await fetch(url,{signal,cache:'no-store'});
 if(!response.ok||!response.body)throw Error('Unavailable');
 const bytes=new Uint8Array(expected.byteLength),reader=response.body.getReader();let offset=0;
 try{while(true){const part=await reader.read();if(part.done)break;if(signal.aborted){await reader.cancel();throw Error('Cancelled');}if(offset+part.value.length>bytes.length){await reader.cancel();throw Error('Oversize');}bytes.set(part.value,offset);offset+=part.value.length;}}finally{reader.releaseLock();}
 if(offset!==bytes.length)throw Error('Incomplete');
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(digest!==expected.sha256||signal.aborted)throw Error('Integrity/cancelled');
 return bytes;
}
