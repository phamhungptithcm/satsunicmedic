export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string) { super(code); }
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 10000);
  const cancel = () => abort.abort();
  if (options.signal?.aborted) abort.abort();
  options.signal?.addEventListener('abort', cancel, {once:true});
  try {
    const response = await fetch(path, { ...options, signal:abort.signal, credentials:'same-origin', cache:'no-store', headers:{'Content-Type':'application/json',...options.headers} });
    if (!response.ok) {
      const data:unknown=await response.json().catch(()=>null);
      const code=data&&typeof data==='object'&&'error'in data?(data as {error?:{code?:string}}).error?.code:undefined;
      throw new ApiError(response.status,code??'REQUEST_FAILED');
    }
    if(response.status===204)return undefined as T;
    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort',cancel);
  }
}
export function csrfHeaders():Record<string,string>{
  const value=document.cookie.split('; ').find(x=>x.startsWith('hs_csrf='))?.slice(8);
  return value?{'X-CSRF-Token':value}:{};
}
