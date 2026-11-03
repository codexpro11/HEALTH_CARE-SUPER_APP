import React, { useState } from 'react';
import { useNfcDemoState } from '../../lib/useNfcDemoState';
import { issueCredential, revokeCredential, maskedCredential } from '../../lib/nfcDemo';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
export function NfcCardPage() {
 const {state,error,refresh}=useNfcDemoState(); const [notice,setNotice]=useState('');
 const run=(action:()=>unknown)=>{try{action();setNotice('Demo card updated in this browser.');}catch(e){setNotice((e as Error).message);}};
 if(error)return <p role="alert">{error}<Button onClick={refresh}>Retry</Button></p>;
 if(!state)return <p role="status">Loading card...</p>;
 const card=state.credentials[0];
 return <div className="max-w-3xl mx-auto space-y-5"><h1 className="text-2xl font-bold">My NFC card</h1><p>Demo identifier only. No physical card is written. Copy the payload for the provider demo scanner.</p>
 <Card className="p-6 space-y-4"><h2 className="font-bold">{maskedCredential(card.id)}</h2><p>Status: {Date.parse(card.expiresAt)<=Date.now()?'EXPIRED':card.status}</p><p>Expires: {new Date(card.expiresAt).toLocaleDateString()}</p>
 <label className="block">Demo scan payload<input aria-label="Demo scan payload" readOnly value={card.id} className="block w-full p-3 border rounded-lg bg-transparent" /></label>
 <div className="flex flex-wrap gap-3"><Button disabled={card.status!=='ACTIVE'} onClick={()=>run(()=>revokeCredential(card.id))}>Revoke Card</Button><Button onClick={()=>run(()=>issueCredential())}>Request Replacement</Button></div><p className="text-sm">Replacement revokes the previous card and any current access.</p></Card>{notice&&<p role="status">{notice}</p>}</div>;
}
