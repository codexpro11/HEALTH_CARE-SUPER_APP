import React,{useState} from 'react';
import {isDemoMode} from '../../lib/demo';
import {Button} from '../common/Button';
import {Modal} from '../common/Modal';
export function TelehealthLink({href}:{href:string}){
 const [open,setOpen]=useState(false);
 let safe=false;try{const url=new URL(href);safe=url.protocol==='https:'&&url.hostname!=='telehealth.healthconnect.io';}catch{}
 if(!isDemoMode&&safe)return <a href={href} target="_blank" rel="noopener noreferrer" className="underline">Join video consultation</a>;
 return <><Button onClick={()=>setOpen(true)}>Preview video consultation</Button><Modal isOpen={open} onClose={()=>setOpen(false)} title="Video consultation unavailable"><p>This preview does not create a video room or contact a doctor. A connected telehealth service is required for a real call.</p></Modal></>;
}
