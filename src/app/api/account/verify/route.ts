import { NextRequest } from "next/server";
import { backendFetch } from "@/modules/auth/server-session";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
export async function POST(request:NextRequest){if(!hasValidCsrf(request))return jsonNoStore({ok:false,reason:"csrf"},{status:403});const body=await request.json().catch(()=>null);const r=await backendFetch("/auth/verify-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!r)return jsonNoStore({ok:false,reason:"service"},{status:503});if(r.status===400)return jsonNoStore({ok:false,reason:"token"},{status:400});return r.ok?jsonNoStore({ok:true}):jsonNoStore({ok:false,reason:"service"},{status:503});}
