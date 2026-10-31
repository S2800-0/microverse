import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';

const root=fileURLToPath(new URL('..',import.meta.url));
export function createPreviewServer({ motion=false, testSprite=process.env.MICROVERSE_TEST_SPRITE,creatureApi,sparkApi,speechApi,narrationApi,placeApi }={}) {
  return createServer(async(req,res)=>{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path.startsWith('/api/creature/')&&creatureApi){await creatureApi(req,res,path);return;}
    if(path.startsWith('/api/spark/')&&sparkApi){await sparkApi(req,res,path);return;}
    if(path.startsWith('/api/speech/')&&speechApi){await speechApi(req,res,path);return;}
    if(path.startsWith('/api/narration/')&&narrationApi){await narrationApi(req,res,path);return;}
    if(path.startsWith('/api/place/')&&placeApi){await placeApi(req,res,path);return;}
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end('Not found');return;}
    let file;
    if(path==='/')file=motion?'examples/motion/index.html':'app/index.html';
    else if(path==='/discovery.html')file='app/discovery.html';
    else if(path==='/discovery.css')file='app/discovery.css';
    else if(path==='/forest-story.html')file='app/forest-story.html';
    else if(path==='/forest-story.css')file='app/forest-story.css';
    else if(/^\/entrance\/[a-z-]+\.(png|webp|jpg|json)$/.test(path))file=`public${path}`;
    else if(path==='/entrance.css')file='app/entrance.css';
    else if(path==='/behind.html')file='app/behind.html';
    else if(path==='/build-with.html')file='app/build-with.html';
    else if(path==='/storyboard.html')file='app/storyboard.html';
    else if(path==='/art-review.html')file='app/art-review.html';
    else if(path==='/meta-art.css')file='app/meta-art.css';
    else if(path==='/meta-art/manifest.json')file='public/meta-art/manifest.json';
    else if(path==='/meta-art/adoption.json')file='public/meta-art/adoption.json';
    else if(path==='/meta-art/rig-review.json')file='public/meta-art/rig-review.json';
    else if(/^\/meta-art\/[a-z-]+\.png$/.test(path))file=`public${path}`;
    else if(path==='/storyboard.css')file='app/storyboard.css';
    else if(path==='/journey.css')file='app/journey.css';
    else if(/^\/intro\/(forest|fox|clean-plate|foreground-left|foreground-right|fox-walk|fox-poster)\.png$/.test(path))file=`public${path}`;
    else if(path==='/forest.css')file='app/forest.css';
    else if(path==='/teacher.html')file='app/teacher.html';
    else if(path==='/places/garden-pond-analysis.json')file='public/places/garden-pond-analysis.json';
    else if(path==='/test-fixture.png'&&testSprite)file=testSprite;
    else if(/^\/examples\/(motion|forest|creature)\/[a-z-]+\.(html|js)$/.test(path)||/^\/src\/(motion|sim|scene|creature|investigation|voice|place)\/[a-z-]+\.(js|ts)$/.test(path))file=`.${path}`;
    else if(/^\/(animals|maps|places)\/[a-z-]+\.png$/.test(path))file=`public${path}`;
    else {res.writeHead(404);res.end('Not found');return;}
    try{
      let data=await readFile(resolve(root,file));
      const extension=extname(file);
      if(extension==='.ts')data=stripTypeScriptTypes(data.toString());
      const contentType={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.ts':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json'}[extension];
      res.writeHead(200,{'Content-Type':contentType,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
    }catch{res.writeHead(404);res.end('Not found');}
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=createPreviewServer({motion:process.argv.includes('--motion')});
  server.listen(Number(process.env.PORT??8895),'127.0.0.1',()=>console.log(`Microverse preview: http://127.0.0.1:${server.address().port}/`));
}
