export type GoogleIdentity = {
 initialize(options: {client_id:string;auto_select:false;use_fedcm_for_prompt:true;cancel_on_tap_outside:true;context:'signin';callback:(response:{credential:string})=>void}):void;
 prompt():void; cancel():void; disableAutoSelect():void;
};
export const googleIdentity=()=> (window as Window & {google?:{accounts?:{id?:GoogleIdentity}}}).google?.accounts?.id;
let suppressed=false;
export function oneTapSuppressed(){try{return suppressed||sessionStorage.getItem('hs-one-tap-signed-out')==='1';}catch{return suppressed;}}
export function suppressOneTap(){suppressed=true;try{sessionStorage.setItem('hs-one-tap-signed-out','1');}catch{/* Memory fallback. */}try{googleIdentity()?.cancel();googleIdentity()?.disableAutoSelect();}catch{/* Provider failure must not undo server sign-out. */}window.dispatchEvent(new Event('hs-one-tap-stop'));}
export function allowOneTap(){suppressed=false;try{sessionStorage.removeItem('hs-one-tap-signed-out');}catch{/* Optional storage. */}}
export function validGoogleCredential(value:unknown):value is string{return typeof value==='string'&&value.length>0&&value.length<=10000;}
export function oneTapConfigured(clientId:string){return /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId);}
