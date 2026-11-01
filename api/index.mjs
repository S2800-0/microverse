import {createVercelRelay} from '../server/public-relay.mjs';
export default {fetch(request){return createVercelRelay({secret:process.env.MICROVERSE_PROXY_SECRET})(request);}};
