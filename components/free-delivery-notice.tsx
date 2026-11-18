'use client';
import {useEffect,useState} from 'react';
import {isFreeIslandwideRate} from '@/lib/shipping/config';
/** Promotional claims appear only after the database confirms the approved active rate. */
export function FreeDeliveryNotice(){const [available,setAvailable]=useState(false);useEffect(()=>{const controller=new AbortController();fetch('/api/checkout',{signal:controller.signal,cache:'no-store'}).then(async response=>{if(!response.ok)return;const data=await response.json();setAvailable(Array.isArray(data.rates)&&data.rates.some(isFreeIslandwideRate));}).catch(()=>{});return()=>controller.abort();},[]);return available?<p className="free-delivery-notice">🚚 <strong>FREE ISLANDWIDE DELIVERY</strong><span>No minimum order · Sri Lanka</span></p>:null;}
