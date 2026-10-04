import {afterEach,expect,it,vi} from 'vitest';
import {allowOneTap,oneTapConfigured,oneTapSuppressed,suppressOneTap,validGoogleCredential} from '../apps/web/src/lib/google-one-tap';
import {prepareGoogleSignIn} from '../apps/web/src/lib/google-sign-in';
afterEach(()=>{allowOneTap();vi.unstubAllGlobals();});
it('rejects missing and oversized credentials before loading Firebase',async()=>{
 for(const value of ['', 'x'.repeat(10001)])await expect(prepareGoogleSignIn(value)).rejects.toThrow('INVALID_LOGIN');
 expect(validGoogleCredential(null)).toBe(false);expect(validGoogleCredential('fixture')).toBe(true);
});
it('requires a web OAuth client ID',()=>{expect(oneTapConfigured('')).toBe(false);expect(oneTapConfigured('wrong-project')).toBe(false);expect(oneTapConfigured('123-fixture.apps.googleusercontent.com')).toBe(true);});
it('suppresses after sign out even if session storage is blocked',()=>{
 const cancel=vi.fn(),disableAutoSelect=vi.fn(),dispatchEvent=vi.fn();
 vi.stubGlobal('window',{google:{accounts:{id:{cancel,disableAutoSelect}}},dispatchEvent});
 vi.stubGlobal('sessionStorage',{getItem:()=>{throw Error();},setItem:()=>{throw Error();},removeItem:()=>{throw Error();}});
 suppressOneTap();expect(oneTapSuppressed()).toBe(true);expect(cancel).toHaveBeenCalledOnce();expect(disableAutoSelect).toHaveBeenCalledOnce();allowOneTap();expect(oneTapSuppressed()).toBe(false);
});
it('persists logout suppression until explicit sign-in',()=>{
 const values=new Map();vi.stubGlobal('sessionStorage',{getItem:(key:string)=>values.get(key),setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});
 vi.stubGlobal('window',{dispatchEvent:vi.fn()});suppressOneTap();expect(values.get('hs-one-tap-signed-out')).toBe('1');allowOneTap();expect(oneTapSuppressed()).toBe(false);
});
