(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('demo-data').textContent);
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const labels = {NEW:'신규', UPDATED:'변경', UNCHANGED:'동일', CLOSED:'처리 완료', REMOVED:'수집 범위 제외', EFFECTIVE:'시행'};
  const viewLabels = {monitor:'이슈 모니터링', briefing:'데일리 브리핑', saved:'검토 보관함', system:'시스템 정보'};
  const storageKey = 'compliance-ax-demo-saved-v1';
  let saved;
  try { const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]'); saved = new Set(Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : []); }
  catch { saved = new Set(); }
  let scenario = 'initial';
  let activeView = 'monitor';
  let toastTimeout;
  const current = () => data.scenarios.find(s => s.id === scenario).items;
  const sorted = items => [...items].sort((a,b) => b.importance_score - a.importance_score);
  const relevant = () => sorted(current().filter(i => i.relevant && i.delta !== 'REMOVED'));
  function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout=setTimeout(() => $('#toast').classList.remove('visible'),3000); }
  function badge(item) { return `<span class="status-pill status-${esc(item.delta.toLowerCase())}">${esc(labels[item.delta] || item.delta)}</span>`; }
  function importance(item) { return `<span class="importance ${item.importance==='상'?'high':item.importance==='중'?'medium':'low'}" aria-label="중요도 ${esc(item.importance)}">${esc(item.importance)}</span>`; }
  function issueCard(item) {
    const id=esc(item.identity);
    return `<article class="issue-card" data-issue="${id}"><div class="issue-kind" aria-hidden="true">▤</div><div class="issue-main"><div class="issue-card-meta">${badge(item)}<span>${esc(item.source_org)}</span><span>·</span><span>${esc(item.published_date)}</span></div><button class="issue-title" data-open="${id}">${esc(item.title)}</button><p class="issue-summary">${esc(item.summary)}</p><div class="issue-footer">${item.impact_areas.split(', ').map(area=>`<span class="area-tag">${esc(area)}</span>`).join('')}<span class="relevance-tag">관련성 ${item.relevance_score}점</span></div></div><div class="issue-side">${importance(item)}<button class="bookmark" data-save="${id}" aria-pressed="${saved.has(item.identity)}" aria-label="${esc(item.title)} ${saved.has(item.identity)?'보관 해제':'보관'}">${saved.has(item.identity)?'★':'☆'}</button></div></article>`;
  }
  function empty(title, text, symbol='⌕') { return `<div class="empty-state"><span aria-hidden="true">${symbol}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`; }
  function renderMetrics() {
    const items=current().filter(i=>i.delta!=='REMOVED');
    const changes=current().filter(i=>!['UNCHANGED','REMOVED'].includes(i.delta));
    const high=items.filter(i=>i.importance==='상');
    const related=items.filter(i=>i.relevant);
    const metrics=[['수집 이슈',items.length,'샘플 문서 기준','▦',''],['우선 검토',high.length,'중요도 7점 이상','↗','accent'],['신규 · 변경',changes.length,scenario==='initial'?'첫 수집 결과':'상태 전환 포함','↻','green'],['관련 이슈',related.length,'업종 키워드 일치','⊙','']];
    $('#metrics').innerHTML=metrics.map(([label,count,hint,icon,tone])=>`<div class="metric ${tone}"><div class="metric-top">${label}<span class="metric-symbol" aria-hidden="true">${icon}</span></div><div class="metric-number">${count}<span>건</span></div><div class="metric-hint">${hint}</div></div>`).join('');
    $('#nav-count').textContent=items.length;
    $('#focus-title').textContent=scenario==='initial'?'가맹 · 표시광고 · 개인정보, 세 영역을 우선 확인하세요.':'가맹 안내 변경과 새 개인정보 이슈를 확인하세요.';
    $('#focus-description').textContent=scenario==='initial'?'관련 이슈의 중요도와 영향 영역을 묶어 검토 순서를 제안합니다.':'가상 시나리오에서 본문 변경, 처리 완료, 신규 이슈와 수집 범위 제외를 비교합니다.';
    const areaCounts=new Map();
    relevant().forEach(i=>i.impact_areas.split(', ').forEach(area=>areaCounts.set(area,(areaCounts.get(area)||0)+1)));
    const maximum=Math.max(1,...areaCounts.values());
    $('#area-chart').innerHTML=[...areaCounts].sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="area-row"><div class="area-label"><span>${esc(name)}</span><strong>${count}건</strong></div><div class="bar-track"><div class="bar-fill" style="width:${count/maximum*100}%"></div></div></div>`).join('');
  }
  function renderIssues() {
    const query=$('#search').value.trim().toLocaleLowerCase('ko');
    const level=$('#importance-filter').value;
    const status=$('#status-filter').value;
    const only=$('#relevant-only').checked;
    const rows=sorted(current()).filter(i=>(level==='all'||i.importance===level)&&(status==='all'||i.delta===status)&&(!only||i.relevant)&&(!query||[i.title,i.body,i.impact_areas].join(' ').toLocaleLowerCase('ko').includes(query)));
    $('#result-count').textContent=rows.length+'건';
    $('#issue-list').innerHTML=rows.length?rows.map(issueCard).join(''):empty('조건에 맞는 이슈가 없습니다.','검색어나 필터를 변경해 보세요.');
  }
  function buildBriefingMarkdown() {
    const rows=relevant();
    return [`# ${data.date} 준법 데일리 브리핑`, '> 가상 데이터 공개 데모 · 실제 규제 정보 또는 법률 자문이 아닙니다.', `시나리오: ${scenario==='initial'?'첫 수집':'변경 발생'} / 관련 이슈 ${rows.length}건`,...rows.map(i=>`## [${i.importance}] ${i.title} (${labels[i.delta]})\n\n${i.summary}\n\n- 영향 영역: ${i.impact_areas}\n- 검토 포인트: ${i.review_points}\n- 점수: 중요도 ${i.importance_score} / 관련성 ${i.relevance_score}\n- 근거: ${i.rule_reasons}\n- 출처: ${i.source_org} (가상)`)].join('\n\n');
  }
  function renderBriefing() {
    const rows=relevant();
    $('#briefing-content').innerHTML=`<section class="briefing-summary"><p class="eyebrow">${esc(data.date)} / SAMPLE BRIEFING</p><h2>${rows.length}개의 관련 이슈, 우선 검토부터 시작하세요.</h2><p>${esc(rows.slice(0,3).map(i=>i.title.replace('[가상] ','')).join(' · '))}</p><p>중요도는 규칙 기반 점수입니다. 요약은 본문 발췌이며 원문과 적용대상 확인이 필요합니다.</p></section>`+rows.map((i,index)=>`<article class="briefing-item"><div class="issue-card-meta"><span>${String(index+1).padStart(2,'0')}</span>${badge(i)}${importance(i)}</div><h2>${esc(i.title)}</h2><p>${esc(i.summary)}</p><dl><dt>영향 영역</dt><dd>${esc(i.impact_areas)}</dd><dt>검토 포인트</dt><dd>${esc(i.review_points)}</dd><dt>분석 근거</dt><dd>${esc(i.rule_reasons)} · ${i.importance_score}점</dd></dl></article>`).join('');
  }
  function allSavedItems() {
    const unique=new Map([...data.scenarios.flatMap(s=>s.items),...current()].map(i=>[i.identity,i]));
    return sorted([...unique.values()].filter(i=>saved.has(i.identity)));
  }
  function renderSaved() {
    const rows=allSavedItems();
    $('#saved-count').textContent=rows.length;
    $('#saved-list').innerHTML=rows.length?rows.map(issueCard).join(''):empty('아직 보관한 이슈가 없습니다.','이슈 카드의 별표를 누르면 이 브라우저에서 다시 확인할 수 있습니다.','☆');
    $('#clear-saved').disabled=!rows.length;
  }
  function persistSaved() {
    try { localStorage.setItem(storageKey,JSON.stringify([...saved])); }
    catch { toast('브라우저 저장이 제한되어 이번 화면에서만 보관합니다.'); }
  }
  function showDetail(id, opener) {
    const item=current().find(i=>i.identity===id)||allSavedItems().find(i=>i.identity===id);
    if(!item) return;
    $('#dialog-content').innerHTML=`<div class="issue-card-meta">${badge(item)}<span>${esc(item.source_org)} · 가상 샘플</span></div><h2 id="dialog-title" class="detail-title">${esc(item.title)}</h2><div class="detail-score"><div class="score-tile">중요도<strong>${item.importance_score}<small>점 · ${esc(item.importance)}</small></strong></div><div class="score-tile">관련성<strong>${item.relevance_score}<small>점</small></strong></div></div><section class="detail-section"><h3>핵심 요약 · 본문 발췌</h3><p>${esc(item.summary)}</p></section><section class="detail-section"><h3>영향 영역</h3><p>${esc(item.impact_areas)}</p></section><section class="detail-section"><h3>준법지원팀 검토 포인트</h3><p>${esc(item.review_points)}</p></section><section class="detail-section"><h3>점수 산정 근거</h3><p>${esc(item.rule_reasons||'일치 규칙 없음')}</p></section>${item.status_transition?`<section class="detail-section"><h3>처리 상태 변화</h3><p>${esc(item.status_transition)}</p></section>`:''}<section class="detail-section"><h3>본문 변경 비교</h3>${item.diff?`<pre>${esc(item.diff)}</pre>`:'<p>이전 본문과의 차이가 없거나 첫 수집 문서입니다.</p>'}</section><p class="detail-disclaimer">이 자료는 체험을 위한 가상 문서입니다. 실제 법률 판단에 사용하지 마세요. 분석 엔진: Rule Engine · 기준일 ${esc(data.date)}</p>`;
    const dialog=$('#issue-dialog');
    dialog.showModal();
    dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus(),{once:true});
  }
  function renderAll() { renderMetrics(); renderIssues(); renderBriefing(); renderSaved(); }
  function switchScenario(value) {
    if(!data.scenarios.some(s=>s.id===value)) return;
    scenario=value;
    $$('.scenario-switch button').forEach(b=>{b.classList.toggle('selected',b.dataset.scenario===value);b.setAttribute('aria-pressed',String(b.dataset.scenario===value));});
    renderAll();
    toast(value==='changes'?'본문 변경·처리 완료·신규 이슈를 불러왔습니다.':'첫 수집 샘플로 돌아왔습니다.');
  }
  function setView(view, updateHash=true) {
    activeView=Object.hasOwn(viewLabels,view)?view:'monitor';
    $$('.view').forEach(v=>{v.hidden=v.id!==`view-${activeView}`;});
    $$('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.view===activeView);b.setAttribute('aria-current',b.dataset.view===activeView?'page':'false');});
    $('#page-label').textContent=viewLabels[activeView];
    document.title=`${viewLabels[activeView]} · Compliance AX`;
    if(updateHash&&location.hash!==`#${activeView}`) location.hash=activeView;
  }
  document.addEventListener('click',event=>{
    const open=event.target.closest('[data-open]');
    if(open) return showDetail(open.dataset.open,open);
    const save=event.target.closest('[data-save]');
    if(save){ const id=save.dataset.save; if(saved.has(id)){saved.delete(id);toast('보관을 해제했습니다.');}else{saved.add(id);toast('검토 보관함에 저장했습니다.');} persistSaved();renderIssues();renderSaved(); const replacement=$(`#view-${activeView} [data-save="${id}"]`);replacement?.focus();return; }
    const nav=event.target.closest('[data-view]');
    if(nav){setView(nav.dataset.view);return;}
    const toggle=event.target.closest('[data-scenario]');
    if(toggle) switchScenario(toggle.dataset.scenario);
  });
  ['search','importance-filter','status-filter','relevant-only'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',renderIssues));
  $('#sample-date').textContent=data.date.replaceAll('-','.');
  $('#run-demo').addEventListener('click',()=>{switchScenario(scenario==='initial'?'changes':'initial');});
  $('#open-briefing').addEventListener('click',()=>setView('briefing'));
  $('#clear-saved').addEventListener('click',()=>{saved.clear();persistSaved();renderSaved();renderIssues();toast('검토 보관함을 비웠습니다.');});
  $('#download-briefing').addEventListener('click',()=>{
    const blob=new Blob([buildBriefingMarkdown()],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`compliance_brief_${data.date}_${scenario}.md`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('브리핑 파일을 저장했습니다.');
  });
  $('#close-dialog').addEventListener('click',()=>$('#issue-dialog').close());
  $('#issue-dialog').addEventListener('click',event=>{if(event.target===$('#issue-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) event.target.close();}});
  window.addEventListener('hashchange',()=>setView(location.hash.slice(1),false));
  renderAll();setView(location.hash.slice(1)||'monitor',false);
})();
