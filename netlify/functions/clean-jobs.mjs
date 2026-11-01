import {getStore} from '@netlify/blobs';
import {cleanPublicJobs} from '../../server/public-api.mjs';
export default async function(){await cleanPublicJobs(getStore({name:'microverse-public-ai',consistency:'strong'}));}
export const config={schedule:'15 * * * *'};
