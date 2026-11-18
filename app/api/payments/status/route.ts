import { z } from 'zod';
import { serverClient } from '@/lib/supabase/server';
import { apiError,AccessError } from '@/lib/request-security';
export async function GET(request:Request){try{const id=z.uuid().parse(new URL(request.url).searchParams.get('order'));const db=await serverClient();const {data,error}=await db.rpc('order_payment_details',{p_order:id});if(error)throw new AccessError('Sign in to the account that placed this order.',403);return Response.json(data,{headers:{'Cache-Control':'private, no-store'}});}catch(error){return apiError(error);}}
