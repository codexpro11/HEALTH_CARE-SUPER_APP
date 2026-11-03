import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {currentNfcAccess} from '../../../lib/nfcDemo';
import {useNfcDemoState} from '../../../lib/useNfcDemoState';
import {useAuth} from '../../../auth/AuthContext';
export function ProviderNfcSummaryPage(){
 const {id}=useParams();const {user}=useAuth();const {state,error}=useNfcDemoState();const [,tick]=useState(0);
 useEffect(()=>{const t=setInterval(()=>tick(n=>n+1),1000);return ()=>clearInterval(t);},[]);
 const grant=state&&id?currentNfcAccess(id):null;
 if(error||!grant)return <div className="space-y-4"><h1 className="text-xl font-bold">Patient access required</h1><p role="alert">{error||'Scan the current card with valid consent. Access may have expired or been revoked.'}</p><Link to="/provider/nfc-scanner">Return to scanner</Link></div>;
 return <div className="max-w-3xl space-y-5"><h1 className="text-2xl font-bold">Authorized demo summary</h1><p>Paired sample patient: {user?.fullName}</p><p>Access expires {new Date(grant.expiresAt).toLocaleTimeString()}.</p><h2 className="font-bold">Granted scopes</h2><ul>{grant.scopes.map(s=><li key={s}>{s}</li>)}</ul>{grant.emergency?<p>Emergency access does not unlock full medical records or insurance.</p>:<Link className="underline" to="/provider/medical-records">Open authorized record summaries</Link>}<p>Card and consent were checked against this account’s saved demo state. No live provider verification was performed.</p><Link to="/provider/nfc-scanner">New scan</Link></div>;
}
