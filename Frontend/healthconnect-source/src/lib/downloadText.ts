/** Export an explicitly labeled summary, never a signed prescription or payment receipt. */
export function downloadText(name: string, content: string) {
 const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download=name.replace(/[^a-zA-Z0-9._-]/g,'_');document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
