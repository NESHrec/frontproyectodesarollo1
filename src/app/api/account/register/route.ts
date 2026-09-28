import { NextRequest } from "next/server";
import { backendFetch } from "@/modules/auth/server-session";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ok:false,reason:"csrf"},{status:403});
  const body=await request.json().catch(()=>null); const response=await backendFetch("/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!response) return jsonNoStore({ok:false,reason:"service"},{status:503});
  if(response.status===400) return jsonNoStore({ok:false,reason:"invalid"},{status:400});
  return response.ok ? jsonNoStore({ok:true},{status:202}) : jsonNoStore({ok:false,reason:"service"},{status:503});
}
