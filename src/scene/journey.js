// Scroll choreography for the illustrated introduction, independent of the ecosystem.
export function journeyFrame(progress){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
  return {progress:p,chapter:p<.28?0:p<.68?1:2,camera:1.025+p*.17,foregroundCamera:1.025+p*.31,foregroundShift:p*3.5,foxLeft:48+p*14,weather:p>=.28&&p<.68?'dry':'spring'};
}
