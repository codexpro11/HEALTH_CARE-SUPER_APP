import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {useInsuranceDemo} from '../../lib/useInsuranceDemo';
import {effectivePolicyStatus,formatMoney,maskIdentifier} from '../../lib/insuranceDemo';
import {PolicyForm} from '../../components/insurance/InsuranceForms';
import {Modal} from '../../components/common/Modal';
import {Button} from '../../components/common/Button';
import {Card} from '../../components/common/Card';
import {downloadText} from '../../lib/downloadText';
export function InsuranceDashboardPage(){
 const {state,error,refresh}=useInsuranceDemo();const [adding,setAdding]=useState(false);
 return <div className="max-w-4xl mx-auto space-y-5"><h1 className="text-2xl font-bold">Health Insurance</h1><p>Sample policies saved in this browser. No insurer verification or coverage approval.</p><div className="flex flex-wrap gap-4"><Link className="underline" to="/app/insurance/claims">View Claims</Link><Button disabled={!state} onClick={()=>setAdding(true)}>Add Policy</Button></div>{error&&<p role="alert">{error}<Button onClick={refresh}>Retry</Button></p>}{!state&&!error&&<p role="status">Loading policies...</p>}{state?.policies.length===0&&<p>No policies saved. Add a sample policy to begin.</p>}{state?.policies.map(p=><Card key={p.id} className="p-5 space-y-3"><h2 className="font-bold">{p.provider}</h2><p>{p.plan}</p><p>{effectivePolicyStatus(p)} · {formatMoney(p.coverage,p.currency)}</p><p>{maskIdentifier(p.policyNumber)} · Valid until {p.endDate}</p><div className="flex flex-wrap gap-3"><Link className="underline" to={'/app/insurance/'+p.id}>View Coverage Details</Link><Button variant="outline" onClick={()=>downloadText('sample-policy-'+p.id+'.txt',['SAMPLE POLICY SUMMARY - NOT PROOF OF COVERAGE',p.provider,p.plan,maskIdentifier(p.policyNumber),formatMoney(p.coverage,p.currency),'Valid until '+p.endDate].join('\n'))}>Download sample summary</Button></div></Card>)}<Modal isOpen={adding} onClose={()=>setAdding(false)} title="Add sample policy"><PolicyForm onSaved={()=>{setAdding(false);refresh();}}/></Modal></div>;
}
