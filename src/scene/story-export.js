// A same-origin preview opens outside the embedded lesson. The fragment stays
// in the browser; no learner notes enter a server request or provider payload.
export function storyDownloadLinks(session,prediction='',reflection='',connection=''){
  const fragment=encodeURIComponent(JSON.stringify(session.replay(prediction,reflection,connection)));
  return {
    replay:'/discovery.html?view=experiment#'+fragment,
    card:reflection?'/discovery.html#'+fragment:null,
  };
}
