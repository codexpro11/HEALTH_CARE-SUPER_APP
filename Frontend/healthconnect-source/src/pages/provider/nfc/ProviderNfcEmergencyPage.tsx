import React,{useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {requestNfcAccess} from '../../../lib/nfcDemo';
import {Button} from '../../../components/common/Button';
export function ProviderNfcEmergencyPage(){
 const navigate=useNavigate();const [payload,setPayload]=useState('');const [reason,setReason]=useState('');const [error,setError]=useState('');
 return <div className="max-w-xl mx-auto space-y-5"><Link to="/provider/nfc-scanner">Back to scanner</Link><h1 className="text-2xl font-bold">Emergency demo access</h1><p>Limited emergency scopes only. This creates a browser-local audit event, not a hospital audit or real emergency request.</p><form className="space-y-4" onSubmit={e=>{e.preventDefault();try{const grant=requestNfcAccess(payload.trim(),'provider-1','hospital-central',true,reason);navigate('/provider/nfc/summary/'+grant.patientId);}catch(e){setError((e as Error).message);}}}><label className="block">Card payload<input aria-label="Card payload" required value={payload} onChange={e=>setPayload(e.target.value)} className="block w-full p-3 border rounded-lg bg-transparent"/></label><label className="block">Reason<textarea aria-label="Reason" required minLength={10} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} className="block w-full p-3 border rounded-lg bg-transparent"/></label>{error&&<p role="alert">{error}</p>}<Button type="submit">Check emergency demo access</Button></form></div>;
}
