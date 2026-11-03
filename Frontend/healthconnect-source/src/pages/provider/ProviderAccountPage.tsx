import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext';
import {isDemoMode} from '../../lib/demo';
import {Button} from '../../components/common/Button';
export function ProviderAccountPage({view}:{view:'profile'|'settings'|'insurance'}){
 const {user,switchRole}=useAuth();const navigate=useNavigate();
 return <div className="max-w-2xl space-y-5"><h1 className="text-2xl font-bold">Provider {view}</h1>{view==='profile'?<><p>{user?.fullName}</p><p>Role: {user?.role}</p><p>Provider credentials and institutional membership must be verified by the live service. Demo personas do not establish clinical credentials.</p></>:view==='insurance'?<p>Provider insurance processing is unavailable. No insurer submission, eligibility check or settlement is performed here.</p>:<p>Use the patient demo to manage browser preferences and switch personas.</p>}{isDemoMode&&<Button onClick={()=>{switchRole('PATIENT');navigate('/app/settings');}}>Return to patient demo</Button>}</div>;
}
