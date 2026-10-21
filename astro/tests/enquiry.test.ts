import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnquiryHandler } from '../src/server/enquiry';
import { smtpAddresses, smtpDelivery } from '../src/server/smtp';
import { createEnquiryLimiter } from '../src/server/rate-limit';
import type { SMTPSentMessageInfo } from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
const mailConfig = { user:'mock', pass:'mock', from:'sender@example.invalid', to:'recipient@example.invalid' };
const accepted = { accepted:['recipient@example.invalid'], rejected:[], response:'250 queued', messageId:'mock-id', envelope:{from:mailConfig.from,to:[mailConfig.to]}, envelopeTime:1, messageTime:1, messageSize:100 } satisfies SMTPSentMessageInfo;
import { validateEnquiry, MESSAGE_MAX, REQUEST_MAX_BYTES } from '../src/lib/enquiry';
const valid = { source: 'contact-form', name: 'Preview Tester', email: 'preview@example.invalid', phone: '0400 000 000', company: 'Example Test Company', brief: 'A controlled mock enquiry for an event.' };
const request = (body: unknown, headers: Record<string,string> = {}) => new Request('https://preview.example/api/lead', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
for (const source of ['contact-form', 'chat']) test(`preserves ${source} payload and provider attribution`, async () => {
 let email: SendMailOptions = {};
 const deliver = smtpDelivery(mailConfig, () => ({sendMail:async mail => {email=mail;return accepted},close:()=>{}}));
 const handler = createEnquiryHandler({limit:async()=>true,deliver});
 const response = await handler(request({...valid,source,timeframe:'December',location:'Perth',budgetConstraint:'Discuss options'}), 'test');
 assert.equal(response.status,200); assert.equal((await response.json()).ok,true);
 assert.match(email.text as string,/Example Test Company/); assert.match(email.text as string,/December/); assert.match(email.text as string,/Perth/);
 assert.equal(email.replyTo, valid.email); assert.match(email.subject as string, source==='chat' ? /chat assistant/ : /contact form/);
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
for(const [name,result] of [
 ['recipient rejected',{...accepted,accepted:[],rejected:[mailConfig.to]}],
 ['no accepted recipient',{...accepted,accepted:[]}],
 ['different recipient',{...accepted,accepted:['someoneelse@example.invalid']}],
 ['server rejection',{...accepted,response:'550 rejected'}],
] as const) test(`SMTP ${name} never reports success`,async()=>{
 let closed=false;
 const deliver=smtpDelivery(mailConfig,()=>({sendMail:async()=>result as SMTPSentMessageInfo,close:()=>{closed=true}}));
 const h=createEnquiryHandler({limit:async()=>true,deliver});
 assert.equal((await h(request(valid),'test')).status,502);assert.equal(closed,true);
});
test('SMTP network failures close connection and never report success or retry',async()=>{
 let attempts=0,closed=false;
 const deliver=smtpDelivery(mailConfig,()=>({sendMail:async()=>{attempts++;throw Error('offline')},close:()=>{closed=true}}));
 const h=createEnquiryHandler({limit:async()=>true,deliver});
 assert.equal((await h(request(valid),'test')).status,502);assert.equal(attempts,1);assert.equal(closed,true);
});
test('SMTP requires credentials and a valid port before opening a connection',async()=>{
 for(const config of [{...mailConfig,user:''},{...mailConfig,pass:''},{...mailConfig,from:''},{...mailConfig,to:''},{...mailConfig,port:'invalid'},{...mailConfig,port:'0'}]) {
  const deliver=smtpDelivery(config,()=>{throw Error('must not connect')});
  assert.equal(await deliver(validateEnquiry(valid).data!),false);
 }
});
test('SMTP uses encrypted SMTP2GO with bounded timeouts and the configured recipient',async()=>{
 let closed=false;
 const deliver=smtpDelivery({...mailConfig,to:'enquiry@bloomneventsco.com.au'},options=>{
  assert.equal(options.host,'mail-au.smtp2go.com');assert.equal(options.port,2525);
  assert.equal(options.requireTLS,true);assert.equal(options.secure,false);
  assert.equal(options.tls?.minVersion,'TLSv1.2');assert.equal(options.socketTimeout,15000);
  return {sendMail:async mail=>{assert.equal(mail.to,'enquiry@bloomneventsco.com.au');return {...accepted,accepted:['enquiry@bloomneventsco.com.au']}},close:()=>{closed=true}};
 });
 assert.equal(await deliver(validateEnquiry(valid).data!),true);assert.equal(closed,true);
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

test('Upstash timeout with success=true fails closed without sending mail',async()=>{
 const limit=createEnquiryLimiter({redisUrl:'https://example.invalid',redisToken:'mock'},()=>({limit:async()=>({success:true,reason:'timeout'})}));
 let sent=false;
 const handler=createEnquiryHandler({limit,deliver:async()=>{sent=true;return true}});
 assert.equal((await handler(request(valid),'test')).status,503);assert.equal(sent,false);
});
test('shared limiter refuses missing credentials and respects exhaustion',async()=>{
 const absent=createEnquiryLimiter({},()=>{throw Error('must not construct')});
 await assert.rejects(()=>absent('test'),/unavailable/);
 const exhausted=createEnquiryLimiter({redisUrl:'https://example.invalid',redisToken:'mock'},()=>({limit:async()=>({success:false})}));
 assert.equal(await exhausted('test'),false);
});

test('retains established SMTP address variables and explicit recipient override',()=>{
 const legacy={SMTP_FROM:'sender@example.invalid',ENQUIRIES_EMAIL:'legacy@example.invalid'};
 assert.deepEqual(smtpAddresses(legacy),{from:legacy.SMTP_FROM,to:legacy.ENQUIRIES_EMAIL});
 assert.deepEqual(smtpAddresses({...legacy,LEAD_TO_EMAIL:'enquiry@bloomneventsco.com.au'}),{from:legacy.SMTP_FROM,to:'enquiry@bloomneventsco.com.au'});
 assert.deepEqual(smtpAddresses({CONTACT_FROM_EMAIL:'contact@example.invalid',CONTACT_TO_EMAIL:'inbox@example.invalid'}),{from:'contact@example.invalid',to:'inbox@example.invalid'});
 assert.deepEqual(smtpAddresses({...legacy,LEAD_FROM_EMAIL:'override@example.invalid'}),{from:'override@example.invalid',to:legacy.ENQUIRIES_EMAIL});
});
