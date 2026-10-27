import{createHash}from'node:crypto';
import{PLACE_LABELS,PLACE_RESERVATION,validatePlaceInput,unionMasks,decodePlaceLayers}from'../src/place/contract.js';
import{pngDimensions}from'../src/creature/contract.js';
export function createPlaceService({enabled=false,creditsConfirmed=false,provider,budget}){
  const ready=enabled&&creditsConfirmed&&!!provider&&!!budget,cache=new Map();let active=false;
  return {status:()=>({enabled:!!ready,reservationMicroUsd:PLACE_RESERVATION,reason:ready?'Three SAM image-label checks, then your review. No generated map or habitat diagnosis.':'Place inference is paused. You can review a photo and choose model inputs manually.'}),async run(input){
    validatePlaceInput(input);if(!ready)throw new Error('Place inference is paused.');const sourceHash=createHash('sha256').update(input.image).digest('hex');if(cache.has(sourceHash))return {...structuredClone(cache.get(sourceHash)),cached:true};if(active)throw new Error('A place photo is already being analysed.');active=true;
    try{await budget.reserve(sourceHash);const {width,height}=pngDimensions(input.image,640),layers=[];const signal=AbortSignal.timeout(180000);
      for(const key of PLACE_LABELS){const masks=await provider.segmentPlace(input.image,key,signal);const union=unionMasks(masks,width,height);layers.push({key,objects:masks.length,data:Buffer.from(union).toString('base64')});}
      const measured=decodePlaceLayers(width,height,layers),result={version:1,provider:'Meta SAM 3.1',sourceHash,width,height,layers,coverage:measured.coverage,overlapFraction:measured.overlapFraction,unclassified:measured.unclassified,cached:false};
      if(cache.size>=4)cache.delete(cache.keys().next().value);cache.set(sourceHash,structuredClone(result));return result;
    }finally{active=false;}
  }};
}
