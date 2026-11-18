import { z } from 'zod';
import { serverClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/payments/server';
import { payhereConfig,payhereFields,cardCheckoutAvailable } from '@/lib/payments/payhere';
import { apiError,AccessError,sameOrigin,readJson } from '@/lib/request-security';
export async function POST(request:Request){try{sameOrigin(request);const v=z.object({order:z.uuid(),key:z.uuid(),receipt:z.uuid().optional()}).parse(await readJson(request));const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user?.email_confirmed_at)throw new AccessError('Sign in first',401);const service=paymentService();
 if(v.receipt){const {error}=await service.rpc('resubmit_bank_receipt',{p_customer:user.id,p_order:v.order,p_receipt:v.receipt});if(error)throw new AccessError('Receipt resubmission is unavailable for this order.',409);return Response.json({ok:true});}
 const config=payhereConfig();if(!config||!cardCheckoutAvailable())throw new AccessError('Card payment is not configured.',503);const {data,error}=await service.rpc('retry_payhere_payment',{p_customer:user.id,p_order:v.order,p_key:v.key});if(error)throw new AccessError('Payment retry is unavailable. Refresh your order status.',409);return Response.json({endpoint:config.endpoint,fields:payhereFields(data,config)});
 }catch(error){return apiError(error);}}
