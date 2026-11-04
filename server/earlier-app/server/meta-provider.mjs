import {parseImageStream,recordsOfKind,decodeMaskToRaster} from '@meta-sam/parser';
import {buildSpritePrompt} from '../src/motion/motion-library.js';
import {pngDimensions,validateMask,segmentationTarget} from '../src/creature/contract.js';

// Fixed official destination; neither the browser nor provider output supplies URLs.
const BASE='https://api.meta.ai/v1';
async function readJson(response,max=16_000_000){
  if(!response.ok){await response.body?.cancel();throw new Error(`Meta request failed (HTTP ${response.status}). No automatic retry was made.`);}
  let size=0;const chunks=[];
  for await(const chunk of response.body){size+=chunk.length;if(size>max)throw new Error('Meta response exceeded the size limit.');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw new Error('Meta returned an invalid response.');}
}
export async function parseSamMasks(response,width,height,{maxMatches=24}={}){
  if(response?.status!=='completed'||!Array.isArray(response.output))throw new Error('SAM did not complete.');
  const parts=response.output.flatMap(item=>item.type==='message'&&Array.isArray(item.content)?item.content:[]);
  if(parts.some(p=>p.type==='refusal'))throw new Error('SAM declined this image.');
  const texts=parts.filter(p=>p.type==='output_text');
  if(response.output.length===0||(texts.length===1&&texts[0].text===''))return [];
  if(texts.length!==1||typeof texts[0].text!=='string'||texts[0].text.length>8_000_000)throw new Error('SAM returned no usable segmentation.');
  const lane={item_id:'single-image',output_index:0,content_index:0};
  async function* events(){
    yield {type:'response.output_text.delta',...lane,delta:texts[0].text};
    yield {type:'response.output_text.done',...lane,text:texts[0].text};
    yield {type:'response.completed'};
  }
  const parsed=await parseImageStream(events()).finalResult;
  if(parsed.outcome.status!=='completed'||parsed.diagnostics.length)throw new Error('SAM returned incomplete or malformed segmentation.');
  const matches=recordsOfKind(parsed.records,'mask');
  if(!matches.length||matches.length>maxMatches)throw new Error('SAM returned no structured masks or too many objects.');
  return matches.map(record=>{
  if(record.mask.width*record.mask.height>4_194_304)throw new Error('SAM mask exceeds the processing limit.');
  const raster=decodeMaskToRaster(record.mask);
  const mask={width:record.mask.width,height:record.mask.height,bounds:record.bounds,data:Buffer.from(raster).toString('base64')};
  validateMask(mask,width,height);return mask;});
}
export async function parseSamResponse(response,width,height){
  const masks=await parseSamMasks(response,width,height);
  if(masks.length!==1)throw new Error(masks.length?'More than one animal was found. Choose a single-animal image.':'No animal was found. Keep the source image or choose another.');
  return masks[0];
}
export function createMetaProvider({apiKey,fetchImpl=fetch}){
  async function post(path,body,signal){
    // Native fetch performs no application-level retries; redirects are refused.
    const response=await fetchImpl(BASE+path,{method:'POST',redirect:'error',signal,
      headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
    return readJson(response);
  }
  return {
    async paint(input,signal){
      const result=await post('/images/edits',{model:'muse-image-1.0',images:[{image_url:input.image}],
        prompt:buildSpritePrompt({profile:input.profile,appearance:input.appearance}),n:1,
        output_format:'png',response_format:'b64_json',size:'1536x1024',reasoning_strength:'low',
        tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}},signal);
      if(result?.data?.length!==1||typeof result.data[0].b64_json!=='string')throw new Error('Meta returned no single illustration.');
      const image=`data:image/png;base64,${result.data[0].b64_json}`;pngDimensions(image);return image;
    },
    async segment(image,profile,signal,appearance=''){
      const {width,height}=pngDimensions(image);
      const response=await post('/responses',{model:'sam-3.1',store:false,stream:false,
        input:[{type:'message',role:'user',content:[{type:'input_text',text:segmentationTarget(profile,appearance)},{type:'input_image',image_url:image}]}],
        metadata:{mask_encoding:'one_bit'}},signal);
      return parseSamResponse(response,width,height);
    },
    async segmentPlace(image,target,signal){
      if(!['grass','tree','water'].includes(target))throw new Error('Unsupported place label.');
      const {width,height}=pngDimensions(image,640);
      const response=await post('/responses',{model:'sam-3.1',store:false,stream:false,input:[{type:'message',role:'user',content:[{type:'input_text',text:target},{type:'input_image',image_url:image}]}],metadata:{mask_encoding:'one_bit'}},signal);
      return parseSamMasks(response,width,height);
    },
  };
}
