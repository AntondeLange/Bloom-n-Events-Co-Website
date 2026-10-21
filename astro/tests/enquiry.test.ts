import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnquiryHandler, postmarkDelivery } from '../src/server/enquiry';
import { validateEnquiry, MESSAGE_MAX, REQUEST_MAX_BYTES } from '../src/lib/enquiry';
const valid = { source: 'contact-form', name: 'Preview Tester', email: 'preview@example.invalid', phone: '0400 000 000', company: 'Example Test Company', brief: 'A controlled mock enquiry for an event.' };
const request = (body: unknown, headers: Record<string,string> = {}) => new Request('https://preview.example/api/lead', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
for (const source of ['contact-form', 'chat']) test(`preserves ${source} payload and provider attribution`, async () => {
 let email: Record<string,unknown> = {};
 const deliver = postmarkDelivery({ token:'mock', from:'sender@example.invalid', to:'recipient@example.invalid' }, async (_url, init) => { email = JSON.parse(init!.body as string); return Response.json({ ErrorCode:0, MessageID:'mock-id' }); });
 const handler = createEnquiryHandler({limit:async()=>true,deliver});
 const response = await handler(request({...valid,source,timeframe:'December',location:'Perth',budgetConstraint:'Discuss options'}), 'test');
 assert.equal(response.status,200); assert.equal((await response.json()).ok,true);
 assert.match(email.TextBody as string,/Example Test Company/); assert.match(email.TextBody as string,/December/); assert.match(email.TextBody as string,/Perth/);
 assert.equal(email.ReplyTo, valid.email); assert.match(email.Subject as string, source==='chat' ? /chat assistant/ : /contact form/);
});
test('honeypot consumes limiter but never emails', async()=>{
 let delivered=0,limited=0;
 const h=createEnquiryHandler({limit:async()=>{limited++;return true},deliver:async()=>{delivered++;return true}});
 assert.equal((await h(request({...valid,companyWebsite:'spam'}),'test')).status,200);assert.equal(delivered,0);assert.equal(limited,1);
});
test('rate limiting and limiter outages fail closed',async()=>{
 for(const limit of [async()=>false,async()=>{throw Error('unavailable')}]){
  let delivered=false;const h=createEnquiryHandler({limit,deliver:async()=>{delivered=true;return true}});
  const r=await h(request(valid),'test');assert.ok([429,503].includes(r.status));assert.equal(delivered,false);
 }
});
for(const [field,value] of [['email',{}],['name',[]],['brief',true],['company',42],['source','spoofed'],['phone','invalid'],['email','a@example.invalid\r\nBcc:other@example.invalid'],['company','two\nlines'],['brief','x'.repeat(MESSAGE_MAX+1)]]) test(`rejects invalid ${field} ${typeof value}`,async()=>{
 let sent=false;const h=createEnquiryHandler({limit:async()=>true,deliver:async()=>{sent=true;return true}});
 assert.equal((await h(request({...valid,[field as string]:value}),'test')).status,400);assert.equal(sent,false);
});
test('permits bounded 5000-character brief',()=>assert.ok(validateEnquiry({...valid,brief:'a'.repeat(MESSAGE_MAX)}).data));
test('rejects malformed JSON, arrays, null, unsupported type and oversized actual stream',async()=>{
 const h=createEnquiryHandler({limit:async()=>true,deliver:async()=>true});
 for(const raw of ['{','[]','null']) assert.equal((await h(request(raw),'test')).status,400);
 assert.equal((await h(request('{}',{'content-type':'text/plain'}),'test')).status,415);
 assert.equal((await h(request('a'.repeat(REQUEST_MAX_BYTES+1)),'test')).status,413);
 assert.equal((await h(request('{}',{'content-length':String(REQUEST_MAX_BYTES+1)}),'test')).status,413);
});
test('rejects cross-origin submission',async()=>{
 const h=createEnquiryHandler({limit:async()=>true,deliver:async()=>true});assert.equal((await h(request(valid,{origin:'https://other.example'}),'test')).status,403);
});
for(const [name,provider] of [
 ['HTTP error',async()=>Response.json({ErrorCode:0,MessageID:'id'},{status:500})],
 ['application error',async()=>Response.json({ErrorCode:300,Message:'Invalid'})],
 ['non-JSON success',async()=>new Response('<html>ok</html>')],
 ['malformed JSON',async()=>new Response('{',{headers:{'content-type':'application/json'}})],
 ['network error',async()=>{throw Error('offline')}],
] as const) test(`provider ${name} never reports success`,async()=>{
 const h=createEnquiryHandler({limit:async()=>true,deliver:postmarkDelivery({token:'mock',from:'from',to:'to'},provider)});
 assert.equal((await h(request(valid),'test')).status,502);
});
test('native form uses same payload, source, honeypot and redirect',async()=>{
 let payload:any;const h=createEnquiryHandler({limit:async()=>true,deliver:async d=>{payload=d;return true}});
 const r=await h(new Request('https://preview.example/api/contact',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({firstName:'Preview',lastName:'Tester',email:valid.email,phone:valid.phone,company:valid.company,message:valid.brief,website:'',source:'contact-form'})}),'test',true);
 assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/contact-success');assert.equal(payload.company,valid.company);assert.equal(payload.source,'contact-form');
});
test('native failure preserves escaped values with no-store and no personal redirect',async()=>{
 const h=createEnquiryHandler({limit:async()=>true,deliver:async()=>false});
 const r=await h(new Request('https://preview.example/api/contact',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({firstName:'<script>alert(1)</script>',lastName:'Tester',email:valid.email,phone:valid.phone,company:valid.company,message:valid.brief,source:'contact-form'})}),'test',true);
 assert.equal(r.status,502);const html=await r.text();assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes(valid.brief));assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('location'),null);
});
