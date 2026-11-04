import {createNewNeighbour} from './new-neighbour.mjs';
import {createWorldCommand} from './world-command.mjs';
import {readFileSync} from 'node:fs';
import {expansionAccess,EXPANSION_LEDGER} from './expansion-access.mjs';
import {randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {pngDimensions} from '../src/core/creature/contract.js';
import {createNaturalVoice} from './earlier-app/server/natural-voice.mjs';
import {createAvatarPainter} from './avatar.mjs';
import {createWorldAnswer} from './world-answer.mjs';
import {createWorldGenerator} from './world-generation.mjs';
import {createPoseSheet} from './pose-sheet.mjs';
import {createBudget} from './credit-budget.mjs';
import {createSparkProvider} from './earlier-app/server/spark-provider.mjs';
import {createSparkService} from './earlier-app/server/spark-service.mjs';
export function landscapePrompt(kind){
 const place={garden:'a garden with flowers, fruit trees, a small pond and open grass',woodland:'a woodland clearing with ferns, broadleaf trees and a stream',reef:'a tropical island above clear water, with corals and reef fish below the surface'}[kind];
 if(!place)throw Error('Choose garden, woodland or reef.');
 return `Turn reference 1 into an original watercolor storybook game landscape of ${place}. ${kind==='reef'?'Preserve the recognizable composition, landforms, horizon and relative water/land placement of reference 1.':'Use reference 1 for plant character, colors and mood. Use reference 2 as the strict top-down playable map layout: preserve all stream banks, boulders, woodland boundaries and open paths. Render from the same overhead camera, not the reference photo camera. No animals.'} Soft deliberate pigment, readable shapes, natural greens and turquoise, warm paper texture, no text, UI, logos or invented measured labels. A painted interpretation, not a survey or scientific reconstruction. For reef, do not put land animals underwater. Produce one complete landscape.`;
}
export function worldToolsPlugin(){
 const {env,permit,cap:localCap,enabled,remaining}=expansionAccess();
 const accessAllowed=()=>enabled&&expansionAccess().enabled;
 const budget=createBudget({path:EXPANSION_LEDGER,capMicroUsd:enabled?localCap:0,reservationMicroUsd:50000});
 const spark=createSparkService({enabled,creditsConfirmed:enabled,provider:createSparkProvider({provider:'meta',apiKey:env.MODEL_API_KEY}),budget});
 const localVoice=createNaturalVoice({enabled:true});
 const avatars=createAvatarPainter({apiKey:env.MODEL_API_KEY,budget}),worldAnswers=createWorldAnswer({apiKey:env.MODEL_API_KEY,budget});
 const neighbours=createNewNeighbour({apiKey:env.MODEL_API_KEY,budget});
 const commands=createWorldCommand({apiKey:env.MODEL_API_KEY,budget});
 const generator=createWorldGenerator({apiKey:env.MODEL_API_KEY,budget});
 const poseSheets=createPoseSheet({apiKey:env.MODEL_API_KEY,budget});
 const token=randomBytes(24).toString('hex'),cache=new Map();let active=false;

 return {name:'microverse-local-world-tools',configureServer(server){server.middlewares.use(async(req,res,next)=>{
  const path=new URL(req.url,'http://localhost').pathname;if(!path.startsWith('/api/world-tools/'))return next();
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data))};
  if(req.method==='GET'&&path==='/api/world-tools/status'){let reserved=localCap;try{reserved=JSON.parse(readFileSync(new URL('../runtime/expansion-art/budget.json',import.meta.url),'utf8')).reservedMicroUsd}catch{}const remainingMicroUsd=Math.max(0,localCap-reserved);return send(200,{enabled:accessAllowed(),localVoiceEnabled:localVoice.status().enabled,canPlan:accessAllowed()&&remainingMicroUsd>=250000,canBuild:accessAllowed()&&remainingMicroUsd>=200000,remainingMicroUsd,session:token,provider:'Meta Muse Spark',imageProvider:'Meta Muse Image',capMicroUsd:permit.capMicroUsd||0})}
  const host=req.headers.host,session=req.headers['x-microverse-session'];
  if(req.method!=='POST'||!/^((127\.0\.0\.1)|(localhost)):\d+$/.test(host||'')||req.headers.origin!==`http://${host}`||typeof session!=='string'||session.length!==token.length||!timingSafeEqual(Buffer.from(session),Buffer.from(token)))return send(403,{error:'Open this feature in the local preview.'});
  if(!accessAllowed()&&path!=='/api/world-tools/speak')return send(403,{error:'Live AI is paused. Saved worlds and prepared questions still work.'});
  try{
   let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>3000000)return send(413,{error:'Choose a smaller photo or question.'});chunks.push(c)}const input=JSON.parse(Buffer.concat(chunks).toString());
   if(path==='/api/world-tools/speak')return send(200,await localVoice.run(input));
   if(path==='/api/world-tools/avatar'){if(remaining()<100000)throw Error('The shared AI test allowance is used. Choose a saved guide or keep your photo preview.');return send(200,await avatars.run(input))}
   if(path==='/api/world-tools/new-neighbour'){if(remaining()<100000)throw Error('The allowance cannot cover a new neighbour. Existing world actions still work.');const abort=new AbortController();res.once('close',()=>{if(!res.writableEnded)abort.abort()});return send(200,await neighbours.run(input,{signal:abort.signal}))}
   if(path==='/api/world-tools/creature-poses'){if(remaining()<50000)throw Error('The shared allowance cannot cover drawn poses. Their painting can still move.');const abort=new AbortController();res.once('close',()=>{if(!res.writableEnded)abort.abort()});return send(200,await poseSheets.run(input,{signal:abort.signal}))}
   if(path==='/api/world-tools/command'){if(remaining()<50000)throw Error('The shared AI allowance is used. Prepared world actions still work.');return send(200,await commands.run(input))}
   if(path==='/api/world-tools/world-answer'){if(remaining()<50000)throw Error('The shared AI test allowance is used. Prepared questions still work.');return send(200,await worldAnswers.run(input))}
   if(path==='/api/world-tools/plan'){if(remaining()<300000)throw Error('The shared allowance cannot cover another complete world. Saved worlds still work.');return send(200,await generator.run('plan',input))}
   if(path==='/api/world-tools/build'){if(remaining()<250000)throw Error('The shared allowance cannot cover these layers. Saved worlds still work.');const abort=new AbortController();res.once('close',()=>{if(!res.writableEnded)abort.abort()});return send(200,await generator.run('build',input,{signal:abort.signal}))}
   if(path==='/api/world-tools/ask')return send(200,await spark.run({...input,operation:'guide'}));
   if(path!=='/api/world-tools/paint')return send(404,{error:'Feature not found.'});
   if(input.consent!==true||Object.keys(input).some(k=>!['consent','image','kind'].includes(k))||!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(input.image||''))throw Error('Choose to send a smaller photo first.');
   pngDimensions(input.image,640);
   const prompt=landscapePrompt(input.kind),references=[{image_url:input.image}];if(input.kind!=='reef')references.push({image_url:'data:image/webp;base64,'+readFileSync(new URL('../public/assets/forest-original-2048.webp',import.meta.url)).toString('base64')});const key=createHash('sha256').update(input.kind+input.image).digest('hex');if(cache.has(key))return send(200,{...cache.get(key),cached:true});
   if(active)throw Error('One world is already being painted.');active=true;
   try{await budget.reserve(key);
    const r=await fetch('https://api.meta.ai/v1/images/edits',{method:'POST',redirect:'error',signal:AbortSignal.timeout(240000),headers:{Authorization:'Bearer '+env.MODEL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'muse-image-1.0',images:references,prompt,n:1,size:'1536x1024',output_format:'png',response_format:'b64_json',reasoning_strength:'low',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}})});
    if(!r.ok){await r.body?.cancel();throw Error('The painting did not finish. No automatic retry was made.')}
    const d=await r.json();if(d.data?.length!==1||typeof d.data[0].b64_json!=='string'||d.data[0].b64_json.length>12000000)throw Error('The painting could not be opened.');
    const value={image:'data:image/png;base64,'+d.data[0].b64_json,provider:'Meta Muse Image',kind:input.kind,cached:false};
    if(input.kind==='reef'){
     try{await budget.reserve(createHash('sha256').update(key+'-pale').digest('hex'));
      const p=await fetch('https://api.meta.ai/v1/images/edits',{method:'POST',redirect:'error',signal:AbortSignal.timeout(240000),headers:{Authorization:'Bearer '+env.MODEL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'muse-image-1.0',images:[{image_url:value.image}],prompt:'Edit this exact watercolor landscape. Change ONLY the coral colonies below water to pale ivory-white to illustrate bleaching. Keep the island, horizon, waterline, fish, rocks and ALL geometry and positions identical. Preserve coral shape; pale does not mean dead. No text, UI, new animals or other changes.',n:1,size:'1536x1024',output_format:'png',response_format:'b64_json',reasoning_strength:'low',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}})});
      if(!p.ok){await p.body?.cancel();throw Error('Pale version unavailable')};const pd=await p.json();if(pd.data?.length!==1||typeof pd.data[0].b64_json!=='string'||pd.data[0].b64_json.length>12000000)throw Error('Invalid pale version');value.paleImage='data:image/png;base64,'+pd.data[0].b64_json;
     }catch{value.paleUnavailable=true}
    }
    if(cache.size>=3)cache.delete(cache.keys().next().value);cache.set(key,value);return send(200,value);
   }finally{active=false}
  }catch(e){return send(400,{error:e.publicMessage||e.message||'That request did not finish. Prepared examples still work.'})}
 })}};
}
