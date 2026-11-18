import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import { apiError,sameOrigin,readJson } from '@/lib/request-security';
export async function POST(request:Request){try{sameOrigin(request);const v=z.object({order:z.uuid(),approve:z.boolean(),note:z.string().trim().min(3).max(2000)}).parse(await readJson(request));const {db}=await requireAdmin('orders');const {error}=await db.rpc('verify_bank_payment',{p_order:v.order,p_approve:v.approve,p_note:v.note});if(error)throw error;return Response.json({ok:true});}catch(error){return apiError(error);}}
