import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const pages=['/','/contact','/gallery','/events','/workshops','/displays','/case-study-hawaiian-neighbourhood-nibbles'];
for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[844,390],[768,1024],[1440,1000]]) test(`routes, menu and chat at ${width}x${height}`, async({page})=>{
 await page.setViewportSize({width,height});
 await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of pages){
  const r=await page.goto(path);expect(r?.status()).toBe(200);
  await expect(page.locator('astro-island[component-export="default"]').first()).not.toHaveAttribute('ssr','');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' overflow').toBe(true);
  await expect(page.locator('h1')).toHaveCount(1);
  if(width<1024){
   const toggle=page.getByLabel('Toggle menu');await toggle.click();
   const panel=page.locator('#mobile-menu-panel');await expect(panel).toBeVisible();
   const rect=await panel.boundingBox();expect(rect!.y).toBeGreaterThanOrEqual(-1);expect(rect!.y+rect!.height).toBeLessThanOrEqual(height+1);
   await page.keyboard.press('Escape');await expect(panel).not.toBeVisible();
   await toggle.click();await page.mouse.click(width - 4, 4);await expect(panel).not.toBeVisible();
  }
  await page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true}).click();
  const chat=page.getByRole('dialog',{name:'Bloom concierge chat'});await expect(chat).toBeVisible();
  for(const control of [page.getByLabel('Close chat'),chat.getByLabel('Your message'),chat.getByRole('button',{name:'Send',exact:true})]){
   const r=await control.boundingBox();expect(r!.y).toBeGreaterThanOrEqual(0);expect(r!.y+r!.height).toBeLessThanOrEqual(height+1);
  }
  expect(await chat.getByLabel('Your message').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  await page.keyboard.press('Escape');await expect(chat).not.toBeVisible();await expect(page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true})).toBeFocused();
 }
 expect(errors).toEqual([]);
});
test('form validates inline, preserves failure, prevents duplicates, then delivers through mock provider',async({page})=>{
 await page.goto('/contact');await page.waitForFunction(()=>document.querySelector<HTMLFormElement>('#contactForm')?.noValidate);
 await page.getByRole('button',{name:'Send Message'}).click();await expect(page.locator('#firstName')).toBeFocused();
 await page.locator('#firstName').fill('Preview');await page.locator('#lastName').fill('Tester');await page.locator('#email').fill('preview@example.invalid');await page.locator('#phone').fill('0400000000');await page.locator('#company').fill('Example Test Company');await page.locator('#message').fill('A mock preview event enquiry with sufficient detail.');
 let count=0;await page.route('**/api/contact',async route=>{count++;const body=route.request().postDataJSON();expect(body.company).toBe('Example Test Company');expect(body.source).toBe('contact-form');expect(body.companyWebsite).toBe('');await new Promise(r=>setTimeout(r,200));await route.fulfill({status:502,json:{ok:true}});});
 await page.getByRole('button',{name:'Send Message'}).dblclick();await expect(page.getByText("We couldn't send your message.",{exact:false})).toBeVisible();expect(count).toBe(1);await expect(page.locator('#company')).toHaveValue('Example Test Company');
 await page.unroute('**/api/contact');await page.getByRole('button',{name:'Send Message'}).click();await expect(page.getByText('Your message has been sent to the team.',{exact:false})).toBeVisible();await expect(page.locator('#message')).toHaveValue('');
});
test('native form works without JavaScript through mock delivery',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('/contact');
 for(const [id,value] of Object.entries({firstName:'Preview',lastName:'Tester',email:'preview@example.invalid',phone:'0400000000',company:'Mock company',message:'A controlled native form test enquiry.'}))await page.locator('#'+id).fill(value);
 await page.getByRole('button',{name:'Send Message'}).click();await expect(page).toHaveURL(/contact-success/);await context.close();
});
test('changed form and chat interactions have no serious or critical axe violations',async({page})=>{
 await page.goto('/contact');await page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true}).click();
 const results=await new AxeBuilder({page}).include('#contactForm').include('.bloom-chat').analyze();
 expect(results.violations.filter(x=>['serious','critical'].includes(x.impact!))).toEqual([]);
});
test('gallery lightbox keyboard navigation, dismissal and scroll restoration',async({page})=>{
 await page.goto('/gallery');await page.waitForTimeout(500);
 const triggers=page.locator('main [data-lightbox="true"]');
 if(await triggers.count()){
  const trigger=triggers.first();await trigger.scrollIntoViewIfNeeded();const y=await page.evaluate(()=>scrollY);await trigger.click();
  await expect(page.locator('.image-lightbox')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.image-lightbox')).toHaveCount(0);
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(3);await expect(trigger).toBeFocused();
 }else{
  const trigger=page.locator('main .carousel-item.active img[role="button"]').first();
  await trigger.scrollIntoViewIfNeeded();const y=await page.evaluate(()=>scrollY);await trigger.focus();await trigger.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Full-size image preview'});await expect(dialog).toBeVisible();
  const original=await dialog.locator('img').getAttribute('alt');
  await page.keyboard.press('ArrowRight');await expect(dialog.locator('img')).not.toHaveAttribute('alt',original!);
  await page.keyboard.press('ArrowLeft');await expect(dialog.locator('img')).toHaveAttribute('alt',original!);
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(3);
 }
});
test('analytics acceptance, refusal, remembered refusal and parameter privacy with mocked Google',async({page})=>{
 let googleRequests=0;
 await page.route('https://www.googletagmanager.com/**',async route=>{googleRequests++;await route.fulfill({body:'/* mock analytics only */',contentType:'text/javascript'});});
 const configured=async()=>{
  await page.route('**/contact',async route=>{const r=await route.fetch();const html=(await r.text()).replace(/data-ga-id(?:="[^"]*")?/, 'data-ga-id="G-PREVIEWTEST"');await route.fulfill({response:r,body:html});});
  await page.goto('/contact');
 };
 await configured();await expect(page.locator('#analytics-consent-banner')).toBeVisible();expect(googleRequests).toBe(0);
 await page.getByRole('button',{name:'Decline analytics'}).click();await page.reload();await expect(page.locator('#analytics-consent-banner')).toHaveCount(0);expect(googleRequests).toBe(0);
 await page.evaluate(()=>localStorage.removeItem('bloom_analytics_consent'));await page.reload();await page.getByRole('button',{name:'Accept analytics'}).click();await expect.poll(()=>googleRequests).toBe(1);
 await page.evaluate(()=>{(window as any).bloomTrack('lead_form_submitted',{form_id:'contact_form',email:'do-not-track@example.invalid',brief:'private brief',phone:'0400000000',flow:'private value'});(window as any).bloomTrack('unknown_private_event',{name:'private'});});
 const queue=await page.evaluate(()=>JSON.stringify((window as any).dataLayer));expect(queue).not.toContain('do-not-track');expect(queue).not.toContain('private brief');expect(queue).not.toContain('0400000000');expect(queue).not.toContain('unknown_private_event');expect(queue).toContain('page_view');expect(queue).toContain('contact_form');
});
test('reduced motion disables hero playback and transitions',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.waitForTimeout(300);
 expect(await page.locator('#hero-video').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true}).click();
 expect(await page.getByLabel('Close chat').evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration))).toBeLessThan(.01);
});
test('visual viewport contraction keeps chat controls reachable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/contact');
 await page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true}).click();
 // Simulate visualViewport height/offset events, not a physical iOS keyboard.
 await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,value:330});visualViewport!.dispatchEvent(new Event('resize'));});
 await expect.poll(async()=>{const r=await page.getByLabel('Your message').boundingBox();return r!.y+r!.height;}).toBeLessThan(330);
 const close=await page.getByLabel('Close chat').boundingBox();expect(close!.y).toBeGreaterThan(0);
});
