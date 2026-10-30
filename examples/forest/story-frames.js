const observer=new ResizeObserver(entries=>{for(const entry of entries)entry.target.querySelector('iframe').style.transform=`scale(${entry.contentRect.width/960})`;});
for(const frame of document.querySelectorAll('.frame-view'))observer.observe(frame);
addEventListener('pagehide',()=>observer.disconnect());
