import {createHmac,timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
const payload=(method,path,ip,at)=>JSON.stringify([method,path,ip,at]);
export function signRelay(secret,{method,path,ip,at=Date.now()}){
  if(typeof secret!=='string'||secret.length<48||!isIP(ip))throw new Error('Relay configuration unavailable.');
  return {'x-microverse-relay-ip':ip,'x-microverse-relay-at':String(at),'x-microverse-relay-signature':createHmac('sha256',secret).update(payload(method,path,ip,String(at))).digest('hex')};
}
export function verifiedRelayIp(request,secret,{now=Date.now}={}){
  const ip=request.headers.get('x-microverse-relay-ip'),at=request.headers.get('x-microverse-relay-at'),signature=request.headers.get('x-microverse-relay-signature');
  if(!secret||secret.length<48||!isIP(ip||'')||!/^\d{13}$/.test(at||'')||Math.abs(now()-Number(at))>60000||!/^[a-f0-9]{64}$/.test(signature||''))return null;
  const expected=createHmac('sha256',secret).update(payload(request.method,new URL(request.url).pathname,ip,at)).digest('hex');
  return timingSafeEqual(Buffer.from(signature),Buffer.from(expected))?ip:null;
}

// The public Vercel address relays only the existing bounded API. The Meta and
// Baseten keys, job execution and atomic budget stay on the Netlify backend.
export function createVercelRelay({secret,fetchImpl=fetch,now=Date.now}){
  const backend='https://microverse-shahesta.netlify.app';
  const allowed=path=>/^\/api\/(?:creature\/(?:status|generate)|(?:spark|speech|place|narration)\/(?:status|run)|jobs\/[a-f0-9]{48})$/.test(path);
  return async request=>{
    const fail=(message,status)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
    try{
      const url=new URL(request.url),path=allowed(url.pathname)?url.pathname:'/api/'+(url.searchParams.get('route')||'');
      if(!allowed(path)||!['GET','POST'].includes(request.method))return fail('Unknown action.',404);
      const suppliedOrigin=request.headers.get('origin');
      if((request.method==='POST'||suppliedOrigin)&&suppliedOrigin!==url.origin)return fail('Open this action from your Microverse tab.',403);
      if(request.method==='POST'&&request.headers.get('content-type')?.split(';')[0]!=='application/json')return fail('Use a JSON request.',415);
      let body;
      if(request.method==='POST'){
        const reader=request.body?.getReader(),chunks=[];let size=0;if(!reader)return fail('Missing request.',400);
        try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2900000){await reader.cancel();return fail('Please use a smaller image or recording.',413);}chunks.push(value);}}finally{reader.releaseLock();}
        body=Buffer.concat(chunks);
      }
      const ip=request.headers.get('x-vercel-forwarded-for')?.trim();
      if(!ip||!isIP(ip))return fail('Hosting could not verify the network. No AI request was sent.',503);
      const headers=new Headers(signRelay(secret,{method:request.method,path,ip,at:now()}));
      for(const name of ['x-microverse-session','content-type']){const value=request.headers.get(name);if(value)headers.set(name,value);}
      // Never forward Vercel sign-in or other unrelated browser cookies.
      const sessionCookie=request.headers.get('cookie')?.match(/(?:^|;\s*)(__Host-microverse=[^;]+)/)?.[1];
      if(sessionCookie)headers.set('Cookie',sessionCookie);
      if(request.method==='POST')headers.set('Origin',backend);
      const upstream=await fetchImpl(backend+path,{method:request.method,headers,body,redirect:'error',signal:AbortSignal.timeout(25000)});
      const outgoing=new Headers({'Cache-Control':'no-store','Content-Type':upstream.headers.get('content-type')||'application/json','X-Content-Type-Options':'nosniff'});
      const cookie=upstream.headers.getSetCookie().find(value=>value.startsWith('__Host-microverse='));if(cookie)outgoing.set('Set-Cookie',cookie);
      return new Response(upstream.body,{status:upstream.status,headers:outgoing});
    }catch{return fail('The AI service is temporarily unavailable. Prepared stories still work. No automatic retry was made.',503);}
  };
}
