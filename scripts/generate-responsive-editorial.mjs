// Resize only; preserve approved artwork and originals.
import sharp from 'sharp';
import fs from 'node:fs/promises';
const sources=[
 '/assets/home-collections/teddy-classic-cuddles-complete.webp',
 '/assets/home-collections/bunny-sweet-friends-complete.webp',
 '/assets/home-collections/wild-wonderful-complete.webp',
 '/assets/home-story/why-softhaven-main-complete.webp',
 '/assets/home-story/why-softhaven-detail-complete.webp',
 '/assets/home-story/softhaven-five-companions-complete.webp',
 '/assets/collections/soft-family-editorial-final-complete.webp',
 '/images/collections/bunny-sweet-friends.webp',
 '/images/collections/wild-wonderful.webp',
];
await fs.mkdir('public/assets/responsive',{recursive:true});let before=0,after=0;const manifest={};
for(let i=0;i<sources.length;i++){
 const source='public'+sources[i];before+=(await fs.stat(source)).size;const outputs={};
 for(const width of [384,640,960,1440]){const file=`/assets/responsive/editorial-${i}-${width}.webp`;await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:86}).toFile('public'+file);outputs[width]=file;if(width===640)after+=(await fs.stat('public'+file)).size;}
 manifest[sources[i]]=outputs;
}
await fs.writeFile('lib/responsive-editorial.json',JSON.stringify(manifest,null,2)+'\n');console.log({originalBytes:before,all640pxBytes:after});
