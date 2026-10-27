export const VOICE_RATE=24000,VOICE_SECONDS=15,VOICE_RESERVATION=1000;
export const VOICE_MAX_BYTES=44+VOICE_RATE*VOICE_SECONDS*2;
export function encodeVoiceWav(samples){
  if(!(samples instanceof Float32Array)||samples.length<VOICE_RATE*.3||samples.length>VOICE_RATE*VOICE_SECONDS||samples.some(x=>!Number.isFinite(x)))throw new Error('Record between 0.3 and 15 seconds.');
  const bytes=new Uint8Array(44+samples.length*2),view=new DataView(bytes.buffer),word=(offset,s)=>{for(let i=0;i<s.length;i++)bytes[offset+i]=s.charCodeAt(i);};
  word(0,'RIFF');view.setUint32(4,bytes.length-8,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,VOICE_RATE,true);view.setUint32(28,VOICE_RATE*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++){const x=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,Math.round(x*(x<0?32768:32767)),true);}return bytes;
}
export function validateVoiceWav(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.length<44+VOICE_RATE*.3*2||bytes.length>VOICE_MAX_BYTES||(bytes.length-44)%2)throw new Error('Use a short mono PCM question recording.');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),word=(at,n)=>String.fromCharCode(...bytes.slice(at,at+n));
  if(word(0,4)!=='RIFF'||word(8,4)!=='WAVE'||word(12,4)!=='fmt '||word(36,4)!=='data'||view.getUint32(4,true)!==bytes.length-8||view.getUint32(16,true)!==16||view.getUint16(20,true)!==1||view.getUint16(22,true)!==1||view.getUint32(24,true)!==VOICE_RATE||view.getUint32(28,true)!==VOICE_RATE*2||view.getUint16(32,true)!==2||view.getUint16(34,true)!==16||view.getUint32(40,true)!==bytes.length-44)throw new Error('Unsupported WAV encoding. Use the question recorder.');
  let peak=0;for(let i=44;i<bytes.length;i+=2)peak=Math.max(peak,Math.abs(view.getInt16(i,true)));
  if(peak<30)throw new Error('The recording is silent. Check the microphone before sending.');
  return {durationSeconds:(bytes.length-44)/(VOICE_RATE*2)};
}
