import {execFileSync} from 'node:child_process';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {removeSpriteBackground} from '../src/world/sprite-mask.js';
await mkdir('runtime/spark-heads',{recursive:true});
execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
im=Image.open('runtime/expansion-art/avatar-sheet-v3.png').convert('RGBA');w,h=im.width//2,im.height//2
Path('runtime/spark-heads/size.txt').write_text(str(w)+' '+str(h))
for i in range(4):Path('runtime/spark-heads/'+str(i)+'.raw').write_bytes(im.crop((i%2*w,i//2*h,(i%2+1)*w,(i//2+1)*h)).tobytes())`]);
const [width,height]=(await readFile('runtime/spark-heads/size.txt','utf8')).trim().split(' ').map(Number);for(let i=0;i<4;i++){const raw=await readFile('runtime/spark-heads/'+i+'.raw');await writeFile('runtime/spark-heads/'+i+'-cut.raw',removeSpriteBackground(raw,width,height))}
execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
w,h=map(int,Path('runtime/spark-heads/size.txt').read_text().split())
for i in range(4):
 im=Image.frombytes('RGBA',(w,h),Path('runtime/spark-heads/'+str(i)+'-cut.raw').read_bytes());im=im.crop(im.getbbox());im.thumbnail((460,460));canvas=Image.new('RGBA',(512,512));canvas.alpha_composite(im,((512-im.width)//2,(512-im.height)//2));canvas.save('public/assets/spark-sunny-'+str(i)+'.png')`]);
console.log('Prepared four reviewed Sunny expressions with connected-background removal.');
