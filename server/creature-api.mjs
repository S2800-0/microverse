import {randomBytes,timingSafeEqual} from 'node:crypto';

export function createCreatureApi(pipeline,{prefix='/api/creature',action='generate',maxBytes=2900000,errorMessage}={}){
  const session=randomBytes(24).toString('hex');
  function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
  return async(req,res,path)=>{
    const host=req.headers.host;
    if(typeof host!=='string'||!/^(127\.0\.0\.1|localhost):\d+$/.test(host)){send(res,403,{error:'Use the local application address.'});return;}
    if(path===`${prefix}/status`&&req.method==='GET'){send(res,200,{...pipeline.status(),session});return;}
    if(path!==`${prefix}/${action}`||req.method!=='POST'){send(res,404,{error:'Unknown local route.'});return;}
    const token=req.headers['x-microverse-session'];
    if(req.headers.origin!==`http://${host}`||typeof token!=='string'||! /^[0-9a-f]{48}$/.test(token)||!timingSafeEqual(Buffer.from(token),Buffer.from(session))){send(res,403,{error:'Open this request from the local application.'});return;}
    if(req.headers['content-type']!=='application/json'){send(res,415,{error:'Use a JSON request.'});return;}
    if(!pipeline.status().enabled){send(res,503,{error:pipeline.status().reason});return;}
    try{
      req.setTimeout(10000,()=>req.destroy());let size=0;const chunks=[];
      for await(const chunk of req){size+=chunk.length;if(size>maxBytes){send(res,413,{error:'The local request exceeds its size limit.'});return;}chunks.push(chunk);}
      req.setTimeout(0);
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{send(res,400,{error:'Invalid request JSON.'});return;}
      const result=await pipeline.run(body);if(!res.destroyed)send(res,200,result);
    }catch(error){if(!res.destroyed)send(res,400,{error:error.publicMessage||errorMessage||'The creature could not be prepared. No automatic retry was made; the reserved amount remains in the local budget.'});}
  };
}
