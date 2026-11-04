import {animalLabel,movementProfile,validateAnimalIdentity} from '../core/creature/identity.js';
export function validateCompanionFile(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG or WebP photo.');
 if(file.size>10*1024*1024)throw Error('Choose a photo under 10 MB.');
}
export function transparencyKind({data,width,height}){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||data?.length!==width*height*4)throw Error('The image pixels could not be checked.');
 let clear=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]<40)clear++;else opaque++}
 if(!opaque)throw Error('This image is empty. Choose a photo with your creature in it.');
 return clear/(width*height)>.08?'cutout':'photo';
}
export async function prepareCompanionImage(src){
 const image=new Image();image.src=src;await image.decode();
 if(image.naturalWidth*image.naturalHeight>36e6)throw Error('Choose a photo under 36 megapixels.');
 const scale=Math.min(1,640/Math.max(image.naturalWidth,image.naturalHeight));
 const raw=document.createElement('canvas');raw.width=Math.max(1,Math.round(image.naturalWidth*scale));raw.height=Math.max(1,Math.round(image.naturalHeight*scale));const rc=raw.getContext('2d',{willReadFrequently:true});rc.drawImage(image,0,0,raw.width,raw.height);
 // Check source transparency before adding any empty letterbox padding.
 const mode=transparencyKind(rc.getImageData(0,0,raw.width,raw.height));
 const square=document.createElement('canvas');square.width=square.height=640;const ctx=square.getContext('2d',{willReadFrequently:true});ctx.drawImage(raw,(640-raw.width)/2,(640-raw.height)/2);
 return {image:square.toDataURL('image/png'),mode,pixels:ctx.getImageData(0,0,640,640)};
}
export function creatureToSave(draft,review,gait='walk'){
 if(!['walk','trot'].includes(gait))throw Error('Choose a supported movement.');
 if(!draft||!draft.species||!review?.approved)throw Error('Review and approve movement before welcoming your creature.');
 const name=(draft.name||'').trim()||'Little friend';
 if(name.length>24)throw Error('Choose a name of up to 24 letters.');
 return {name,species:animalLabel(draft.species),image:draft.image,...(draft.identity?{identity:validateAnimalIdentity(draft.identity)}:{}),...(review.candidate?.config?{rigConfig:{...review.candidate.config,gait}}:{}),...(draft.source?{source:draft.source}:{}),...(draft.poseAtlas?{poseAtlas:draft.poseAtlas}:{})};
}
