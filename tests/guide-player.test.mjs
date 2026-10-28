import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGuidePlayer} from '../src/motion/guide-player.js';
function fixture(){let id=0;const pending=new Map(),poses=[];const player=createGuidePlayer({render:p=>poses.push(p),schedule:(fn,delay)=>{pending.set(++id,{fn,delay});return id;},cancel:id=>pending.delete(id)});return {player,pending,poses,tick(){const [id,{fn,delay}]=pending.entries().next().value;pending.delete(id);fn();return delay;}};}
test('guide makes no background timers until visible and stops when hidden or destroyed',()=>{
 const f=fixture();f.player.greet();assert.equal(f.pending.size,0);f.player.setVisible(true);assert.equal(f.pending.size,1);assert.equal(f.tick(),3200);assert.equal(f.poses.at(-1),'blink');assert.equal(f.tick(),140);assert.equal(f.poses.at(-1),'attentive');
 f.player.setVisible(false);assert.equal(f.pending.size,0);f.player.greet();assert.equal(f.pending.size,0);f.player.setVisible(true);f.player.destroy();assert.equal(f.pending.size,0);f.player.greet();assert.equal(f.pending.size,0);
});
test('a greeting has bounded mouth motion and pause cancels it without silently resuming speech',()=>{
 const f=fixture();f.player.setVisible(true);f.player.greet();assert.equal(f.poses.at(-1),'speaking');for(let i=0;i<16;i++)assert.equal(f.tick(),180);assert.equal(f.poses.at(-1),'attentive');assert.equal(f.pending.size,1);
 f.player.greet();f.player.setPaused(true);assert.equal(f.poses.at(-1),'attentive');assert.equal(f.pending.size,0);f.player.greet();assert.equal(f.pending.size,0);f.player.setPaused(false);assert.equal(f.tick(),3200);assert.equal(f.poses.at(-1),'blink');f.player.destroy();
});
