import {afterEach,describe,it,expect,vi} from 'vitest';
import {createHash} from 'node:crypto';
import {readVerifiedBodyBytes} from '../packages/anatomy-viewer/src/verified-body-asset';
const data=new Uint8Array([1,2,3]),expected={byteLength:3,sha256:createHash('sha256').update(data).digest('hex')};
afterEach(()=>vi.unstubAllGlobals());
describe('bounded chunk bytes',()=>{
 it('verifies exact bytes before decode',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(data)));expect(await readVerifiedBodyBytes('/asset',expected,new AbortController().signal)).toEqual(data);});
 it.each([0,-1,NaN,8_000_001])('rejects unsafe manifest size %s before network',async byteLength=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);await expect(readVerifiedBodyBytes('/asset',{...expected,byteLength},new AbortController().signal)).rejects.toThrow('Manifest');expect(fetch).not.toHaveBeenCalled();});
 it('rejects wrong digest',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array([3,2,1]))));await expect(readVerifiedBodyBytes('/asset',expected,new AbortController().signal)).rejects.toThrow('Integrity');});
 it('rejects incomplete bytes',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array([1]))));await expect(readVerifiedBodyBytes('/asset',expected,new AbortController().signal)).rejects.toThrow('Incomplete');});
 it('rejects oversize bytes without accepting a prefix',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array([1,2,3,4]))));await expect(readVerifiedBodyBytes('/asset',expected,new AbortController().signal)).rejects.toThrow('Oversize');});
 it('rejects HTTPfailure',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(null,{status:404})));await expect(readVerifiedBodyBytes('/asset',expected,new AbortController().signal)).rejects.toThrow('Unavailable');});
 it('discard bytes when cancellation occurs before decode',async()=>{const abort=new AbortController();vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>{abort.abort();return Promise.resolve(new Response(data));}));await expect(readVerifiedBodyBytes('/asset',expected,abort.signal)).rejects.toThrow('Cancelled');});
});
