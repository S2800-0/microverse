import{mkdir,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../runtime/kokoro-model/',import.meta.url));
const revision='1939ad2a8e416c0acfeecc08a694d14ef25f2231';
await mkdir(root+'onnx',{recursive:true,mode:0o700});const files=[];
for(const file of ['config.json','tokenizer.json','tokenizer_config.json','onnx/model_quantized.onnx']){
 const response=await fetch(`https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/${revision}/${file}`,{signal:AbortSignal.timeout(180000)});if(!response.ok)throw Error(`Model asset HTTP ${response.status}`);
 let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>100_000_000)throw Error('Model asset size limit.');chunks.push(chunk);}const bytes=Buffer.concat(chunks);await writeFile(root+file,bytes,{mode:0o600});files.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});console.log(`Saved ${file}: ${bytes.length} bytes.`);
}
await writeFile(root+'download-manifest.json',JSON.stringify({model:'onnx-community/Kokoro-82M-v1.0-ONNX',revision,files},null,2),{mode:0o600});
console.log('Local model ready. Set MICROVERSE_LOCAL_VOICE_ENABLED=1 for preview:meta. Runtime speech makes no network calls.');
