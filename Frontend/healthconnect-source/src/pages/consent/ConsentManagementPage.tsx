import React,{useState} from 'react';
import {useNfcDemoState} from '../../lib/useNfcDemoState';
import {revokeConsent,updateConsent,REGULAR_SCOPES} from '../../lib/nfcDemo';
import {Button} from '../../components/common/Button';
import {Card} from '../../components/common/Card';
export function ConsentManagementPage(){
 const {state,error,refresh}=useNfcDemoState();const [notice,setNotice]=useState('');
 const run=(fn:()=>void)=>{try{fn();setNotice('Consent updated. Previous provider access has been cleared.');}catch(e){setNotice((e as Error).message);}};
 if(error)return <p role="alert">{error}<Button onClick={refresh}>Retry</Button></p>;
 return <div className="max-w-4xl mx-auto space-y-5"><h1 className="text-2xl font-bold">Consent Management</h1><p>Manage access to your account’s simulated record summaries. Changes persist in this browser.</p>{notice&&<p role="status">{notice}</p>}{!state&&<p role="status">Loading consent...</p>}{state?.consents.map(c=><Card key={c.id} className="p-5 space-y-3"><h2 className="font-bold">{c.provider}</h2><p>{c.facility}</p><p>{c.status==='ACTIVE'&&Date.parse(c.expiry)<=Date.now()?'EXPIRED':c.status} · Expires {c.expiry}</p><p>{c.scopes.join(', ')}</p>{c.status==='ACTIVE'?<Button onClick={()=>run(()=>revokeConsent(c.id))}>Revoke Access</Button>:<Button onClick={()=>run(()=>{const end=new Date();end.setFullYear(end.getFullYear()+1);updateConsent(c.id,[...REGULAR_SCOPES],end.toISOString().slice(0,10));})}>Grant demo summary access for one year</Button>}</Card>)}</div>;
}
