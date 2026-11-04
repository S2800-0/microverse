// Cross-fades between two icons. Both stay mounted so the change can reverse mid-way; the parent carries the label.
export function IconSwap({first,a,b}){
 return <span className="icon-swap" data-first={first?'true':'false'} aria-hidden="true"><span>{a}</span><span>{b}</span></span>;
}
