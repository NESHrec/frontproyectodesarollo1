"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextareaField } from "@/shared/components";
import { getCsrfToken } from "@/modules/auth/csrf-client";

export function ClinicalProfileForm({appointmentId,initial}:{appointmentId:string;initial:{allergies?:string|null;relevantConditions?:string|null;currentMedications?:string|null;dentalHistory?:string|null}|null}){
 const router=useRouter();const [busy,setBusy]=useState(false),[message,setMessage]=useState<string|null>(null);
 const [values,setValues]=useState({allergies:initial?.allergies??"",relevantConditions:initial?.relevantConditions??"",currentMedications:initial?.currentMedications??"",dentalHistory:initial?.dentalHistory??""});
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage(null);try{const response=await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/expediente/perfil`,{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json","x-csrf-token":await getCsrfToken()},body:JSON.stringify(values)});if(!response.ok){setMessage("No se pudo guardar la nueva versión del perfil clínico.");return;}setMessage("Nueva versión guardada con autor y fecha.");router.refresh();}catch{setMessage("El servicio no está disponible.");}finally{setBusy(false);}}
 const field=(name:keyof typeof values,label:string)=><TextareaField id={name} label={label} maxLength={2000} rows={2} value={values[name]} onChange={e=>setValues(current=>({...current,[name]:e.target.value}))}/>;
 return <form className="grid gap-3" onSubmit={submit}>{field("allergies","Alergias declaradas")}{field("relevantConditions","Condiciones relevantes")}{field("currentMedications","Medicamentos actuales")}{field("dentalHistory","Antecedentes odontológicos")}<p className="text-xs text-[#62727B]/75">Registra solo información declarada o comprobada. Cada guardado crea una versión; no modifica las anteriores.</p>{message?<p role="status" className="text-sm">{message}</p>:null}<div><Button disabled={busy} type="submit">{busy?"Guardando…":"Guardar nueva versión"}</Button></div></form>;
}
