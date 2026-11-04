import {readFile,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:8860',status=await(await fetch(base+'/api/world-tools/status')).json();
const image='data:image/png;base64,'+(await readFile('runtime/expansion-art/island-api-test-input.png')).toString('base64');
const r=await fetch(base+'/api/world-tools/paint',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,'X-Microverse-Session':status.session},body:JSON.stringify({image,kind:'reef',consent:true})});const d=await r.json();
if(d.image)await writeFile('runtime/expansion-art/paint-api-island.png',Buffer.from(d.image.split(',')[1],'base64'));
if(d.paleImage)await writeFile('runtime/expansion-art/paint-api-island-pale.png',Buffer.from(d.paleImage.split(',')[1],'base64'));
const report={http:r.status,provider:d.provider,cached:d.cached,hasPainting:!!d.image,hasMatchingPale:!!d.paleImage,paleUnavailable:d.paleUnavailable||false,error:d.error};await writeFile('runtime/expansion-art/paint-api-smoke.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
