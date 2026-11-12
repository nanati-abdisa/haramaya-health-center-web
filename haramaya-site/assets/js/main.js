const b=document.querySelector('.burger'),n=document.getElementById('nav');
if(b)b.onclick=()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)};
document.querySelectorAll('#yr').forEach(e=>e.textContent=new Date().getFullYear());
document.querySelectorAll('[data-copy]').forEach(btn=>btn.onclick=async()=>{const t=btn.dataset.copy,o=btn.textContent;try{await navigator.clipboard.writeText(t);btn.textContent='Address copied'}catch(e){btn.textContent='Copy not supported'}setTimeout(()=>btn.textContent=o,2000)});
// lightbox
const lb=document.createElement('div');lb.className='lb';lb.innerHTML='<button aria-label="Close">×</button><img alt="">';document.body.appendChild(lb);
lb.onclick=()=>lb.classList.remove('on');
document.addEventListener('click',e=>{const i=e.target.closest('[data-zoom]');if(i){lb.querySelector('img').src=i.src;lb.querySelector('img').alt=i.alt;lb.classList.add('on')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on')});
// filters + search (news, library)
const items=[...document.querySelectorAll('[data-cat]')];
if(items.length){let cat='All',q='',yr='',mo='';
const emp=document.getElementById('noresult');
const run=()=>{let n=0;items.forEach(el=>{const ok=(cat==='All'||el.dataset.cat===cat)&&(!q||el.textContent.toLowerCase().includes(q))&&(!yr||(el.dataset.date||'').startsWith(yr))&&(!mo||(el.dataset.date||'').slice(5,7)===mo);el.style.display=ok?'':'none';if(ok)n++});if(emp)emp.style.display=n?'none':'block'};
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cat=b.dataset.f;run()});
const s=document.getElementById('q');if(s)s.oninput=()=>{q=s.value.trim().toLowerCase();run()};
const y=document.getElementById('yr2'),m=document.getElementById('mo2');if(y)y.onchange=()=>{yr=y.value;run()};if(m)m.onchange=()=>{mo=m.value;run()}}
// form validation helper
function validate(f){let ok=true;f.querySelectorAll('[data-req],[type=email],[type=tel]').forEach(el=>{const er=el.parentElement.querySelector('.er');let m='';const v=el.value.trim();
if(el.hasAttribute('data-req')&&!v)m='This field is required.';else if(v&&el.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))m='Enter a valid email address.';else if(v&&el.type==='tel'&&!/^\+?[0-9\s-]{9,15}$/.test(v))m='Enter a valid phone number, for example +251 9XX XXX XXX.';
el.classList.toggle('bad',!!m);if(er)er.textContent=m;if(m)ok=false});return ok}
function show(f,t,c){const m=f.querySelector('.msg');m.className='msg '+c;m.textContent=t}
// contact form
const cf=document.getElementById('contactForm');
if(cf){let busy=false;cf.onsubmit=async e=>{e.preventDefault();if(busy||!validate(cf))return;busy=true;const bt=cf.querySelector('[type=submit]');bt.disabled=true;
try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(cf)))});if(!r.ok)throw 0;show(cf,'Thank you. Your message was sent.','ok');cf.reset()}catch(x){show(cf,'Your message could not be sent. Please try again later or call the Health Center.','no')}busy=false;bt.disabled=false};
cf.querySelector('[type=reset]').onclick=()=>setTimeout(()=>{cf.querySelectorAll('.er').forEach(e=>e.textContent='');cf.querySelectorAll('.bad').forEach(e=>e.classList.remove('bad'))})}
// portal forms
document.querySelectorAll('.portalForm').forEach(f=>f.onsubmit=e=>{e.preventDefault();if(!validate(f))return;if(f.id==='regForm'&&f.password.value!==f.password2.value){show(f,'Passwords do not match.','no');return}show(f,'The Patient Portal is not connected yet. Your details were not sent. Please contact the Health Center for now.','no')});
// appointment wizard
const aw=document.getElementById('apptForm');
if(aw){let s=0;const st=[...aw.querySelectorAll('.stp')],pg=[...document.querySelectorAll('.prog span')];
const go=n=>{s=n;st.forEach((x,i)=>x.classList.toggle('on',i===n));pg.forEach((x,i)=>{x.classList.toggle('on',i===n);x.classList.toggle('done',i<n)});if(n===4){const g=k=>aw.elements[k]?.value||'—';aw.querySelector('.sum').innerHTML=[['Patient',g('name')],['Patient ID',g('pid')],['Category',g('cat')],['Service',g('service')],['Preferred date',g('date')],['Preferred time',g('time')],['Contact number',g('phone')]].map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}window.scrollTo({top:aw.offsetTop-100,behavior:'smooth'})};
aw.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{const cur=st[s];let ok=true;cur.querySelectorAll('[data-req],[type=tel],[type=email]').forEach(el=>{const v=el.value.trim();const er=el.parentElement.querySelector('.er');let m='';if(el.hasAttribute('data-req')&&!v)m='This field is required.';else if(v&&el.type==='tel'&&!/^\+?[0-9\s-]{9,15}$/.test(v))m='Enter a valid phone number.';else if(v&&el.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))m='Enter a valid email address.';el.classList.toggle('bad',!!m);if(er)er.textContent=m;if(m)ok=false});if(ok)go(s+1)});
aw.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>go(s-1));
aw.onsubmit=e=>{e.preventDefault();const ref='HU-'+Date.now().toString(36).toUpperCase().slice(-6);const rec={ref,status:'Pending',phone:aw.phone.value.trim(),name:aw.name.value.trim(),service:aw.service.value,date:aw.date.value,time:aw.time.value,created:new Date().toISOString()};
try{const a=JSON.parse(localStorage.getItem('huAppts')||'[]');a.push(rec);localStorage.setItem('huAppts',JSON.stringify(a))}catch(x){}
aw.innerHTML='<div class="notice i"><b>Request recorded: '+ref+'</b><br>Status: Pending. Keep this reference number and use it with your phone number on the Check Status page.<br><small>Demo mode: the request is saved only in this browser until the Health Center connects the booking system. Call the Health Center to confirm your visit.</small></div><p><a class="btn p" href="check-status.html">Check status</a></p>'}}
// status check
const sf=document.getElementById('statusForm');
if(sf)sf.onsubmit=e=>{e.preventDefault();if(!validate(sf))return;let a=[];try{a=JSON.parse(localStorage.getItem('huAppts')||'[]')}catch(x){}
const r=a.find(x=>x.ref.toLowerCase()===sf.ref.value.trim().toLowerCase()&&x.phone.replace(/\s/g,'')===sf.phone.value.replace(/\s/g,''));
show(sf,r?`Reference ${r.ref}: ${r.status}. Service: ${r.service||'—'}. Preferred date: ${r.date||'—'}.`:'No request found for that reference number and phone number in this browser. Please call the Health Center.',r?'ok':'no')};
// details pages
const q2=new URLSearchParams(location.search).get('id');
if(typeof NEWS!=='undefined'&&document.getElementById('newsDetail')){const n=NEWS.find(x=>x.id==q2)||NEWS[0];document.title=n.title;
document.getElementById('newsDetail').innerHTML=`<p><span class="badge b">${n.cat}</span> <span class="badge">${n.dateText}</span></p><h1 style="color:var(--g);margin:12px 0;line-height:1.2">${n.title}</h1><p style="color:var(--mut)"><b>Publishing institution:</b> ${n.src}</p><div class="icbig" style="margin:20px 0"><svg class="ic"><use href="#i-news"/></svg></div><p style="font-size:17px">${n.desc}</p><div class="notice y">This is a university-level story attributed to ${n.src}. It is not an activity of the Main Campus Health Center. The full story and official photographs will be added from the original publication.</div>`;
document.getElementById('related').innerHTML=NEWS.filter(x=>x.id!=n.id).map(x=>`<a class="card" href="news-details.html?id=${x.id}"><div class="b"><span class="badge b" style="align-self:flex-start">${x.dateText}</span><h3 style="margin-top:8px">${x.title}</h3></div></a>`).join('')}
if(typeof ARTICLES!=='undefined'&&document.getElementById('artDetail')){const a=ARTICLES.find(x=>x.id==q2)||ARTICLES[0];document.title=a.title;
document.getElementById('artDetail').innerHTML=`<p><span class="badge">${a.cat}</span> <span class="badge w">Awaiting professional review</span></p><h1 style="color:var(--g);margin:12px 0;line-height:1.2">${a.title}</h1><div class="icbig" style="margin:20px 0"><svg class="ic"><use href="#${a.ic}"/></svg></div><p style="font-size:17px">${a.desc}</p><div class="notice y">The full article is being prepared. It will be published after a qualified healthcare professional reviews it. Introduction, causes and risk factors, signs and symptoms, prevention, and when to seek care will appear here.</div><p><a class="btn p" href="${a.link}">Related Health Center service</a></p>`;
document.getElementById('related').innerHTML=ARTICLES.filter(x=>x.cat===a.cat&&x.id!=a.id).slice(0,3).map(x=>`<a class="card" href="article.html?id=${x.id}"><div class="b"><span class="badge">${x.cat}</span><h3 style="margin-top:8px">${x.title}</h3></div></a>`).join('')||'<p style="color:var(--mut)">More articles in this category will appear here.</p>'}
