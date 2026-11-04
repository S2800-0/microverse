// Explicit authorized public-photo test; one request, no retry, preserve receipts.
import {readFile,writeFile,access} from 'node:fs/promises';
const [name,stage]=process.argv.slice(2);if(!['garden','woodland'].includes(name)||!['plan','build'].includes(stage))throw Error('Choose garden/woodland and plan/build.');
const root=new URL('../runtime/child-journeys-v11/',import.meta.url),receipt=new URL(name+'-'+stage+'.json',root);
try{await access(receipt);throw Error('This test already has a receipt; inspect it before any new request.')}catch(e){if(e.code!=='ENOENT')throw e}
const image='data:image/png;base64,'+(await readFile(new URL(name+'-input.png',root))).toString('base64');
const status=await(await fetch('http://127.0.0.1:8860/api/world-tools/status')).json();if(status.capMicroUsd!==1700000)throw Error('Authorized cap does not match.');
const input={consent:true,image};if(stage==='build')input.plan=JSON.parse(await readFile(new URL(name+'-plan.json',root),'utf8')).plan;
const r=await fetch('http://127.0.0.1:8860/api/world-tools/'+stage,{method:'POST',headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:8860','X-Microverse-Session':status.session},body:JSON.stringify(input),signal:AbortSignal.timeout(540000)});const value=await r.json();
if(stage==='build'&&r.ok){for(const key of ['background','atlas']){await writeFile(new URL(name+'-'+key+'.png',root),Buffer.from(value[key].split(',')[1],'base64'));value[key]=name+'-'+key+'.png'}}
await writeFile(receipt,JSON.stringify({httpStatus:r.status,...value},null,2));console.log(JSON.stringify({name,stage,status:r.status,...(r.ok?{title:value.plan?.title,habitat:value.plan?.habitat}:{error:value.error})}));if(!r.ok)process.exitCode=1;
