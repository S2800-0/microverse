// A proxy restart or incomplete upstream reply must not leak a raw JSON parser
// exception into a child's screen. Reading once never resubmits a paid request.
export async function readJsonResponse(response,{fallback='The reply was interrupted. Your work is still here. No automatic retry was made.'}={}){
 let value;try{const text=await response.text();if(!text.trim())throw Error();value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw Error()}catch{throw Error(fallback)}
 if(!response.ok)throw Error(typeof value.error==='string'&&!/JSON|Unexpected (?:end|token)/i.test(value.error)?value.error:fallback);return value;
}
