const $ = s => document.querySelector(s);
const categories = ['프로젝트','학습·실험','자료·인사이트','주간 회고'];
const icons = ['⌘','⚗','↗','↺'];
const templates = {
 '프로젝트':'해결하려는 문제\n\n내 역할과 목표\n\n사용 데이터와 도구\n\n진행 과정과 의사결정\n\n결과와 피드백\n\n배운 점과 다음 단계\n',
 '학습·실험':'질문과 가설\n\n데이터와 실험 환경\n\n시도한 방법 / 모델 / 프롬프트\n\n평가 기준\n\n결과와 해석\n\n한계와 다음 실험\n',
 '자료·인사이트':'핵심 내용\n\n나의 생각\n\n업무에 적용할 아이디어\n',
 '주간 회고':'이번 주에 한 일\n\n새롭게 배운 것\n\n받은 피드백\n\n막혔던 점과 해결 과정\n\n다음 주에 시도할 것\n'
};
const sampleDate = new Date().toISOString();
const samples = [
 {title:'RAG 파이프라인, 어디서부터 시작할까?',category:'프로젝트',content:'[예시 기록]\n\n해결하려는 문제\n흩어진 문서에서 필요한 답변을 빠르게 찾는 방법을 탐색한다.\n\n첫 번째 실험\n작은 문서 집합으로 검색 → 문맥 구성 → 답변 생성 흐름을 만들어 본다.\n\n다음 단계\n검색 결과의 관련성과 답변의 근거를 따로 평가해 보기.',tags:['LLM','RAG'],status:'진행 중',pinned:true},
 {title:'좋은 분석은 좋은 질문에서 시작한다',category:'자료·인사이트',content:'[예시 기록]\n\n같은 데이터를 보더라도 어떤 질문을 던지느냐에 따라 분석의 방향이 달라진다.\n\n나의 생각\n쿼리를 작성하기 전에 “이 결과로 어떤 결정을 내릴 것인가?”를 한 줄로 적어보자.',tags:['데이터 분석','문제 정의'],status:'기록',pinned:true},
 {title:'SQL 윈도우 함수 직접 써보기',category:'학습·실험',content:'[예시 기록]\n\n질문\n그룹별 상위 항목을 찾으려면?\n\n방법\nROW_NUMBER() OVER (PARTITION BY category ORDER BY value DESC)\n\n배운 점\nGROUP BY와 달리 각 행을 유지하면서 그룹 안의 순서를 계산할 수 있다. 동점 처리 방식에 따라 RANK와 DENSE_RANK도 비교해 보자.',tags:['SQL','데이터 분석'],status:'완료',pinned:false},
 {title:'첫 주의 질문들, 그리고 작은 발견',category:'주간 회고',content:'[예시 기록]\n\n이번 주에 한 일\n업무 흐름을 파악하고 자주 쓰는 용어를 정리했다.\n\n배운 점\n모르는 것을 바로 질문할 수 있도록, 먼저 이해한 내용을 한 줄로 정리하면 좋다.\n\n다음 주에 시도할 것\n작은 업무 하나를 처음부터 끝까지 기록해 보기.',tags:['회고','온보딩'],status:'기록',pinned:false},
 {title:'프롬프트 비교 실험을 남기는 방법',category:'학습·실험',content:'[예시 기록]\n\n가설\n출력 형식과 예시를 명시하면 결과의 일관성이 좋아질까?\n\n기록할 항목\n모델 버전, 실행 날짜, 입력, 프롬프트, 평가 기준, 결과.\n\n한계\n한 번의 결과로 결론 내리기보다 동일한 조건에서 여러 입력으로 비교하자.',tags:['LLM','프롬프트'],status:'진행 중',pinned:false},
 {title:'다음에 다시 읽고 싶은 AI 자료',category:'자료·인사이트',content:'[예시 기록]\n\n자료를 저장할 때 링크와 함께 세 가지를 적어두자.\n\n1. 어떤 내용을 다루는가?\n2. 지금 내게 왜 필요한가?\n3. 업무에서 어떻게 적용할 수 있을까?\n\n저장한 자료를 일주일에 한 번 돌아보면 내 생각과 연결하기 쉽다.',tags:['리서치','AI'],status:'기록',pinned:false}
].map((e,i)=>({...e,id:'sample-'+i,link:'',createdAt:sampleDate,updatedAt:sampleDate,sample:true}));
let entries=[], mode='loading', page='대시보드', filter='전체', tag='', query='', sort='updated', listView=false, adminPassword='', editingId=null, saving=false, draftTimer, toastTimer;
let authNext=null;
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = d => new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
function localRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function localWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{toast('브라우저 저장 공간이 부족하거나 차단되어 있어요. 백업을 권장해요.');return false;}}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
async function api(method='GET',body){
 const response=await fetch('/api/archive',{method,headers:{'Content-Type':'application/json',...(adminPassword?{Authorization:`Bearer ${adminPassword}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
 let data;try{data=await response.json();}catch{throw Error('서버 응답을 확인할 수 없어요. 다시 시도해 주세요.');}
 if(!response.ok){if(response.status===401)adminPassword='';throw Error(data.error||'연결에 실패했습니다.');}return data;
}
function notice(message,button,action){const el=$('#notice');el.hidden=false;el.replaceChildren();const text=document.createElement('span');text.textContent=message;el.append(text);if(button){const b=document.createElement('button');b.textContent=button;b.onclick=action;el.append(b);}}
async function init(){
 try{
  const response=await fetch('/api/archive?status=1',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const status=await response.json();
  if(status.ready){mode='online';entries=(await api()).entries;notice('온라인 저장 · 모든 기록은 공개됩니다. 작성과 수정은 관리자 모드에서 할 수 있어요.');}
  else {mode='demo';entries=localRead('fieldnotes:demo',samples);if(!Array.isArray(entries))entries=structuredClone(samples);notice('체험 모드 · 예시가 포함되어 있어요. 변경 내용은 이 브라우저에만 저장됩니다.','온라인 저장 연결',()=>$('#setup').showModal());}
 }catch{mode='error';entries=[];notice('기록을 불러오지 못했어요. 네트워크 또는 저장소 연결을 확인해 주세요.','다시 시도',init);}
 render();
}
function navigation(){
 const nav=[['대시보드','▦'],['전체 기록','▤'],...categories.map((c,i)=>[c,icons[i]]),['즐겨찾기','☆']];
 $('#navigation').innerHTML=nav.map(([name,icon],i)=>`${i===2?'<div class="nav-break"></div>':''}<button class="nav-item ${page===name?'active':''}" data-page="${name}" ${page===name?'aria-current="page"':''}><span class="nav-icon">${icon}</span>${name}${categories.includes(name)?`<span class="nav-count">${entries.filter(e=>e.category===name).length}</span>`:''}</button>`).join('');
 $('#navigation').querySelectorAll('button').forEach(b=>b.onclick=()=>{page=b.dataset.page;filter='전체';tag='';render();});
}
function render(){
 navigation();$('#crumb').textContent=page;$('#page-title').innerHTML=(page==='대시보드'?'배움을 쌓는 공간':esc(page))+'<span class="accent">.</span>';
 $('#page-description').textContent=({'대시보드':'오늘의 발견을 기록하고, 내일의 인사이트로 연결해요.','전체 기록':'쌓아온 생각과 배움을 한곳에서 살펴보세요.','프로젝트':'문제에서 시작해, 나만의 해결 과정을 남겨요.','학습·실험':'작은 가설과 시도도 다음 실험의 출발점이 됩니다.','자료·인사이트':'좋은 자료에 나의 관점을 더해보세요.','주간 회고':'한 주의 배움을 돌아보고 다음 걸음을 준비해요.','즐겨찾기':'다시 꺼내 보고 싶은 생각들을 모았어요.'})[page];
 $('#connection').textContent=({loading:'연결 확인 중',demo:'◌ 체험 모드',online:'● 온라인 저장',error:'○ 연결 오류'})[mode];
 $('#admin-top').textContent=adminPassword?'작성 모드 종료':'작성 모드';
 $('#admin').textContent=adminPassword?'⚙  작성 모드 종료':'⚙  관리자 모드';
 const weekAgo=Date.now()-7*86400000;
 const stats=[['전체 기록',entries.length,'차곡차곡 쌓아온 배움','▤'],['진행 중인 프로젝트',entries.filter(e=>e.category==='프로젝트'&&e.status==='진행 중').length,'하나씩 완성해 나가는 중','⌘'],['학습·실험 노트',entries.filter(e=>e.category==='학습·실험').length,'시도할수록 넓어지는 시야','⚗'],['최근 7일 기록',entries.filter(e=>new Date(e.createdAt).getTime()>=weekAgo).length,'작은 기록이 만드는 변화','↗']];
 $('#stats').innerHTML=stats.map(([name,value,note,icon])=>`<div class="stat"><div class="stat-name">${name}<span>${icon}</span></div><div class="stat-value">${value}<span class="sample-badge">${mode==='demo'?'체험':''}</span></div><div class="stat-note">${note}</div></div>`).join('');
 $('#filters').innerHTML=['전체',...categories].map(c=>`<button class="filter ${filter===c?'active':''}" data-filter="${c}" aria-pressed="${filter===c}">${c}</button>`).join('');
 $('#filters').hidden=categories.includes(page);
 $('#filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;renderList();$('#filters').querySelectorAll('button').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',el===b);});});
 const tags=[...new Set(entries.flatMap(e=>e.tags))].slice(0,18);
 $('#tags').innerHTML=tags.length?tags.map(t=>`<button data-tag="${esc(t)}"># ${esc(t)}</button>`).join(''):'<span class="muted">기록에 태그를 붙여보세요.</span>';
 $('#tags').querySelectorAll('button').forEach(b=>b.onclick=()=>{tag=b.dataset.tag;page='전체 기록';filter='전체';render();});
 $('#footer-count').textContent=mode==='demo'?'DEMO / 이 브라우저에만 저장':`총 ${entries.length}개의 기록 · 하나씩, 차곡차곡.`;
 renderList();
}
function renderList(){
 let found=entries.filter(e=>(!categories.includes(page)||e.category===page)&&(page!=='즐겨찾기'||e.pinned)&&(filter==='전체'||e.category===filter)&&(!tag||e.tags.includes(tag))&&[e.title,e.content,...e.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
 found.sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'ko'):String(b[sort==='created'?'createdAt':'updatedAt']).localeCompare(String(a[sort==='created'?'createdAt':'updatedAt'])));
 $('#record-count').textContent=found.length;$('#list-heading').firstChild.textContent=page==='즐겨찾기'?'즐겨찾는 기록 ':'나의 기록 ';
 $('#active-tag').hidden=!tag;$('#active-tag').innerHTML=tag?`# ${esc(tag)} <button aria-label="태그 필터 해제">×</button>`:'';if(tag)$('#active-tag button').onclick=()=>{tag='';renderList();};
 $('#entries').classList.toggle('list',listView);
 if(mode==='loading'){$('#entries').innerHTML='<div class="loading">기록을 불러오는 중…</div>';return;}
 if(!found.length){$('#entries').innerHTML=`<div class="empty"><span>✳</span><h3>${mode==='error'?'잠시 연결이 끊어졌어요':query||tag?'일치하는 기록이 없어요':'아직 기록이 없어요'}</h3><p>${mode==='error'?'위의 다시 시도 버튼으로 기록을 불러와 주세요.':query||tag?'다른 검색어나 분류로 찾아보세요.':'첫 번째 배움을 여기에 남겨보세요.'}</p></div>`;return;}
 $('#entries').innerHTML=found.map(e=>`<button class="entry-card" data-id="${esc(e.id)}"><div class="card-top"><span class="category c${categories.indexOf(e.category)}">${esc(e.category)}</span><span class="pin" aria-label="${e.pinned?'즐겨찾기':'기록'}">${e.pinned?'☆':'↗'}</span></div><h3>${esc(e.title)}</h3><p class="card-excerpt">${esc(e.content.replace('[예시 기록]','').trim())}</p><div class="card-tags">${e.tags.slice(0,4).map(t=>`<span>#${esc(t)}</span>`).join('')}</div><div class="card-footer"><span>${e.sample?'예시 · ':''}${date(e.updatedAt)}</span><span class="${e.status==='진행 중'?'status-progress':e.status==='완료'?'status-done':''}">${e.status==='진행 중'?'◔ ':e.status==='완료'?'✓ ':''}${esc(e.status)}</span></div></button>`).join('');
 $('#entries').querySelectorAll('.entry-card').forEach(b=>b.onclick=()=>openReader(b.dataset.id));
}
function download(filename,content,type='text/plain'){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function safeLink(link){try{const u=new URL(link);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function openReader(id){const e=entries.find(e=>e.id===id);if(!e)return;const link=safeLink(e.link);
 $('#reader-content').innerHTML=`<div class="dialog-heading"><span class="category c${categories.indexOf(e.category)}">${esc(e.category)}</span><button class="icon-button" id="close-reader" aria-label="닫기">×</button></div><h2 class="reader-title">${esc(e.title)}</h2><div class="reader-meta">${e.sample?'예시 기록 · ':''}${date(e.updatedAt)} 수정 · ${esc(e.status)} ${e.pinned?'· ☆ 즐겨찾기':''}</div><div class="card-tags">${e.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>${link?`<a class="reader-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">↗ 참고 자료 열기</a>`:''}<div class="reader-body">${esc(e.content)}</div><div class="reader-toolbar"><button class="secondary" id="edit-entry">수정</button><button class="secondary" id="download-md">글 내려받기</button><button class="secondary danger" id="delete-entry">삭제</button></div>`;
 $('#close-reader').onclick=()=>$('#reader').close();$('#edit-entry').onclick=()=>{$('#reader').close();requireAdmin(()=>openEditor(e));};
 $('#download-md').onclick=()=>download(e.title.replace(/[^\p{L}\p{N}\s_-]/gu,'').slice(0,80)+'.md',`# ${e.title}\n\n${e.category} | ${e.tags.join(', ')}\n\n${e.content}\n\n${link}`,'text/markdown');
 $('#delete-entry').onclick=()=>{$('#reader').close();requireAdmin(()=>removeEntry(e));};$('#reader').showModal();
}
function requireAdmin(next){if(mode==='error'||mode==='loading'){toast('먼저 온라인 연결을 확인해 주세요.');return;}if(mode==='demo'||adminPassword){next();return;}authNext=next;$('#auth-error').textContent='';$('#password').value='';$('#auth').showModal();}
function openEditor(entry,category){
 const form=$('#entry-form');form.reset();editingId=entry?.id||null;$('#editor-title').textContent=entry?'기록 수정':'새로운 기록';
 form.elements.category.value=entry?.category||category||(categories.includes(page)?page:'학습·실험');
 for(const name of ['title','content','link','status'])if(entry)form.elements[name].value=entry[name];
 if(!entry&&category)form.elements.content.value=templates[category]||'';
 form.elements.tags.value=entry?.tags.join(', ')||'';form.elements.pinned.checked=entry?.pinned||false;
 $('#editor-error').textContent='';$('#draft-status').textContent=mode==='demo'?'체험 기록 · 이 브라우저에만 저장됩니다.':'저장 버튼을 누르면 공개 아카이브에 반영됩니다.';
 const draft=localRead('fieldnotes:draft',null);
 if(draft&&draft.id===editingId){const b=document.createElement('button');b.type='button';b.className='draft-restore';b.textContent='이 기기에 저장된 미완성 글 불러오기';b.onclick=()=>{for(const n of ['title','content','link','status','category','tags'])form.elements[n].value=draft[n];form.elements.pinned.checked=draft.pinned;$('#draft-status').textContent='임시 글을 불러왔어요. 저장 버튼으로 기록을 확정하세요.';};$('#draft-status').replaceChildren(b);}
 $('#editor').showModal();
}
function formData(){const f=$('#entry-form');return {id:editingId,title:f.elements.title.value.trim(),content:f.elements.content.value,category:f.elements.category.value,tags:[...new Set(f.elements.tags.value.split(',').map(t=>t.trim()).filter(Boolean))],link:f.elements.link.value.trim(),status:f.elements.status.value,pinned:f.elements.pinned.checked};}
async function saveEntry(event){event.preventDefault();if(saving)return;const data=formData();if(!data.title){$('#editor-error').textContent='제목을 입력해 주세요.';return;}
 if(data.tags.length>8||data.tags.some(t=>t.length>30)){$('#editor-error').textContent='태그는 각 30자 이내, 최대 8개까지 입력할 수 있어요.';return;}
 if(data.link&&!safeLink(data.link)){$('#editor-error').textContent='참고 링크는 http 또는 https 주소로 입력해 주세요.';return;}
 saving=true;$('#save').disabled=true;$('#save').textContent='저장 중…';$('#editor-error').textContent='';
 try{let entry;
  if(mode==='demo'){const prior=entries.find(e=>e.id===data.id);const now=new Date().toISOString();entry={...data,id:data.id||crypto.randomUUID(),createdAt:prior?.createdAt||now,updatedAt:now};const next=[entry,...entries.filter(e=>e.id!==entry.id)];if(!localWrite('fieldnotes:demo',next))throw Error('저장하지 못했어요. 글을 복사해 보관해 주세요.');entries=next;}
  else{({entry}=await api('POST',data));entries=[entry,...entries.filter(e=>e.id!==entry.id)];}
  clearTimeout(draftTimer);try{localStorage.removeItem('fieldnotes:draft');}catch{}$('#editor').close();render();toast(mode==='demo'?'체험 기록을 이 브라우저에 저장했어요.':'공개 아카이브에 저장했어요.');
 }catch(error){$('#editor-error').textContent=error.message; if(!adminPassword&&mode==='online'){const retry=document.createElement('button');retry.type='button';retry.className='secondary';retry.textContent='비밀번호 다시 입력';retry.onclick=()=>requireAdmin(()=>{});$('#editor-error').append(document.createElement('br'),retry);}}
 finally{saving=false;$('#save').disabled=false;$('#save').textContent='기록 저장';}
}
async function removeEntry(entry){if(!confirm(`“${entry.title}” 기록을 삭제할까요? 삭제 후 복구할 수 없어요.`))return;try{const next=entries.filter(e=>e.id!==entry.id);if(mode==='demo'){if(!localWrite('fieldnotes:demo',next))return;}else await api('DELETE',{id:entry.id});entries=next;render();toast('기록을 삭제했어요.');}catch(error){toast(error.message);}}
$('#entry-form').onsubmit=saveEntry;
$('#entry-form').oninput=()=>{clearTimeout(draftTimer);draftTimer=setTimeout(()=>{const f=$('#entry-form');const d={...formData(),tags:f.elements.tags.value};if(localWrite('fieldnotes:draft',d))$('#draft-status').textContent='미완성 글을 이 기기에 임시 저장했어요. 기록 저장 버튼으로 확정하세요.';},700);};
$('#auth-form').onsubmit=async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;adminPassword=$('#password').value;try{await api('POST',{action:'verify'});$('#auth').close();$('#password').value='';render();authNext?.();authNext=null;toast('작성 모드를 열었어요.');}catch(error){adminPassword='';$('#auth-error').textContent=error.message;}finally{button.disabled=false;}};
$('#new-entry').onclick=()=>requireAdmin(()=>openEditor());$('#quick-write').onclick=()=>requireAdmin(()=>openEditor(null,'자료·인사이트'));
$('.brand').onclick=e=>{e.preventDefault();page='대시보드';filter='전체';tag='';query='';$('#search').value='';render();};
$('.topbar').addEventListener('click',event=>{if(event.target.closest('#about'))$('#info').showModal();});
$('#info-setup').onclick=()=>{$('#info').close();$('#setup').showModal();};
$('#info-export').onclick=()=>$('#export').click();
$('#admin-top').onclick=()=>$('#admin').click();
$('#admin').onclick=()=>{if(mode==='demo'){$('#setup').showModal();return;}if(adminPassword){adminPassword='';render();toast('작성 모드를 종료했어요.');}else requireAdmin(()=>{});};
$('.right-column').querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>requireAdmin(()=>openEditor(null,b.dataset.template)));
$('#search').oninput=e=>{query=e.target.value;renderList();};$('#sort').onchange=e=>{sort=e.target.value;renderList();};
$('#grid-view').onclick=()=>setView(false);$('#list-view').onclick=()=>setView(true);
function setView(value){listView=value;$('#grid-view').setAttribute('aria-pressed',!value);$('#list-view').setAttribute('aria-pressed',value);renderList();}
$('#export').onclick=()=>{if(mode==='loading'||mode==='error'){toast('기록을 불러온 뒤 백업해 주세요.');return;}download(`fieldnotes-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({format:'fieldnotes-v1',exportedAt:new Date().toISOString(),mode,entries},null,2),'application/json');toast('전체 기록을 JSON 파일로 내려받았어요.');};
function closeDialog(dialog){if(dialog.id==='editor'&&saving){toast('저장이 끝날 때까지 기다려 주세요.');return;}if(dialog.id==='auth')authNext=null;dialog.close();}
$$Close();function $$Close(){document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog($('#'+b.dataset.close)));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{if(d.id==='editor'&&saving)e.preventDefault();}));}
window.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
async function refresh(){if(mode==='online'&&!document.querySelector('dialog[open]')){try{entries=(await api()).entries;render();$('#connection').textContent='● 온라인 저장';}catch{$('#connection').textContent='○ 동기화 지연';}}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden)refresh();},60000);
render();init();
