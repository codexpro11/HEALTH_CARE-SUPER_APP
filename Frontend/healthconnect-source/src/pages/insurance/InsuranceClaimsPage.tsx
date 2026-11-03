import React,{useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useInsuranceDemo} from '../../lib/useInsuranceDemo';
import {formatMoney} from '../../lib/insuranceDemo';
import {ClaimForm} from '../../components/insurance/InsuranceForms';
import {Modal} from '../../components/common/Modal';
import {Button} from '../../components/common/Button';
import {Card} from '../../components/common/Card';
export function InsuranceClaimsPage(){
 const {state,error,refresh}=useInsuranceDemo();const [adding,setAdding]=useState(false);const navigate=useNavigate();
 return <div className="max-w-4xl mx-auto space-y-5"><Link className="underline" to="/app/insurance">Back to Insurance</Link><h1 className="text-2xl font-bold">Insurance Claims</h1><p>Browser-only demo claims. Nothing is sent to an insurer.</p><Button disabled={!state?.policies.length} onClick={()=>setAdding(true)}>New Claim</Button>{error&&<p role="alert">{error}<Button onClick={refresh}>Retry</Button></p>}{!state&&!error&&<p role="status">Loading claims...</p>}{state&&!state.policies.length&&<p>Add a policy before creating a claim.</p>}{state&&!state.claims.length&&<p>No claims yet.</p>}<div className="grid gap-4 sm:grid-cols-2">{state?.claims.map(c=>{const policy=state.policies.find(p=>p.id===c.policyId);return <Card key={c.id} className="p-5 space-y-3 min-w-0"><h2 className="font-bold">{c.hospital}</h2><p className="font-semibold">{c.status.replaceAll('_',' ')}</p><p>Claimed: {formatMoney(c.amount,policy?.currency??'USD')}</p><p>Approved: {formatMoney(c.approvedAmount,policy?.currency??'USD')}</p><p>{c.date} · {c.type}</p><Link className="underline break-all" to={'/app/insurance/claims/'+c.id}>View claim {c.id}</Link></Card>;})}</div><Modal isOpen={adding} onClose={()=>setAdding(false)} title="New demo claim">{state&&<ClaimForm policies={state.policies} onSaved={c=>{setAdding(false);navigate('/app/insurance/claims/'+c.id);}}/>}</Modal></div>;
}
