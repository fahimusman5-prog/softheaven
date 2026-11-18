'use client';
import Link from 'next/link';
import {useEffect,useState,useRef} from 'react';
import {useCart} from '@/components/cart-provider';
import {ReceiptUpload} from '@/components/checkout/receipt-upload';
import {submitPayhere} from '@/lib/payments/handoff';
import './payment-result.css';
type Result={payment_status:string;status:string;method:string;review_required:boolean;expires_at:string;receipt?:{verification:string}};
export default function PaymentResult(){const {clear}=useCart();const cleared=useRef(false);const [id,setId]=useState('');const [result,setResult]=useState<Result|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [receipt,setReceipt]=useState<string|null>(null);const [cancelled,setCancelled]=useState(false);
 useEffect(()=>{const params=new URLSearchParams(location.search);setId(params.get('order')||'');setCancelled(params.get('cancelled')==='1');},[]);
 async function refresh(order:string){try{const response=await fetch('/api/payments/status?order='+encodeURIComponent(order),{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to check payment.');setResult(data);setError('');}catch(e){setError((e as Error).message);}}
 useEffect(()=>{if(!id)return;let active=true;let polls=0;const load=()=>{if(active&&document.visibilityState==='visible'&&polls++<60)void refresh(id);};load();const timer=setInterval(load,5000);return()=>{active=false;clearInterval(timer);};},[id]);
 useEffect(()=>{if(result?.payment_status==='paid'&&!result.review_required&&!cleared.current){clear();cleared.current=true;}},[result,clear]);
 async function retry(){setBusy(true);setError('');try{const r=await fetch('/api/payments/retry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:id,key:crypto.randomUUID(),...(receipt?{receipt}:{})})});const body=await r.json();if(!r.ok)throw new Error(body.error);if(body.endpoint)submitPayhere(body);else{setReceipt(null);await refresh(id);}}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 const paid=result?.payment_status==='paid'&&!result.review_required;const rejected=result?.method==='bank_transfer'&&result.payment_status==='failed'&&result.status==='pending';
 const title=result?.review_required?'Payment needs a team review':paid?'Payment confirmed':rejected?'Payment receipt needs attention':result?.status==='cancelled'?'Payment session expired':result?.payment_status==='failed'?'Payment not completed':result?.method==='bank_transfer'?'Payment verification pending':'Payment processing';
 return <section className="payment-result"><span className="eyebrow">Your SoftHaven order</span><h1>{title}</h1><p role="status">{result?.review_required?'Your payment status needs manual review. Please contact us with your order reference.':paid?'Your payment has been verified. View your order for the latest fulfilment status.':rejected?'Your receipt was rejected. You can provide a replacement while the reservation remains active.':cancelled?'You returned from the payment page. We will confirm the final result from the payment provider.':result?.method==='bank_transfer'?'Your payment is awaiting verification. We have not marked this order paid.':'We’re checking your payment status.'}</p>
 {error&&<p role="alert">{error}</p>}<button type="button" disabled={!id||busy} onClick={()=>refresh(id)}>Refresh status</button>
 {result?.method==='card'&&result.payment_status==='failed'&&result.status==='pending'&&!result.review_required&&<button type="button" disabled={busy} onClick={retry}>Try card payment again</button>}
 {rejected&&<><ReceiptUpload onChange={setReceipt} disabled={busy}/><button type="button" disabled={!receipt||busy} onClick={retry}>Submit replacement receipt</button></>}
 <div className="payment-result__links">{id&&<Link href={'/account/orders/'+encodeURIComponent(id)}>View order</Link>}<Link href="/contact">Contact SoftHaven</Link><Link href="/shop">Continue shopping</Link></div></section>;
}
