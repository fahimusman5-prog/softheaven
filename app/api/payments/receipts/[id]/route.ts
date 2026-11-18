import { z } from 'zod';
import { serverClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/payments/server';
import { apiError, AccessError } from '@/lib/request-security';
export async function GET(_request: Request,{params}:{params:Promise<{id:string}>}) {
 try {const id=z.uuid().parse((await params).id);const db=await serverClient();const {data,error}=await db.rpc('payment_receipt_access',{p_receipt:id});
 if(error||!data?.path)throw new AccessError('Receipt unavailable.',403);
 const signed=await paymentService().storage.from('payment-receipts').createSignedUrl(data.path,60);
 if(signed.error)throw new AccessError('Receipt unavailable.',503);
 return Response.redirect(signed.data.signedUrl,307);
 }catch(error){return apiError(error);}
}
