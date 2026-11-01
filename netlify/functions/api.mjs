import {getStore} from '@netlify/blobs';
import {createPublicApi} from '../../server/public-api.mjs';

export default async function(request,context){
  try{return await createPublicApi({env:process.env,store:getStore({name:'microverse-public-ai',consistency:'strong'})})(request,{ip:context.ip});}
  catch{return Response.json({enabled:false,reason:'Public AI is not configured. Prepared stories and local tools still work.',error:'Public AI is not configured.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
export const config={path:'/api/*'};
