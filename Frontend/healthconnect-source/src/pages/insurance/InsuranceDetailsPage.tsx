import React,{useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {useInsuranceDemo} from '../../lib/useInsuranceDemo';
import {effectivePolicyStatus,formatMoney,maskIdentifier} from '../../lib/insuranceDemo';
import {PolicyForm} from '../../components/insurance/InsuranceForms';
import {Button} from '../../components/common/Button';
import {Modal} from '../../components/common/Modal';
export function InsuranceDetailsPage(){
 const {id}=useParams();const {state,error,refresh}=useInsuranceDemo();const [editing,setEditing]=useState(false);const policy=state?.policies.find(p=>p.id===id);
 return <div className="max-w-3xl mx-auto space-y-5"><Link to="/app/insurance" className="underline">Back to Insurance</Link>{error?<p role="alert">{error}<Button onClick={refresh}>Retry</Button></p>:!state?<p role="status">Loading policy...</p>:!policy?<h1>Policy unavailable in this account</h1>:<><h1 className="text-2xl font-bold">{policy.plan}</h1><p>{policy.provider} · {effectivePolicyStatus(policy)}</p><p>Sample coverage only; no insurer eligibility has been verified.</p><p>{maskIdentifier(policy.policyNumber)} · {maskIdentifier(policy.memberId)}</p><p>{policy.startDate} – {policy.endDate}</p><p>Sum insured: {formatMoney(policy.coverage,policy.currency)}</p><Button onClick={()=>setEditing(true)}>Edit sample policy</Button><h2 className="font-bold">Coverage details</h2>{policy.coverages.map((c,i)=><div key={i}><h3 className="font-bold">{c.name}</h3><p>{c.description}</p><p>{c.limit}</p></div>)}{!policy.coverages.length&&<p>No coverage notes provided.</p>}<Modal isOpen={editing} onClose={()=>setEditing(false)} title="Edit sample policy"><PolicyForm policy={policy} onSaved={()=>{setEditing(false);refresh();}}/></Modal></>}</div>;
}
