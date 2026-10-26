import { createRigReview } from '../../src/motion/rig-review.js';
import { fitQuadruped } from '../../src/motion/rig-fitting.js';
import { drawPuppet } from '../../src/motion/puppet-motion.js';
import { getMotion } from '../../src/motion/motion-library.js';
import { GAITS } from '../../src/motion/rig.js';
import { suggestRig } from '../../src/motion/rig-analysis.js';

const el = id => document.getElementById(id);
const source = el('source'), motion = el('motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reducedMotion.matches, phase = 0, clock = 0, last = 0;
let preview = { status: 'empty' };
let sourceRevision = 0;
const review = createRigReview({ fit: async (...args) => {
  suggestRig(source.getContext('2d').getImageData(0,0,320,320));
  return fitQuadruped(...args);
}, onChange(state) {
  preview = state;
  el('status').textContent = `${state.status}: ${state.reason}`;
  el('accept').disabled = state.status !== 'review';
  el('fallback').disabled = ['empty', 'preparing'].includes(state.status);
  el('pause').disabled = !state.candidate;
} });

function fixture() {
  const ctx = source.getContext('2d'); ctx.clearRect(0,0,320,320);
  if (el('fixture').value === 'opaque') { ctx.fillStyle = '#8ba285'; ctx.fillRect(0,0,320,320); }
  ctx.fillStyle = '#a85b24';
  ctx.fillRect(65,115,175,88); ctx.fillRect(225,75,58,100);
  ctx.beginPath();ctx.moveTo(65,140);ctx.lineTo(25,82);ctx.lineTo(38,151);ctx.closePath();ctx.fill();
  for (const x of [78,110,184,216]) ctx.fillRect(x,185,18,93);
  if (el('fixture').value === 'merged') ctx.fillRect(78,195,50,83);
  // Visible accessory is drawn into the head pixels and stays attached to the body.
  ctx.fillStyle = '#2b2a26';ctx.fillRect(245,97,34,12);ctx.fillRect(237,100,14,4);
  return source.toDataURL('image/png');
}
async function prepare() {
  const ticket = ++sourceRevision;
  review.reset(); phase = 0;
  let src;
  if (el('fixture').value === 'local') {
    try {
      const image = new Image(); image.src = '/test-fixture.png'; await image.decode();
      if (ticket !== sourceRevision) return;
      const ctx=source.getContext('2d');ctx.clearRect(0,0,320,320);
      const scale=Math.min(320/image.naturalWidth,320/image.naturalHeight);
      ctx.drawImage(image,(320-image.naturalWidth*scale)/2,(320-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
      src=source.toDataURL('image/png');
    } catch { if (ticket===sourceRevision) el('status').textContent='Local QA cutout unavailable. Configure MICROVERSE_TEST_SPRITE or choose a synthetic fixture.'; return; }
  } else src = fixture();
  await review.prepare({ source: src, profile: el('profile').value,
    config: { knee: Number(el('knee').value), hindMaxX: .52, minArea: .0008 } });
}
el('prepare').onclick = prepare;
for (const id of ['fixture','profile','knee']) el(id).addEventListener('input', () => { sourceRevision++; review.reset(); if(el('fixture').value!=='local')fixture(); });
el('gait').onchange = () => { phase = 0; review.requestReview(); };
el('accept').onclick = () => review.accept();
el('fallback').onclick = () => review.useFallback();
el('pause').onclick = () => { playing = !playing; el('pause').textContent = playing ? 'Pause motion' : 'Resume motion'; };
reducedMotion.addEventListener('change', event => { playing = !event.matches; el('pause').textContent = playing ? 'Pause motion' : 'Resume motion'; });
el('pause').textContent = playing ? 'Pause motion' : 'Resume motion';
fixture();
function frame(now) {
  const dt = last ? Math.min((now-last)/1000,.05) : 0; last = now;
  if (playing) { phase += dt*(el('gait').value==='trot'?1.5:.8); clock += dt; }
  const ctx = motion.getContext('2d'); ctx.clearRect(0,0,320,320);
  if (preview.candidate) {
    ctx.save();ctx.translate(160,285);
    const gait = el('gait').value;
    drawPuppet(ctx,preview.candidate.rig,{size:290,phase,moving:true,preset:getMotion(el('profile').value,gait),phases:GAITS[gait].phase,clock});
    ctx.restore();
  } else if (preview.status==='fallback') {
    ctx.save();ctx.translate(playing?Math.sin(clock)*6:0,0);ctx.drawImage(source,0,0);ctx.restore();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
