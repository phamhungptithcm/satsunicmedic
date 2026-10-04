import { describe, expect, it, vi } from 'vitest';
import { collectPersonalExport } from '../apps/web/src/lib/personal-export';
describe('complete personal export', () => {
  it('follows all private pages and loads scenes only for exported lessons', async () => {
    const load=vi.fn(async(kind:string,cursor?:string,lessonId?:string)=>{
      if(kind==='notes')return {items:[{id:cursor?'note2':'note1'}],nextCursor:cursor?null:'next'};
      if(kind==='lessons')return {items:[{id:'lesson1'}],nextCursor:null};
      if(kind==='scenes'){expect(lessonId).toBe('lesson1');return {items:[{id:'scene1'}],nextCursor:null};}
      return {items:[],nextCursor:null};
    });
    const data=await collectPersonalExport({displayName:'Synthetic'},load,new AbortController().signal,()=>{});
    expect(data.notes).toEqual([{id:'note1'},{id:'note2'}]);expect(data.scenes).toEqual([{id:'scene1'}]);expect(load).toHaveBeenCalledTimes(11);
  });
  it('does not return a partial artifact when a later page fails',async()=>{
    const load=vi.fn().mockResolvedValueOnce({items:[{id:'private'}],nextCursor:'next'}).mockRejectedValueOnce(new Error('Network unavailable'));
    await expect(collectPersonalExport({},load,new AbortController().signal,()=>{})).rejects.toThrow('Network unavailable');
  });
  it('stops before reading after cancellation',async()=>{
    const controller=new AbortController();const load=vi.fn(async()=>{controller.abort();return {items:[],nextCursor:'next'};});
    await expect(collectPersonalExport({},load,controller.signal,()=>{})).rejects.toThrow();expect(load).toHaveBeenCalledTimes(1);
  });
  it('rejects repeated cursors even when pages contain no records',async()=>{
    const load=vi.fn(async()=>({items:[],nextCursor:'repeated'}));await expect(collectPersonalExport({},load,new AbortController().signal,()=>{})).rejects.toThrow('INVALID_EXPORT_PAGE');expect(load).toHaveBeenCalledTimes(2);
  });
  it('enforces byte, record and page budgets',async()=>{
    for(const limits of [{records:0,bytes:1000,pages:10},{records:10,bytes:1,pages:10},{records:10,bytes:1000,pages:0}])await expect(collectPersonalExport({},async()=>({items:[{text:'private'}],nextCursor:null}),new AbortController().signal,()=>{},limits)).rejects.toThrow('EXPORT_CAPACITY_EXCEEDED');
  });
});
