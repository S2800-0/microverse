import {PawPrint} from '@phosphor-icons/react';
import '@fontsource/baloo-2/latin-ext-700.css';
import './wordmark.css';
// Live type plus the same Phosphor paw used elsewhere; crisp at header/icon sizes.
export function Wordmark(){return <span className="microverse-wordmark" aria-hidden="true">m<span className="wordmark-letter-i">ı<PawPrint weight="fill" className="wordmark-paw"/></span>croverse</span>}
