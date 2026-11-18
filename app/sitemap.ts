import type {MetadataRoute} from 'next';
import {getStorefront} from '@/lib/storefront';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(process.env.VERCEL_ENV!=='production')return [];
 let origin:string;try{const url=new URL(process.env.NEXT_PUBLIC_SITE_URL||'');if(url.protocol!=='https:'||!['softhaven.lk','www.softhaven.lk'].includes(url.hostname)||url.username||url.password)return [];origin=url.origin;}catch{return [];}
 const {products}=await getStorefront();
 return [...['','/shop','/collections','/about','/contact'].map(path=>({url:origin+path})),...products.map(product=>({url:origin+'/product/'+encodeURIComponent(product.slug)}))];
}
