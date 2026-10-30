import { NextRequest } from "next/server";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest } from "@/modules/auth/staff-proxy";
type Context={params:Promise<{blockId:string}>};
export async function PATCH(request:NextRequest,context:Context){if(!hasValidCsrf(request))return jsonNoStore({ok:false,reason:"csrf"},{status:403});const{blockId}=await context.params;const input=await request.json().catch(()=>null) as {startAt?:unknown;endAt?:unknown}|null;if(typeof input?.startAt!=="string"||typeof input.endAt!=="string")return jsonNoStore({ok:false,reason:"invalid"},{status:400});return forwardStaffRequest(request,`/staff/medico/horarios/${encodeURIComponent(blockId)}`,{method:"PATCH",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(input)});}
export async function DELETE(request:NextRequest,context:Context){if(!hasValidCsrf(request))return jsonNoStore({ok:false,reason:"csrf"},{status:403});const{blockId}=await context.params;return forwardStaffRequest(request,`/staff/medico/horarios/${encodeURIComponent(blockId)}`,{method:"DELETE"});}
