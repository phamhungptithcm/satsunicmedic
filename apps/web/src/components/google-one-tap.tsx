'use client';
import Script from 'next/script';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ApiError,request,csrfHeaders} from '@hs/api-client';
import {completeGoogleSignIn,prepareGoogleSignIn} from '../lib/google-sign-in';
import {googleIdentity,oneTapConfigured,oneTapSuppressed,validGoogleCredential} from '../lib/google-one-tap';
export default function GoogleOneTap({nonce}:{nonce:string}){
 const router=useRouter(),attempted=useRef(false),busy=useRef(false);
 const [anonymous,setAnonymous]=useState(false),[ready,setReady]=useState(false),[manual,setManual]=useState(false),[stopped,setStopped]=useState(false),[notice,setNotice]=useState(''),[failed,setFailed]=useState(false);
 const clientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID??'';
 const enabled=process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED==='true'&&oneTapConfigured(clientId)&&!!process.env.NEXT_PUBLIC_FIREBASE_API_KEY&&process.env.NEXT_PUBLIC_FIREBASE_EMULATOR!=='true';
 useEffect(()=>{
  if(!enabled)return;
  let active=true,controller=new AbortController();
  const refresh=()=>{controller.abort();controller=new AbortController();const signal=controller.signal;setAnonymous(false);void request('/api/v1/me',{signal}).catch(e=>{if(active&&!signal.aborted&&e instanceof ApiError&&e.status===401)setAnonymous(true);});};
  const visibility=(e:Event)=>setManual(Boolean((e as CustomEvent<boolean>).detail));
  const stop=()=>{setStopped(true);googleIdentity()?.cancel();};
  refresh();window.addEventListener('hs-auth-changed',refresh);window.addEventListener('hs-login-visible',visibility);window.addEventListener('hs-one-tap-stop',stop);
  return()=>{active=false;controller.abort();window.removeEventListener('hs-auth-changed',refresh);window.removeEventListener('hs-login-visible',visibility);window.removeEventListener('hs-one-tap-stop',stop);};
 },[enabled]);
 const eligible=enabled&&anonymous&&!manual&&!stopped;
 useEffect(()=>{
  const google=googleIdentity();
  if(!eligible||!ready||!google||attempted.current||oneTapSuppressed())return;
  let active=true;const controller=new AbortController();
  try { google.initialize({client_id:clientId,auto_select:false,use_fedcm_for_prompt:true,cancel_on_tap_outside:true,context:'signin',callback:async({credential})=>{
   if(!active||busy.current||oneTapSuppressed()||!validGoogleCredential(credential))return;
   busy.current=true;setNotice('Đang đăng nhập…');setFailed(false);
   try{
    const client=await prepareGoogleSignIn(credential);if(!active)return;
    const completed=await completeGoogleSignIn(client,{isActive:()=>active&&!controller.signal.aborted&&!oneTapSuppressed(),csrf:()=>request('/auth/csrf',{signal:controller.signal}),exchange:idToken=>request('/auth/session',{method:'POST',headers:csrfHeaders(),body:JSON.stringify({idToken}),signal:controller.signal})});
    if(completed&&active){setNotice('');google.cancel();window.dispatchEvent(new Event('hs-auth-changed'));router.refresh();}
   }catch{if(active){setNotice('Chưa đăng nhập được.');setFailed(true);}}finally{busy.current=false;}
  }});
  attempted.current=true;google.prompt();
  } catch { setNotice("Chưa kết nối được Google.");setFailed(true); }
  return()=>{active=false;controller.abort();try{google.cancel();}catch{/* Provider cleanup is best effort. */}};
 },[eligible,ready,clientId,router]);
 if(!enabled)return null;
 return <>{eligible&&!oneTapSuppressed()&&<Script nonce={nonce} src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={()=>setReady(true)} onError={()=>{setNotice('Chưa kết nối được Google.');setFailed(true);}}/>}{notice&&<aside className="one-tap-notice" role="status">{notice} {failed&&<Link href="/tai-khoan">Mở tài khoản</Link>}</aside>}</>;
}
