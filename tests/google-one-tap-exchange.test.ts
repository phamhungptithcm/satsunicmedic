import {expect,it,vi} from 'vitest';
const sdk=vi.hoisted(()=>({credential:vi.fn(value=>({value})),signIn:vi.fn(),signOut:vi.fn().mockResolvedValue(undefined),popup:vi.fn(),persistence:vi.fn().mockResolvedValue(undefined)}));
import {prepareGoogleSignIn,completeGoogleSignIn} from '../apps/web/src/lib/google-sign-in';
const loader = (async()=>[{getApps:()=>[{}],initializeApp:vi.fn()},{GoogleAuthProvider:class{static credential=sdk.credential;},getAuth:()=>({}),setPersistence:sdk.persistence,inMemoryPersistence:'memory',signInWithCredential:sdk.signIn,signInWithPopup:sdk.popup,signOut:sdk.signOut}]) as unknown as NonNullable<Parameters<typeof prepareGoogleSignIn>[1]>;
it('exchanges Google identity via Firebase before the existing CSRF server session',async()=>{
 const token=vi.fn().mockResolvedValue('firebase-token');sdk.signIn.mockResolvedValue({user:{getIdToken:token}});
 const client=await prepareGoogleSignIn('google-token',loader);const session={isActive:()=>true,csrf:vi.fn().mockResolvedValue(undefined),exchange:vi.fn().mockResolvedValue(undefined)};
 expect(await completeGoogleSignIn(client,session)).toBe(true);
 expect(sdk.credential).toHaveBeenCalledWith('google-token');expect(sdk.popup).not.toHaveBeenCalled();expect(session.exchange).toHaveBeenCalledWith('firebase-token');expect(sdk.signOut).toHaveBeenCalled();expect(sdk.persistence).toHaveBeenCalledWith({},'memory');
});
it('never creates a server session when Firebase rejects Google credential',async()=>{
 sdk.signIn.mockRejectedValue(Error('rejected'));const client=await prepareGoogleSignIn('invalid-token',loader);const exchange=vi.fn();await expect(completeGoogleSignIn(client,{isActive:()=>true,csrf:vi.fn(),exchange})).rejects.toThrow('rejected');expect(exchange).not.toHaveBeenCalled();
});
