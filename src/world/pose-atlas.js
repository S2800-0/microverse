import {cutAtlas,cutPoseGrid} from './sprites.js';
// Keep one common scale and grounded baseline across poses. Tight crops alone
// would make the body grow and shrink whenever a tail or wing changes width.
const cache=new Map();
export async function cutPoseAtlas(source){if(cache.has(source))return cache.get(source);const job=cutAtlas(source,4).then(images=>{const width=Math.max(...images.map(i=>i.width)),height=Math.max(...images.map(i=>i.height));return images.map(image=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,(width-image.width)/2,height-image.height);return canvas})}).catch(e=>{cache.delete(source);throw e});if(cache.size>=3)cache.delete(cache.keys().next().value);cache.set(source,job);return job}
// A new visitor sheet: three across, two down. neutral, step A, step B / eat, sleep, run.
export async function cutVisitorSheet(source){const cells=await cutPoseGrid(source,3,2),base=cells[0];if(!base||!cells[1]||!cells[2])throw Error('This visitor did not paint clearly.');const named={};if(cells[3])named.eat=cells[3];if(cells[4])named.sleep=cells[4];if(cells[5])named.runA=cells[5];return {walk:[base,cells[1],cells[2]],named}}
