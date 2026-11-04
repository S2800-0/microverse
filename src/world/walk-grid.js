// Where land animals can walk, read from the colours of the painted map.
// This is a colour rule checked by eye for the saved worlds, not an AI understanding of the scene.
export const GRID_COLS=56,GRID_ROWS=38;
export function validateGround(g){
 if(!g||Object.keys(g).some(k=>!['cols','rows','cells','source'].includes(k))||!Number.isSafeInteger(g.cols)||!Number.isSafeInteger(g.rows)||g.cols<8||g.cols>96||g.rows<8||g.rows>96||typeof g.cells!=='string'||g.cells.length!==g.cols*g.rows||!/^[01]+$/.test(g.cells))throw Error('Review the walkable ground.');
 return {cols:g.cols,rows:g.rows,cells:g.cells,...(typeof g.source==='string'&&g.source.length<80?{source:g.source}:{})};
}
function hsl(r,g,b){const max=Math.max(r,g,b)/255,min=Math.min(r,g,b)/255,l=(max+min)/2,d=max-min,s=d===0?0:d/(1-Math.abs(2*l-1));let h=0;if(d){const R=r/255,G=g/255,B=b/255;h=max===R?((G-B)/d+6)%6:max===G?(B-R)/d+2:(R-G)/d+4;h*=60}return {h,s,l}}
// Sand, soil, dry grass and short pale grass are walkable. Water, deep foliage, beds and pale rock are not.
export function walkablePixel(r,g,b){
 const {h,s,l}=hsl(r,g,b);
 if(b>r+12&&b>=g-8)return false;
 if(l>.86&&s<.18)return false;
 if(l<.3)return false;
 if(h>=22&&h<=62)return l>.45&&s<.75;
 if(h>62&&h<=110)return l>.46&&s<.42;
 return false;
}
// A shady floor has no pale ground at all, so it falls back to: anything that is not water, rock or deep shadow.
export function shadyPixel(r,g,b){const {s,l}=hsl(r,g,b);return !(b>r+12&&b>=g-8)&&!(l>.86&&s<.18)&&l>.2}
export function groundFromPixels(rgba,width,height,options={}){return readGround(rgba,width,height,walkablePixel,.52,options,.2)||readGround(rgba,width,height,shadyPixel,.72,options,.12)}
function readGround(rgba,width,height,test,share,{cols=GRID_COLS,rows=GRID_ROWS},minimum){
 const score=new Float32Array(cols*rows),count=new Uint32Array(cols*rows);
 for(let y=0;y<height;y++){const row=Math.min(rows-1,Math.floor(y/height*rows));for(let x=0;x<width;x++){const col=Math.min(cols-1,Math.floor(x/width*cols)),k=(y*width+x)*4,i=row*cols+col;count[i]++;if(test(rgba[k],rgba[k+1],rgba[k+2]))score[i]++}}
 let open=[...score].map((n,i)=>count[i]&&n/count[i]>share?1:0);
 // Close one-cell gaps so a path broken by a stepping stone stays a path.
 const at=(a,x,y)=>x>=0&&y>=0&&x<cols&&y<rows?a[y*cols+x]:0;
 open=open.map((v,i)=>{const x=i%cols,y=Math.floor(i/cols),around=[[1,0],[-1,0],[0,1],[0,-1]].reduce((n,[dx,dy])=>n+at(open,x+dx,y+dy),0);return v?(around===0?0:1):(around>=3?1:0)});
 // Keep the largest connected area, so nobody is placed on an island they cannot leave.
 const seen=new Int32Array(cols*rows).fill(-1);let best=-1,bestSize=0,label=0;
 for(let start=0;start<open.length;start++){if(!open[start]||seen[start]>=0)continue;const stack=[start];seen[start]=label;let size=0;while(stack.length){const i=stack.pop(),x=i%cols,y=Math.floor(i/cols);size++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows)continue;const j=ny*cols+nx;if(open[j]&&seen[j]<0){seen[j]=label;stack.push(j)}}}if(size>bestSize){bestSize=size;best=label}label++}
 // Too little open ground means the rule misread this painting: walk anywhere rather than trap everyone.
 if(bestSize<cols*rows*minimum)return null;
 return {cols,rows,cells:open.map((v,i)=>v&&seen[i]===best?'1':'0').join(''),source:'painted-map-colours'};
}
export function isWalkable(g,x,y){if(!g)return true;const c=Math.floor(x*g.cols),r=Math.floor(y*g.rows);return c>=0&&r>=0&&c<g.cols&&r<g.rows&&g.cells[r*g.cols+c]==='1'}
function clearLine(g,a,b){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*Math.max(g.cols,g.rows)*2);for(let i=1;i<=steps;i++){const t=i/steps;if(!isWalkable(g,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false}return true}
function nearestOpen(g,col,row){if(g.cells[row*g.cols+col]==='1')return row*g.cols+col;for(let r=1;r<Math.max(g.cols,g.rows);r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const c=col+dx,w=row+dy;if(c>=0&&w>=0&&c<g.cols&&w<g.rows&&g.cells[w*g.cols+c]==='1')return w*g.cols+c}return -1}
// The next point to walk toward: straight there if the way is clear, otherwise the next cell on the shortest route.
export function nextWaypoint(g,from,to){
 if(!g||clearLine(g,from,to))return to;
 const cell=p=>[Math.min(g.cols-1,Math.max(0,Math.floor(p.x*g.cols))),Math.min(g.rows-1,Math.max(0,Math.floor(p.y*g.rows)))],[fc,fr]=cell(from),[tc,tr]=cell(to),start=nearestOpen(g,tc,tr),goal=fr*g.cols+fc;
 if(start<0)return to;
 const prev=new Int32Array(g.cols*g.rows).fill(-1),queue=[start];prev[start]=start;
 for(let q=0;q<queue.length&&prev[goal]<0;q++){const i=queue[q],x=i%g.cols,y=Math.floor(i/g.cols);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=g.cols||ny>=g.rows)continue;const j=ny*g.cols+nx;if(prev[j]>=0||g.cells[j]!=='1')continue;if(dx&&dy&&(g.cells[y*g.cols+nx]!=='1'||g.cells[ny*g.cols+x]!=='1'))continue;prev[j]=i;queue.push(j)}}
 if(prev[goal]<0)return to;
 const next=prev[goal];return {x:(next%g.cols+.5)/g.cols,y:(Math.floor(next/g.cols)+.5)/g.rows};
}
