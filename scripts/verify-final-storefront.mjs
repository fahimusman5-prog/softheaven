// Read-only catalogue and local browser state. Never creates hosted orders or sends messages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://localhost:3046';
const dir='artifacts/deployment-sync/final-storefront';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage();const exceptions=[];page.on('pageerror',error=>exceptions.push(error.message));
 for(const width of [320,360,375,390,393,414,430,768,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/shop',{waitUntil:'domcontentloaded'});
  const search=page.getByRole('textbox',{name:'Search products',exact:true}),sort=page.getByRole('combobox',{name:'Sort products',exact:true});await search.waitFor();
  const firstName=await page.locator('.product-card:visible h3').first().textContent();
  await search.fill('  '+firstName+'  ');await page.waitForFunction(()=>document.querySelectorAll('.product-card').length===1);
  assert.equal(await page.locator('.product-card:visible h3').textContent(),firstName);
  await search.fill('no-such-companion-test');await page.getByRole('heading',{name:'No soft companions found'}).waitFor();
  await page.getByRole('button',{name:'Browse all companions →'}).click();
  const all=page.locator('.category-tabs').getByRole('button',{name:'All',exact:true});assert.equal(await all.getAttribute('aria-pressed'),'true');
  for(const category of await page.locator('.category-tabs button:visible').all()){
   await category.click();assert.equal(await category.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.category-tabs button[aria-pressed=true]:visible').count(),1);
   await search.fill('no-such-companion-test');assert.equal(await page.locator('.product-card:visible').count(),0);await search.fill('');
  }
  await all.click();
  for(const [label,ascending] of [['Price: low to high',true],['Price: high to low',false]]){
   await sort.selectOption({label});const values=await page.locator('.price-stack strong:visible').allTextContents();const prices=values.map(value=>Number(value.replace(/[^\d.]/g,'')));
   assert.deepEqual(prices,[...prices].sort((a,b)=>ascending?a-b:b-a));
  }
  const inputBox=await search.boundingBox(),sortBox=await sort.boundingBox();if(width<=767)assert.ok(inputBox.y+inputBox.height<=sortBox.y+1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:dir+'/shop-'+width+'.png'});results.push({width,shop:'search/reset/category/sort and control geometry pass'});
 }
 await page.goto(base,{waitUntil:'domcontentloaded'});const dots=page.locator('.portrait-carousel__dots button');await dots.first().waitFor();
 const active=()=>dots.evaluateAll(elements=>elements.findIndex(element=>element.getAttribute('aria-pressed')==='true'));
 const before=await active();const next=await page.getByRole('button',{name:'Next slide',exact:true}).boundingBox();await page.touchscreen.tap(next.x+next.width/2,next.y+next.height/2);
 await page.waitForFunction(index=>[...document.querySelectorAll('.portrait-carousel__dots button')].findIndex(e=>e.getAttribute('aria-pressed')==='true')!==index,before);
 await page.getByRole('button',{name:'Previous slide',exact:true}).click();assert.equal(await active(),before);
 await dots.last().click();assert.equal(await active(),await dots.count()-1);
 await page.getByRole('button',{name:'Pause carousel autoplay',exact:true}).click();await page.getByRole('button',{name:'Resume carousel autoplay',exact:true}).waitFor();
 await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});await page.getByRole('textbox',{name:'Phone number *',exact:true}).waitFor();
 assert.equal(await page.getByRole('textbox',{name:'Phone number *',exact:true}).getAttribute('required'),'');assert.equal(await page.getByRole('textbox',{name:'Email address (optional)',exact:true}).getAttribute('required'),null);
 assert.ok(await page.getByRole('button',{name:'Continue to WhatsApp ♡'}).isDisabled());
 const robots=await context.request.get(base+'/robots.txt');assert.match(await robots.text(),/Disallow: \/$/m);
 const sitemap=await context.request.get(base+'/sitemap.xml');assert.doesNotMatch(await sitemap.text(),/<loc>/);
 const privateResponse=await context.request.get(base+'/api/admin/deployment');assert.equal(privateResponse.status(),401);assert.match(privateResponse.headers()['x-robots-tag'],/noindex/);
 assert.deepEqual(exceptions,[]);await fs.writeFile(dir+'/results.json',JSON.stringify({results,checks:['emulated Chrome touch carousel','optional email / required phone','missing WhatsApp safely disabled','nonproduction robots/sitemap','protected diagnostics'],exceptions},null,2));
 console.log('PASS: shop search/category/sorting at all 12 requested widths, emulated touch carousel, contact fields, indexing and protected diagnostics.');
}finally{await browser.close();}
