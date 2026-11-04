import {execFileSync} from 'node:child_process';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {removeSpriteBackground} from '../src/world/sprite-mask.js';
const root='runtime/child-journeys-v11/layer-cuts';await mkdir(root,{recursive:true});
execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
r=Path('${root}')
for name in ['owl-flight','woodland-props','base-neighbours']:
 im=Image.open('runtime/child-journeys-v11/'+name+'-atlas.png').convert('RGBA');w,h=im.width//2,im.height//2
 (r/(name+'-size.txt')).write_text(str(w)+' '+str(h))
 for i in range(4 if name!='base-neighbours' else 2):(r/(name+'-'+str(i)+'.raw')).write_bytes(im.crop((i%2*w,i//2*h,(i%2+1)*w,(i//2+1)*h)).tobytes())`]);
for(const name of ['owl-flight','woodland-props','base-neighbours']){const [w,h]=(await readFile(root+'/'+name+'-size.txt','utf8')).split(' ').map(Number);for(let i=0;i<(name==='base-neighbours'?2:4);i++){const pixels=await readFile(root+'/'+name+'-'+i+'.raw');await writeFile(root+'/'+name+'-'+i+'-cut.raw',removeSpriteBackground(pixels,w,h));}}
execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
r=Path('${root}')
for name in ['owl-flight','woodland-props','base-neighbours']:
 w,h=map(int,(r/(name+'-size.txt')).read_text().split())
 for i in range(4 if name!='base-neighbours' else 2):
  im=Image.frombytes('RGBA',(w,h),(r/(name+'-'+str(i)+'-cut.raw')).read_bytes());im=im.crop(im.getbbox());im.save('public/assets/'+name+'-'+str(i)+'-v11.png')
# Add the two new fish to unused cells. Keep existing cell coordinates unchanged.
for kind,new in [('garden','base-neighbours-0-v11.png'),('reef','base-neighbours-1-v11.png')]:
 src='public/assets/'+('garden-neighbours-v11.png' if kind=='garden' else 'reef-live-neighbours-v8.png')
 atlas=Image.open(src).convert('RGBA');w,h=atlas.width//2,atlas.height//2;cell=Image.new('RGBA',(w,h),'white');im=Image.open('public/assets/'+new);im.thumbnail((int(w*.7),int(h*.7)));cell.alpha_composite(im,((w-im.width)//2,(h-im.height)//2));atlas.paste(cell,(w,h));atlas.save('public/assets/'+kind+'-neighbours-v12.png')
atlas=Image.open('public/assets/woodland-neighbours-v11.png').convert('RGBA');w,h=atlas.width//2,atlas.height//2;cell=Image.new('RGBA',(w,h),'white');fox=Image.open('public/assets/fox-walk.webp').crop((0,0,384,320)).convert('RGBA');fox=fox.crop(fox.getbbox());fox.thumbnail((int(w*.75),int(h*.75)));cell.alpha_composite(fox,((w-fox.width)//2,(h-fox.height)//2));atlas.paste(cell,(w,h));atlas.save('public/assets/woodland-neighbours-v12.png')`]);
console.log('Cut reviewed flight, canopy/trunk, vegetation and neighbour layers without inference.');
