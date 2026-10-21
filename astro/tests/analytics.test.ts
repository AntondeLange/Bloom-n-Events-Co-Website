import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../public/scripts/analytics.js',import.meta.url),'utf8');
function run(stored:string|null){
 class HTMLScriptElement {dataset={gaId:'G-PREVIEWTEST'};async=false;src='';}
 const elements=new Map();const listeners:Record<string,Function>={};const scripts:any[]=[];
 const doc:any={currentScript:new HTMLScriptElement(),title:'Contact',referrer:'https://example.invalid/private?email=secret',readyState:'complete',head:{appendChild:(el:any)=>scripts.push(el)},body:{appendChild:(el:any)=>elements.set(el.id,el)},getElementById:(id:string)=>elements.get(id),createElement:(type:string)=>type==='script'?new HTMLScriptElement():{setAttribute(){},querySelector(){return null}},addEventListener:(name:string,cb:Function)=>{listeners[name]=cb}};
 const window:any={location:{origin:'https://preview.example',pathname:'/contact'}};
 vm.runInNewContext(script,{document:doc,window,HTMLScriptElement,HTMLButtonElement:class{},Element:class{},URL,localStorage:{getItem:()=>stored,setItem(){}},Set,Date});return{window,elements,scripts};
}
test('remembered refusal neither loads Google nor prompts again',()=>{const r=run('denied');assert.equal(r.scripts.length,0);assert.equal(r.elements.size,0);});
test('accepted analytics only sends approved fields and removes referrer/query detail',()=>{
 const {window,scripts}=run('granted');assert.equal(scripts.filter(x=>x.src).length,1);
 window.bloomTrack('lead_form_submitted',{form_id:'contact_form',email:'secret@example.invalid',brief:'private brief',phone:'0400000000'});
 window.bloomTrack('private event',{});
 const text=JSON.stringify(window.dataLayer);for(const secret of ['secret@example.invalid','private brief','0400000000','private event','?email=secret','/private'])assert.ok(!text.includes(secret),secret);assert.ok(text.includes('page_view'));assert.ok(text.includes('contact_form'));
});
