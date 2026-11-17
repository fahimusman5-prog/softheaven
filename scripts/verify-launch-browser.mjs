import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium, firefox, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://localhost:3038';
const dir='artifacts/launch-readiness/browser'; await fs.mkdir(dir,{recursive:true});
const widths=[320,360,375,390,393,414,430,480,768,1024,1440];
const routes=['/','/shop','/collections','/product/aurelius-heritage-bear','/cart','/checkout','/account','/about','/contact','/order-confirmation','/account/orders/11111111-1111-4111-8111-111111111111','/admin','/does-not-exist'];
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];const exceptions=[];
try {
 const context=await browser.newContext({reducedMotion:'reduce',ignoreHTTPSErrors:true});
 const queue=routes.flatMap(route=>widths.map(width=>({route,width})));
 await Promise.all(Array.from({length:3},async()=>{
  const page=await context.newPage(); page.on('pageerror',error=>exceptions.push(error.message));
  for(;;){const task=queue.shift();if(!task) break;
   await page.setViewportSize({width:task.width,height:900});
   const response=await page.goto(base+task.route,{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('h1').first().waitFor({timeout:10000});
   await page.waitForTimeout(200);
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelector('h1')?.textContent,brokenImages:Array.from(document.images).filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.getAttribute('src'))}));
   results.push({...task,status:response.status(),...geometry});
   if([320,390,768,1440].includes(task.width)&&['/','/shop','/contact'].includes(task.route)) await page.screenshot({path:dir+'/'+task.route.replaceAll('/','')+'-'+task.width+'.png',fullPage:true});
  }await page.close();
 }));
 await fs.writeFile(dir+'/viewport-results.json',JSON.stringify({results,exceptions},null,2));
 const page=await context.newPage();await page.setViewportSize({width:320,height:780});await page.goto(base+'/shop',{waitUntil:'domcontentloaded'});
 const panel=page.locator('.sfh-mobile-panel'); await panel.waitFor({state:'visible'}); const logo=await panel.locator('img').boundingBox();const icons=await panel.locator('.sfh-mobile-action').all();const bounds=await Promise.all(icons.map(x=>x.boundingBox()));
 assert.ok(bounds.every(b=>b.width>=44&&b.height>=44));assert.ok(logo.x+logo.width<=bounds[0].x);
 await page.getByRole('button',{name:'Open menu',exact:true}).waitFor({state:'visible'});await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
 await page.keyboard.press('Escape');await page.waitForTimeout(80);assert.equal(await page.getByRole('button',{name:'Open menu',exact:true}).evaluate(e=>e===document.activeElement),true);
 await page.getByRole('button',{name:'Open search',exact:true}).click();await page.locator('#mobile-product-search').fill('Teddy');await page.locator('.sfh-mobile-search').getByRole('button',{name:'Submit product search'}).click();await page.waitForURL('**/shop?search=Teddy');
 await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});assert.ok(await page.getByRole('button',{name:'Continue in WhatsApp'}).isDisabled());
 const contactCalls=[];page.on('request',r=>{if(r.url().includes('/api/contact'))contactCalls.push(r.url());});assert.equal(contactCalls.length,0);
 const internal=await context.request.get(base+'/api/internal/order-emails');assert.equal(internal.status(),401);
 const retired=await context.request.post(base+'/api/contact');assert.equal(retired.status(),410);
 const checkout=await context.request.post(base+'/api/checkout',{headers:{Origin:base},data:{lines:[]}});assert.equal(checkout.status(),400);
 await fs.writeFile(dir+'/chromium-results.json',JSON.stringify({engine:await browser.version(),results,exceptions,interactionChecks:['320px logo/control geometry','44px targets','menu scroll lock/Escape/focus return','search navigation','unconfigured WhatsApp disabled','worker 401','legacy contact 410','invalid checkout 400']},null,2));
 console.log(JSON.stringify({engine:'Chrome',cases:results.length,overflow:results.filter(r=>r.overflow>1),exceptions}));
 assert.equal(results.filter(r=>r.overflow>1).length,0);assert.equal(exceptions.length,0);
}finally{await browser.close();}
if(process.env.SKIP_SECONDARY === '1') process.exit(0);
for(const [name,engine,executablePath] of [['Firefox',firefox,process.env.FIREFOX_PATH],['WebKit',webkit,process.env.WEBKIT_PATH]]){
 let instance;
 try{instance=await engine.launch({headless:true,env:{...process.env,TMPDIR:'/tmp'},...(executablePath?{executablePath}:{})});const page=await instance.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',ignoreHTTPSErrors:true});const checks=[];
  for(const route of ['/','/shop','/contact','/cart','/checkout']){await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});await page.locator('h1').first().waitFor();if(route !== '/checkout') await page.locator('.sfh-mobile-panel').waitFor({state:'visible'});await page.waitForTimeout(200);checks.push({route,overflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)});}
  await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Open menu',exact:true}).waitFor({state:'visible'});await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.keyboard.press('Escape');await page.screenshot({path:dir+'/'+name+'-contact.png',fullPage:true});
  const result={engine:name,version:instance.version(),checks};await fs.writeFile(dir+'/'+name+'-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));assert.ok(checks.every(c=>c.overflow<=1));
 }catch(error){await fs.writeFile(dir+'/'+name+'-error.txt',String(error));console.log(name+': '+error.message);process.exitCode=1;}finally{await instance?.close();}
}
