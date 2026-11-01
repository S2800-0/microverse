// Run through: npm exec --yes --package=netlify-cli@27.16.1 -- node scripts/deploy-netlify.mjs
// Requires an already-linked Netlify project and a successful Netlify build.
import {loadEnvFile} from 'node:process';
import {appendFileSync,readFileSync,realpathSync,existsSync} from 'node:fs';
import {delimiter,dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';

if(existsSync('.env'))loadEnvFile('.env');
const enabled=process.env.MICROVERSE_PUBLIC_AI_ENABLED==='1';
const cap=Number(process.env.MICROVERSE_PUBLIC_CAP_MICRO_USD||0);
if(!Number.isSafeInteger(cap)||cap<0||cap>1000000)throw new Error('Set a public pilot reservation cap between $0 and $1.');
if(enabled&&(cap===0||process.env.MICROVERSE_PUBLIC_CREDITS_CONFIRMED!=='1'))throw new Error('Confirm funded credits and a positive bounded cap before enabling public AI.');
if(!existsSync('.netlify/state.json')||!existsSync('.netlify/functions/manifest.json'))throw new Error('Link Netlify and run its build first.');
let root;
for(const directory of (process.env.PATH||'').split(delimiter)){
  try{const bin=realpathSync(join(directory,'netlify')),candidate=resolve(dirname(bin),'..');
    if(JSON.parse(readFileSync(join(candidate,'package.json'))).name==='netlify-cli'){root=candidate;break;}
  }catch{}
}
if(!root||JSON.parse(readFileSync(join(root,'package.json'))).version!=='27.16.1')throw new Error('Use the pinned official Netlify CLI 27.16.1 via npm exec.');
if(enabled&&!process.env.MICROVERSE_PUBLIC_SESSION_SECRET){
  const secret=randomBytes(48).toString('hex');
  appendFileSync('.env','\n# Hosted pilot session/encryption secret; never committed.\nMICROVERSE_PUBLIC_SESSION_SECRET='+secret+'\n',{mode:0o600});process.env.MICROVERSE_PUBLIC_SESSION_SECRET=secret;
}
const provider=process.env.MICROVERSE_SPARK_PROVIDER||'baseten';
if(!['meta','baseten'].includes(provider))throw new Error('Choose one funded reasoning provider.');
const secrets=enabled?['MODEL_API_KEY',...(provider==='baseten'?['BASETEN_API_KEY']:[]),'MICROVERSE_PUBLIC_SESSION_SECRET']:[];
if(process.env.MICROVERSE_PROXY_SECRET)secrets.push('MICROVERSE_PROXY_SECRET');
if(secrets.some(key=>!process.env[key]))throw new Error('A required backend key is missing from the private environment.');
for(const stream of [process.stdout,process.stderr]){
  const write=stream.write.bind(stream);
  stream.write=(chunk,...args)=>{let text=String(chunk);for(const key of secrets)text=text.split(process.env[key]).join('[redacted]');return write(text,...args);};
}
process.env.NETLIFY_TELEMETRY_DISABLED='1';
const {createMainCommand}=await import(pathToFileURL(join(root,'dist/commands/main.js')));
const program=await createMainCommand();
const argv=['node','netlify','deploy','--prod','--no-build','--dir','dist','--functions','.netlify/functions','--message','Microverse public classroom pilot'];
// Values enter the official CLI in memory, not process arguments, source or
// ordinary environment variables. Deploy-only secrets are Functions-only.
for(const key of secrets)argv.push('--secret-env',key+'='+process.env[key]);
for(const [key,value]of Object.entries({MICROVERSE_PUBLIC_AI_ENABLED:enabled?'1':'0',MICROVERSE_PUBLIC_CREDITS_CONFIRMED:enabled?'1':'0',MICROVERSE_PUBLIC_CAP_MICRO_USD:String(cap),MICROVERSE_SPARK_PROVIDER:provider,MICROVERSE_PUBLIC_VERIFY_ONCE:process.env.MICROVERSE_PUBLIC_VERIFY_ONCE==='1'?'1':'0'}))argv.push('--env',key+'='+value);
await program.parseAsync(argv);
