import {templates,defaults,generateWorkflow,validateWorkflow,buildPrompt,simulate} from './engine.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const key='flowforge-ai-draft-v1';let state;try{state={...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{state={...defaults}};let current=generateWorkflow(state);let imported=false;
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function save(){localStorage.setItem(key,JSON.stringify(state));toast('Draft saved in this browser')}
function sync(){ $$('[name]').forEach(el=>{if(state[el.name]!==undefined)el.value=state[el.name]});$('#chatName').textContent=state.business||'Business assistant';$('#promptPreview').textContent=buildPrompt(state);renderFlow() }
function updateFromFields(){ $$('[name]').forEach(el=>{state[el.name]=el.value});localStorage.setItem(key,JSON.stringify(state));$('#promptPreview').textContent=buildPrompt(state);$('#chatName').textContent=state.business||'Business assistant';renderFlow() }
function renderFlow(){const labels=['Meta webhook','Filter incoming text','Check handoff','Use business knowledge','Request AI response','Send WhatsApp reply','Log result'];$('#flowPreview').innerHTML=labels.map((x,i)=>`${i?'<div class="flow-connector"></div>':''}<div class="flow-step"><span>${['◉','⌁','◇','▤','✦','↗','▣'][i]}</span>${x}<small>${String(i+1).padStart(2,'0')}</small></div>`).join('')}
function renderTemplates(){const q=$('#search').value.toLowerCase();const matches=templates.filter(t=>(t.name+' '+t.description+' '+t.category).toLowerCase().includes(q));$('#templateCount').textContent=`${matches.length} templates`;$('#templateGrid').innerHTML=matches.map(t=>`<div class="template-card"><div class="top"><div class="choice-icon blue">${t.icon}</div><span class="badge">${t.badge}</span></div><h3>${t.name}</h3><p>${t.description}</p><div class="bottom"><span>WHATSAPP · N8N</span><button data-template="${t.id}">Use template ↗</button></div></div>`).join('')||'<p>No templates match your search.</p>'}
function renderJson(){const result=validateWorkflow(current);$('#jsonPreview').textContent=JSON.stringify(current,null,2);$('#validation').innerHTML=`<div class="${result.valid?'validation-good':'validation-bad'}">${result.valid?'✓ Structure valid':'✕ Structure has errors'}</div><ul>${[...result.errors,...result.warnings].map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><p style="font-size:11px;color:#8c9aac">${current.nodes?.length||0} nodes · ${Object.keys(current.connections||{}).length} connection sources ${imported?'· Imported file':'· Generated locally'}</p>`}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function generate(){updateFromFields();current=generateWorkflow(state);imported=false;renderJson();toast('Workflow generated and validated')}
function download(){if(!imported)generate();const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(state.name||'flowforge-workflow').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
function navigate(view){$$('.view').forEach(e=>e.classList.toggle('active',e.id===view));$$('[data-view]').forEach(e=>e.classList.toggle('active',e.dataset.view===view));$('#crumb').textContent={dashboard:'Overview',templates:'Template library',builder:'Workflow builder',knowledge:'Knowledge studio',playground:'Conversation lab',json:'JSON & validation',settings:'Settings'}[view]||'Overview';if(view==='json')renderJson();window.scrollTo({top:0,behavior:'smooth'})}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));$$('[name]').forEach(el=>el.addEventListener('input',updateFromFields));$('#search').addEventListener('input',renderTemplates);$('#templateGrid').addEventListener('click',e=>{const b=e.target.closest('[data-template]');if(!b)return;state.template=b.dataset.template;sync();updateFromFields();navigate('builder')});$('#saveTop').addEventListener('click',save);$('#generate').addEventListener('click',generate);$('#generateJson').addEventListener('click',generate);$('#downloadBuilder').addEventListener('click',download);$('#downloadJson').addEventListener('click',download);$('#copyPrompt').addEventListener('click',()=>navigator.clipboard.writeText(buildPrompt(state)).then(()=>toast('Prompt copied')));$('#copyJson').addEventListener('click',()=>navigator.clipboard.writeText(JSON.stringify(current,null,2)).then(()=>toast('JSON copied')));
$('#importJson').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const json=JSON.parse(await file.text());const result=validateWorkflow(json);if(!result.valid)throw Error(result.errors.join(' '));current=json;imported=true;renderJson();toast('Workflow imported for inspection')}catch(err){toast(`Import failed: ${err.message}`)}e.target.value=''});
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const text=$('#chatText').value.trim();if(!text)return;const wrap=$('#chatMessages');const user=document.createElement('div');user.className='bubble user';user.textContent=text;wrap.append(user);const bot=document.createElement('div');bot.className='bubble bot';bot.textContent=simulate(state,text);wrap.append(bot);wrap.scrollTop=wrap.scrollHeight;$('#chatText').value=''});
$('#resetDraft').addEventListener('click',()=>{localStorage.removeItem(key);state={...defaults};sync();generate();toast('Draft reset')});
$('#templateSelect').innerHTML=templates.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');sync();renderTemplates();renderJson();

// Browser installation is optional; the builder remains fully usable in a tab.
let installPrompt;
const installButton=$('#installApp');
const installGuide=$('#installGuide');
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(installed())installButton.hidden=true;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;installButton.hidden=false});
window.addEventListener('appinstalled',()=>{installPrompt=undefined;installButton.hidden=true;installGuide.hidden=false;installGuide.textContent='FlowForge AI is installed on this device.'});
installButton.addEventListener('click',async()=>{
  if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=undefined;return}
  installGuide.hidden=false;
  installGuide.textContent=/iPad|iPhone|iPod/.test(navigator.userAgent)
    ?'To install on iPhone or iPad: open this page in Safari, tap Share, then Add to Home Screen.'
    :'To install: open your browser menu and choose Install app or Add to Home Screen.';
});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
