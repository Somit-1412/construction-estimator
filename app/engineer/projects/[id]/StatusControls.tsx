"use client";

import { useState } from "react";

type Status = "SUBMITTED" | "PAYMENT_RECEIVED" | "IN_PROGRESS" | "COMPLETED";

export default function StatusControls({ projectId, initialStatus }: { projectId: string; initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  async function update(nextStatus: "SUBMITTED"|"IN_PROGRESS") { setSaving(true); setError(""); try { const r=await fetch(`/api/projects/${projectId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:nextStatus})}); const d=await r.json(); if(!r.ok)throw new Error(d.error||"Unable to update project status."); setStatus(d.status); } catch(e){setError(e instanceof Error?e.message:"Unable to update project status.");} finally{setSaving(false);} }
  return <div className="flex flex-col items-end gap-2"><div className="flex flex-wrap items-center justify-end gap-2"><span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{status.replaceAll("_"," ")}</span>{status==="SUBMITTED"&&<button disabled={saving} onClick={()=>void update("IN_PROGRESS")} className="secondary-button !px-3 !py-1.5 !text-xs">{saving?"Updating…":"Start work"}</button>}{status==="IN_PROGRESS"&&<span className="text-xs font-medium text-slate-500">Finalize from Report when the estimate is ready.</span>}</div>{error&&<p className="text-xs text-red-600">{error}</p>}</div>;
}
