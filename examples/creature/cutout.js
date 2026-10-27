import {composeCreatureCutout} from '/src/creature/client.js';
const source=document.createElement('canvas');source.width=320;source.height=200;
const ctx=source.getContext('2d');ctx.fillStyle='#eeeeee';ctx.fillRect(0,0,320,200);
ctx.fillStyle='#ae563e';ctx.fillRect(100,60,120,80);ctx.fillStyle='#356d99';ctx.fillRect(130,40,60,20);
document.getElementById('fixture').getContext('2d').drawImage(source,0,60);
try{
  const bytes=new Uint8Array(120*100);
  for(let y=0;y<100;y++)for(let x=0;x<120;x++)bytes[y*120+x]=(y>=20||(x>=30&&x<90))?1:0;
  const mask={width:120,height:100,bounds:{left:100,top:40,right:220,bottom:140},data:btoa(String.fromCharCode(...bytes))};
  const result=await composeCreatureCutout({image:source.toDataURL('image/png'),mask});
  const image=new Image();image.src=result;await image.decode();
  const canvas=document.getElementById('output'),out=canvas.getContext('2d',{willReadFrequently:true});out.drawImage(image,0,0);
  const alpha=(x,y)=>out.getImageData(x,y,1,1).data[3],rgb=(x,y)=>[...out.getImageData(x,y,1,1).data].slice(0,3);
  const checks=[image.width===640&&image.height===640,alpha(0,0)===0,alpha(20,320)===0,alpha(220,280)===255,alpha(320,220)===255,
    rgb(220,280).join(',')==='174,86,62',rgb(320,220).join(',')==='53,109,153'];
  if(!checks.every(Boolean))throw new Error('Unexpected crop, resize, color or alpha pixels.');
  document.getElementById('result').textContent='PASS · all seven pixel checks: 640-square PNG, transparent background, offset mask, source colors and blue accessory retained.';
}catch(error){document.getElementById('result').textContent=`FAIL · ${error.message}`;}
