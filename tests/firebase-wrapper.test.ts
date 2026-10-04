import {describe,it,expect,vi} from 'vitest';
import {api} from '../apps/api/src/firebase';
describe('Firebase HTTP admission',()=>{
 it('rejects a pre-parsed oversized body before Nest initializes',async()=>{
  const json=vi.fn();const status=vi.fn(()=>({json}));
  await api({rawBody:Buffer.alloc(256*1024+1)} as Parameters<typeof api>[0],{status} as unknown as Parameters<typeof api>[1]);
  expect(status).toHaveBeenCalledWith(413);expect(json).toHaveBeenCalledWith({error:{code:'PAYLOAD_TOO_LARGE'}});
 });
});
