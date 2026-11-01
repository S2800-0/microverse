import {getStore} from '@netlify/blobs';
import {runPublicJob} from '../../server/public-api.mjs';
export default async function(request){
  try{await runPublicJob({request,env:process.env,store:getStore({name:'microverse-public-ai',consistency:'strong'})});}
  catch{console.error('AI background task stopped; no provider retry was made.');}
}
export const config={background:true};
