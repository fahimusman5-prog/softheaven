'use client';
import {useRef,useState,useEffect} from 'react';
export function ReceiptUpload({onChange,disabled=false}:{onChange:(id:string|null)=>void;disabled?:boolean}) {
 const input=useRef<HTMLInputElement>(null),lock=useRef(false),mounted=useRef(true),request=useRef<XMLHttpRequest|null>(null);const [preview,setPreview]=useState('');const [progress,setProgress]=useState<number|null>(null);const [error,setError]=useState('');const [uploaded,setUploaded]=useState(false);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;request.current?.abort();};},[]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 async function upload(file?:File){if(!file||lock.current||disabled)return;setError('');setUploaded(false);onChange(null);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Choose a JPEG, PNG or WebP image under 5 MB.');return;}
 lock.current=true;setPreview(URL.createObjectURL(file));setProgress(0);
 try{const id=await new Promise<string>((resolve,reject)=>{const xhr=new XMLHttpRequest();request.current=xhr;xhr.open('POST','/api/payments/receipts');xhr.setRequestHeader('Content-Type',file.type);xhr.timeout=60000;xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(e.loaded/e.total*100));};xhr.onload=()=>{try{const body=JSON.parse(xhr.responseText);if(xhr.status<200||xhr.status>=300||!body.id)throw new Error(body.error||'Upload failed.');resolve(body.id);}catch(e){reject(e);}};xhr.onerror=xhr.ontimeout=xhr.onabort=()=>reject(new Error('Upload interrupted. Please try again.'));xhr.send(file);});if(mounted.current){onChange(id);setUploaded(true);}}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Upload failed.');}finally{lock.current=false;if(mounted.current)setProgress(null);}}
 return <section className="payment-receipt" aria-label="Payment receipt"><h3>Upload Your Payment Receipt</h3><p>Please upload a clear screenshot or photo of your completed bank transfer.</p><div className="payment-receipt__drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files[0]);}}>
 <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||progress!==null} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}} aria-label="Choose payment receipt"/>
 <p>JPEG, PNG or WebP · maximum 5 MB</p>{preview&&<img src={preview} width={220} height={180} alt="Your selected bank transfer receipt"/>}
 {progress!==null&&<p role="status">Uploading: {progress}%</p>}{uploaded&&<p role="status">Receipt uploaded securely. Submit your order to attach it.</p>}{error&&<p role="alert">{error}</p>}
 {preview&&<button type="button" disabled={disabled||progress!==null} onClick={()=>{setPreview('');setUploaded(false);onChange(null);}}>Remove receipt</button>}
 </div></section>;
}
