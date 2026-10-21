/** Local production-artifact harness. External email/Redis are always mocked. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createEnquiryHandler } from '../src/server/enquiry';
import { smtpDelivery } from '../src/server/smtp';
import type { SMTPSentMessageInfo } from 'nodemailer';
const root = resolve(import.meta.dirname, '../dist/client');
const types: Record<string,string> = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.avif':'image/avif','.woff2':'font/woff2'};
createServer(async(req,res)=>{
 try {
  const url=new URL(req.url!, 'http://' + req.headers.host);
  if(url.pathname.startsWith('/api/')){
   const chunks:Buffer[]=[];for await(const c of req)chunks.push(c);
   const request=new Request(url,{method:req.method,headers:req.headers as Record<string,string>,body:Buffer.concat(chunks)});
   const delivery=smtpDelivery({user:'mock',pass:'mock',from:'preview@example.invalid',to:'inbox@example.invalid'},()=>({sendMail:async()=>({accepted:['inbox@example.invalid'],rejected:[],response:'250 queued',messageId:'mock-id',envelope:{from:'preview@example.invalid',to:['inbox@example.invalid']},envelopeTime:1,messageTime:1,messageSize:100} satisfies SMTPSentMessageInfo),close:()=>{}}));
   const h=createEnquiryHandler({limit:async()=>true,deliver:delivery});
   const r=await h(request,'local-test',url.pathname==='/api/contact');res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;
  }
  let file=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));
 }catch {res.writeHead(404);res.end('Not found');}
}).listen(4324,'127.0.0.1');
