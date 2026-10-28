// Curated species facts, never inferred individual traits or photo diagnoses.
export const CREATURE_FACTS=Object.freeze({
  dog:{title:'A world written in smells',text:'Dogs gather information about their surroundings through sniffing. A familiar path can hold scents we barely notice.',source:'RSPCA Education',url:'https://education.rspca.org.uk/library/-/content/let-dogs-sniff',question:'What might an animal notice about a place that you would miss?'},
  cat:{title:'A familiar place has a scent',text:'Cats use scent to communicate. Rubbing their face on objects can leave scent marks that help make a place familiar.',source:'Cats Protection',url:'https://learnonline.cats.org.uk/content/ufo/11.html',question:'Which parts of a place might matter to an animal, even when they are invisible to us?'},
});
export function imaginationGreeting(name,species){return species==='cat'?`${name} has appointed themself inspector of this entire clearing. Your application to sit down is under review.`:`${name} has discovered an extremely important imaginary stick. All other appointments have been postponed.`;}
