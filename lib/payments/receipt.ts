import sharp from 'sharp';
import { AccessError } from '@/lib/request-security';
export async function normalizeReceipt(bytes:Uint8Array) {
 if(bytes.length>5*1024*1024)throw new AccessError('Receipt is too large. Maximum size is 5 MB.',413);
 const format=bytes[0]===0xff&&bytes[1]===0xd8?'jpeg':Buffer.from(bytes.slice(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':Buffer.from(bytes.slice(0,4)).toString()==='RIFF'&&Buffer.from(bytes.slice(8,12)).toString()==='WEBP'?'webp':null;
 if(!format)throw new AccessError('Use a JPEG, PNG or WebP receipt under 5 MB.',400);
 try{const image=sharp(bytes,{limitInputPixels:20000000,animated:false});const metadata=await image.metadata();if(metadata.format!==format||!metadata.width||!metadata.height)throw new Error();
 const output=await image.rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toBuffer();if(output.length>5*1024*1024)throw new Error();return output;
 }catch{throw new AccessError('This receipt image could not be read. Choose a clear JPEG, PNG or WebP.',400);}
}
