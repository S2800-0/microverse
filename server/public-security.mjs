import {createHmac,randomBytes,timingSafeEqual,createCipheriv,createDecipheriv,createHash} from 'node:crypto';

export function publicError(message,status=400){return Object.assign(new Error(message),{publicMessage:message,status});}
export function createPublicSecurity(secret,{now=Date.now}={}){
  if(typeof secret!=='string'||secret.length<48)throw new Error('Configure a strong public session secret.');
  const mac=value=>createHmac('sha256',secret).update(value).digest('hex');
  const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
  const key=createHash('sha256').update(secret).digest();
  function read(request){
    const cookie=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-microverse=([^;]+)/)?.[1];
    if(!cookie||!/^\d{13}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(cookie))return null;
    const [until,id,signature]=cookie.split('.');
    if(Number(until)<=now()||Number(until)>now()+86400000||!equal(signature,mac(`cookie:${until}:${id}`)))return null;
    return {id,token:mac('csrf:public-v1')};
  }
  return {
    hash:mac,
    session(request){const existing=read(request);if(existing)return existing;
      const until=now()+86400000,id=randomBytes(24).toString('hex');
      // Independent status requests may race before the first cookie is set.
      // A deployment-wide CSRF token avoids invalidating other service panels;
      // ownership still comes only from the signed HttpOnly cookie.
      return {id,token:mac('csrf:public-v1'),cookie:`__Host-microverse=${until}.${id}.${mac(`cookie:${until}:${id}`)}; Path=/; Max-Age=86400; Secure; HttpOnly; SameSite=Strict`};
    },
    authorize(request,origin){
      const session=read(request);
      if(request.headers.get('origin')!==origin||!session||!equal(request.headers.get('x-microverse-session'),session.token))throw publicError('Open this action from your Microverse tab.',403);
      return session;
    },
    workerSignature:id=>mac(`worker:${id}`),
    verifyWorker:(id,signature)=>/^[a-f0-9]{48}$/.test(id)&&equal(signature,mac(`worker:${id}`)),
    encrypt(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const body=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),body]).toString('base64');},
    decrypt(value){const bytes=Buffer.from(value,'base64');if(bytes.length<29)throw new Error('Invalid job envelope.');const cipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));cipher.setAuthTag(bytes.subarray(12,28));return JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString());},
  };
}
