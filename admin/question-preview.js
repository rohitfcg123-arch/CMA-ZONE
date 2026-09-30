(() => {
 const raw=sessionStorage.getItem('cmaZoneQuestionPreviewData'), meta=raw?JSON.parse(raw):null;
 const list=document.getElementById('previewList'), info=document.getElementById('previewMeta'), count=document.getElementById('previewCount');
 if(!meta||!meta.data){info.textContent='No saved preview found. Return to the uploader and validate a JSON file.';list.innerHTML='<div class="question-library-empty">No preview data available.</div>';return}
 const qs=meta.data.qs||[]; info.textContent=meta.fileName+' · Preview only · Not published';count.textContent=qs.length+' question'+(qs.length===1?'':'s');
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const renderOptions=q=>{
   const opts=Array.isArray(q.options)?q.options:(Array.isArray(q.choices)?q.choices:(Array.isArray(q.answers)?q.answers:[]));
   if(!opts.length)return '';
   return '<div class="student-mcq-options">'+opts.map((o,i)=>'<div class="student-mcq-option"><b>'+String.fromCharCode(65+i)+'.</b><span>'+esc(typeof o==='object'?(o.text||o.label||''):o)+'</span></div>').join('')+'</div>';
 };
 list.innerHTML=qs.map((q,i)=>{
   const type=(Array.isArray(q.options)||Array.isArray(q.choices)||Array.isArray(q.answers))?'MCQ':'SUBJECTIVE';
   const body=q.questionHtml||q.question||q.text||'';
   return '<article class="student-preview-card"><div class="student-preview-head"><div><div class="student-qno">'+esc(q.questionNo||('Question '+(i+1)))+'</div><div class="student-meta"><span><b>Subject:</b> '+esc(q.subject||meta.data.topSubject||'—')+'</span><span><b>Chapter:</b> '+esc(q.chapter||'—')+'</span><span><b>Marks:</b> '+esc(q.marks||'—')+'</span></div></div><span class="student-type-badge">'+type+'</span></div><div class="student-divider"></div><div class="student-question-content">'+body+'</div>'+renderOptions(q)+'</article>';
 }).join('');
})();