// Remove long neutral frame lines in the margins, then flood only connected white.
// Keep the full cell: fixed inset crops can cut a pet's ears off.
export function removeSpriteBackground(source,width,height){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||source.length!==width*height*4)throw Error('Invalid sprite pixels.');const pixels=new Uint8ClampedArray(source),rows=[],cols=[];
 const gray=k=>pixels[k+3]>100&&Math.max(pixels[k],pixels[k+1],pixels[k+2])-Math.min(pixels[k],pixels[k+1],pixels[k+2])<30&&Math.min(pixels[k],pixels[k+1],pixels[k+2])<248;
 for(let y=0;y<height;y++){if(y>height*.14&&y<height*.86)continue;let n=0,total=0;for(let x=Math.floor(width*.05);x<width*.95;x+=4){total++;if(gray((y*width+x)*4))n++}if(n/total>.65)rows.push(y)}
 for(let x=0;x<width;x++){if(x>width*.14&&x<width*.86)continue;let n=0,total=0;for(let y=Math.floor(height*.05);y<height*.95;y+=4){total++;if(gray((y*width+x)*4))n++}if(n/total>.65)cols.push(x)}
 function clear(k){pixels[k]=pixels[k+1]=pixels[k+2]=255;pixels[k+3]=0}
 for(const row of rows)for(let y=Math.max(0,row-1);y<=Math.min(height-1,row+1);y++)for(let x=0;x<width;x++)clear((y*width+x)*4);
 for(const col of cols)for(let x=Math.max(0,col-1);x<=Math.min(width-1,col+1);x++)for(let y=0;y<height;y++)clear((y*width+x)*4);
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
 function add(n){if(n<0||n>=width*height||seen[n])return;seen[n]=1;const k=n*4;if(pixels[k+3]<20||pixels[k]>235&&pixels[k+1]>235&&pixels[k+2]>235){queue[tail++]=n;pixels[k+3]=0}}
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x)}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1)}while(head<tail){const n=queue[head++],x=n%width;if(x)add(n-1);if(x<width-1)add(n+1);add(n-width);add(n+width)}
 return pixels;
}
