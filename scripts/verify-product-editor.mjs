// Browser component test with fake transport. This never authenticates or writes to Supabase.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {build}=require('esbuild');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=process.cwd(),tmp='/tmp/softhaven-editor-harness';await fs.mkdir(tmp,{recursive:true});
await fs.writeFile(tmp+'/navigation.ts', `export const useRouter=()=>({replace:(url)=>{window.__destination=url}});`);
await fs.writeFile(tmp+'/link.tsx', `import React from '${root}/node_modules/react/index.js';export default function Link(props){return <a {...props}/>}`);
await fs.writeFile(tmp+'/entry.tsx', `import React from '${root}/node_modules/react/index.js';import{createRoot}from '${root}/node_modules/react-dom/client.js';import{CatalogueEditor}from '${root}/components/admin/catalogue-editors.tsx';createRoot(document.getElementById('root')).render(<CatalogueEditor resource="products" id={new URLSearchParams(location.search).get('id')||'new'} role="SUPER_ADMIN"/>);`);
await build({entryPoints:[tmp+'/entry.tsx'],outfile:tmp+'/bundle.js',bundle:true,platform:'browser',jsx:'automatic',alias:{'@':root,'next/link':tmp+'/link.tsx','next/navigation':tmp+'/navigation.ts'},nodePaths:[root+'/node_modules'],define:{'process.env.NODE_ENV':'"production"'}});
const css=await fs.readFile('app/admin/admin.css','utf8');const js=await fs.readFile(tmp+'/bundle.js');
const server=createServer((req,res)=>{if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else res.end(`<html><head><style>body{margin:0}.admin-app{padding:24px}${css}</style></head><body class="admin-app"><div id="root"></div><script src="/bundle.js"></script></body></html>`);});
await new Promise(resolve=>server.listen(3039,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1280,height:900}});let saved;const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const row={id:'existing-bear',name:'Existing Bear',slug:'existing-bear',price:100,status:'draft',description:'A bear',images:[],details:[]};
 await p.route('**/api/admin/**',async route=>{const req=route.request();if(req.method()==='POST'){saved=req.postDataJSON();return route.fulfill({json:{id:saved.id||'new-bear'}});}const url=new URL(req.url());if(url.pathname.endsWith('/business/products'))return route.fulfill({json:{rows:[row]}});return route.fulfill({json:{rows:[],count:0}});});
 await p.goto('http://127.0.0.1:3039');await p.getByRole('heading',{name:'Add product',exact:true}).waitFor();
 await p.getByText('Drop images here or choose files',{exact:true}).waitFor();
 const sections=await p.locator('.admin-product-section h2').allTextContents();assert.equal(sections.length,8);assert.match(sections[2],/Colours & Variants/);assert.match(sections[3],/Pricing/);
 await p.getByLabel('Name',{exact:false}).first().fill('Cloud Bear');assert.equal(await p.getByLabel('URL handle').inputValue(),'cloud-bear');await p.getByRole('button',{name:'Save Draft',exact:true}).click();await p.waitForFunction(()=>window.__destination);assert.equal(saved.values.status,'draft');assert.equal(saved.values.price,0);assert.equal(saved.id,undefined);
 await p.goto('http://127.0.0.1:3039/?id=existing-bear');await p.getByRole('heading',{name:'Existing Bear',exact:true}).waitFor();await p.getByLabel('Name',{exact:false}).first().fill('Updated Bear');await p.getByRole('button',{name:'Save Changes',exact:true}).click();await p.getByText('Product saved.',{exact:true}).waitFor();assert.equal(saved.id,'existing-bear');assert.equal(saved.values.name,'Updated Bear');
 await p.getByRole('button',{name:'Publish Product',exact:true}).click();await p.locator('.admin-product-save [role=alert]').waitFor();assert.match(await p.locator('.admin-product-save [role=alert]').textContent(),/Required before publishing/);
 await p.screenshot({path:'artifacts/launch-readiness/browser/product-editor-desktop.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'artifacts/launch-readiness/browser/product-editor-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: simulated API component test: eight ordered sections, automatic handle, draft save, stable edit ID, incomplete publish rejection, desktop/mobile rendering. Real admin auth/storage writes not tested.');
}finally{await browser.close();server.close();}
