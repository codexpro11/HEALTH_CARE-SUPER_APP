import React,{useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {requestNfcAccess} from '../../../lib/nfcDemo';
import {Button} from '../../../components/common/Button';
export function ProviderNfcScannerPage(){
 const navigate=useNavigate();const [payload,setPayload]=useState('');const [error,setError]=useState('');
 return <div className="max-w-xl mx-auto space-y-5"><h1 className="text-2xl font-bold">Demo NFC scanner</h1><p>Paste the payload from your patient NFC card. This checks saved card status and consent; it does not read a physical NFC device.</p><p>Demo authorization identity: Dr. John Smith at Central City Hospital. Record access is limited to the paired account and the supported doctor persona.</p><form className="space-y-4" onSubmit={e=>{e.preventDefault();try{const grant=requestNfcAccess(payload.trim(),'provider-1','hospital-central');navigate('/provider/nfc/summary/'+grant.patientId);}catch(e){setError((e as Error).message);}}}><label className="block">Card payload<input aria-label="Card payload" required value={payload} onChange={e=>setPayload(e.target.value)} className="block w-full p-3 border rounded-lg bg-transparent"/></label>{error&&<p role="alert">{error}</p>}<Button type="submit">Check demo access</Button></form><Link className="underline" to="/provider/nfc/emergency">Emergency demo access</Link></div>;
}
