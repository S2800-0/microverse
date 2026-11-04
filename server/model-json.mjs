// Reasoning tokens share the output limit. Never retry truncated replies.
export function modelJson(response,label='Spark'){
 const choice=response?.choices?.[0],content=choice?.message?.content;
 if(choice?.finish_reason==='length')throw Error(label+' reached its reply limit before finishing. No automatic retry was made.');
 if(typeof content!=='string'||!content.trim())throw Error(label+' did not return a complete reply. No automatic retry was made.');
 try{return JSON.parse(content)}catch{throw Error(label+' returned an incomplete reply. No automatic retry was made.')}
}
