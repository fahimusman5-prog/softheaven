import { randomUUID } from 'node:crypto';
import {normalizeReceipt} from '@/lib/payments/receipt';
import { serverClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/payments/server';
import { requireBudget } from '@/lib/request-budget';
import { readBytes, sameOrigin, apiError, AccessError } from '@/lib/request-security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const db = await serverClient(); const { data: { user } } = await db.auth.getUser();
    if (!user?.email_confirmed_at) throw new AccessError('Sign in with a confirmed email.',401);
    await requireBudget(db, 'upload'); const service = paymentService();
    const bytes = await readBytes(request, 5*1024*1024);
    const normalized = await normalizeReceipt(bytes);
    const path=`${user.id}/${randomUUID()}.webp`;
    const upload=await service.storage.from('payment-receipts').upload(path,normalized,{contentType:'image/webp',upsert:false});
    if(upload.error) throw new AccessError('Receipt upload is temporarily unavailable.',503);
    const receipt=await service.rpc('register_payment_receipt',{p_customer:user.id,p_path:path,p_size:normalized.length});
    if(receipt.error){await service.storage.from('payment-receipts').remove([path]);throw new AccessError('Receipt registration failed. Please retry.',503);}
    return Response.json({id:receipt.data},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return apiError(error);}
}
