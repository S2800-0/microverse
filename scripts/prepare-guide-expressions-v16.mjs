import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {removeSpriteBackground} from '../src/world/sprite-mask.js';
for(const id of ['fox','clover']){
 execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
im=Image.open('runtime/guide-v16/${id}-sheet.png').convert('RGBA');w,h=im.width//2,im.height//2
Path('runtime/guide-v16/${id}-size.txt').write_text(str(w)+' '+str(h))
for i in range(4):Path('runtime/guide-v16/${id}-'+str(i)+'.raw').write_bytes(im.crop((i%2*w,i//2*h,(i%2+1)*w,(i//2+1)*h)).tobytes())`]);
 const [w,h]=(await readFile(`runtime/guide-v16/${id}-size.txt`,'utf8')).split(' ').map(Number);
 for(let i=0;i<4;i++)await writeFile(`runtime/guide-v16/${id}-${i}-cut.raw`,removeSpriteBackground(await readFile(`runtime/guide-v16/${id}-${i}.raw`),w,h));
 execFileSync('python3',['-c',`from PIL import Image
from pathlib import Path
w,h=map(int,Path('runtime/guide-v16/${id}-size.txt').read_text().split())
frames=[Image.frombytes('RGBA',(w,h),Path('runtime/guide-v16/${id}-'+str(i)+'-cut.raw').read_bytes()) for i in range(4)]
boxes=[im.getbbox() for im in frames]
box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
for i,im in enumerate(frames):
 im=im.crop(box);im.thumbnail((464,464),Image.Resampling.LANCZOS);out=Image.new('RGBA',(512,512));out.alpha_composite(im,((512-im.width)//2,(512-im.height)//2));out.save('public/assets/spark-${id}-'+str(i)+'.png')`]);
}
console.log('Prepared matched transparent front-facing guide expression frames.');
