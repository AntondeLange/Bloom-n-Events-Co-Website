import { chromium } from '../../../../astro/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const stats=[];
for(const phase of ['before','after'])for(let run=0;run<3;run++){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
 const page=await context.newPage();
 await page.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='localhost'?route.continue():route.abort();});
 await page.addInitScript(()=>{window.__metrics={lcp:0,cls:0};new PerformanceObserver(l=>{for(const x of l.getEntries())window.__metrics.lcp=x.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const x of l.getEntries())if(!x.hadRecentInput)window.__metrics.cls+=x.value}).observe({type:'layout-shift',buffered:true});});
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1250000,uploadThroughput:625000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const response = await page.goto('http://localhost:'+(phase==='before'?4322:4323)+'/');
 if (response.status() !== 200) throw new Error("Expected a successful built homepage");await page.waitForTimeout(6000);
 stats.push({phase,run,...await page.evaluate(()=>({...window.__metrics,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,htmlBytes:performance.getEntriesByType('navigation')[0].decodedBodySize,loader:!!document.querySelector('.site-loader')}))});await context.close();
}
for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 for(const route of ['','contact']){
  await page.goto('http://localhost:4323/'+route);await page.waitForTimeout(1000);await page.screenshot({path:`/tmp/bloom-maintenance/after-${route||'home'}-${name}.png`});
  if(route==='contact'){await page.getByRole('button',{name:"Chat with Bloom'n Events Co",exact:true}).click();await page.screenshot({path:`/tmp/bloom-maintenance/after-chat-${name}.png`});}
 }
 await page.close();
}
await fs.writeFile('/tmp/bloom-maintenance/performance.json',JSON.stringify(stats,null,2));await browser.close();
