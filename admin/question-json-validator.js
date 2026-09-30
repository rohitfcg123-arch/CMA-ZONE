(() => {
  const input=document.getElementById('questionJsonFile'),output=document.getElementById('jsonValidationResult'),
    validateBtn=document.getElementById('validateQuestionJson'),publishBtn=document.getElementById('publishQuestionJson'),
    preview=document.getElementById('jsonUploadPreview'),previewText=document.getElementById('jsonPreviewText'),
    previewMeta=document.getElementById('jsonPreviewMeta'),library=document.getElementById('questionLibrary'),
    list=document.getElementById('questionList'),modal=document.getElementById('questionEditModal');
  let validated=null,currentFilter='all',editingId=null,librarySearch='',librarySubject='',libraryAttempt='',libraryChapter='';

  function subjectMap(){const map={},master=window.CMA_ZONE_CHAPTER_MASTER||{};Object.values(master).forEach(g=>Object.keys(g).forEach(s=>map[s]=g[s]));return map}
  function getQuestions(d){if(Array.isArray(d))return d;return d.questions||d.questionBank||d.items||d.data||null}
  function getField(q,n){for(const x of n)if(q&&q[x]!=null&&String(q[x]).trim())return String(q[x]).trim();return''}
  function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function setLoading(btn,on,label){if(!btn)return;btn.disabled=on;btn.dataset.oldLabel=btn.dataset.oldLabel||btn.textContent;btn.textContent=on?'LOADING…':(label||btn.dataset.oldLabel)}
  function saveDraft(data,fileName){try{sessionStorage.setItem('cmaZoneQuestionUploadDraft',JSON.stringify({data,fileName, savedAt:new Date().toISOString()}))}catch(e){}}
  function clearDraft(){sessionStorage.removeItem('cmaZoneQuestionUploadDraft')}
  function showPreview(data,file){preview.style.display='block';previewMeta.textContent=file.name+' · '+(getQuestions(data)?.length||0)+' question records';let raw=JSON.stringify(data,null,2);previewText.textContent=raw.length>7000?raw.slice(0,7000)+'\n… [preview truncated]':raw}
  function restoreDraft(){
    try{
      const raw=sessionStorage.getItem('cmaZoneQuestionUploadDraft'); if(!raw)return;
      const d=JSON.parse(raw); if(!d||!d.data)return;
      validated=validateData(d.data); if(validated.errors.length){showErrors(validated.errors);return}
      const fake={name:d.fileName||'Saved JSON draft'}; showPreview(d.data,fake);
      input.dataset.restored='1';
      const rows=validated.qs.map((q,i)=>CMAZoneQuestionStore.normalize(q,i,{subject:validated.topSubject,attempt:validated.topAttempt}));
      const mcq=rows.filter(q=>q.questionType==='mcq').length,sub=rows.length-mcq,pyq=rows.filter(q=>q.surfaces.includes('mcq-pyq')||q.surfaces.includes('subjective-pyq')).length;
      output.className='json-validation-result success';
      output.innerHTML='<strong>SAVED DRAFT RESTORED.</strong> '+rows.length+' questions · '+mcq+' MCQ · '+sub+' Subjective · '+pyq+' PYQ. You can preview or publish without uploading the JSON again.';
      publishBtn.disabled=false;
      const pb=document.getElementById('previewQuestionJson'); if(pb)pb.disabled=false;
    }catch(e){}
  }

  function validateData(data){
    const qs=getQuestions(data);if(!Array.isArray(qs)||!qs.length)return{errors:['No questions array found. Expected questions/questionBank/items/data.']};
    const map=subjectMap(),errors=[],topSubject=getField(data,['subject','subjectName']),topAttempt=getField(data,['attempt','paperAttempt']);
    qs.forEach((q,i)=>{const no=i+1,subject=getField(q,['subject','subjectName'])||topSubject,chapter=getField(q,['chapter','chapterName'])||getField(q.category||{},['chapter','chapterName'])||getField(q.metadata||{},['chapter','chapterName']);if(!subject)errors.push('Question '+no+': subject is missing.');else if(!map[subject])errors.push('Question '+no+': wrong subject "'+subject+'". It is not in the CMA Zone master.');if(!chapter)errors.push('Question '+no+': chapter is missing.');else if(subject&&map[subject]&&!map[subject].includes(chapter))errors.push('Question '+no+': chapter "'+chapter+'" does not exactly match the master chapter for "'+subject+'".')});
    return{errors,qs,topSubject,topAttempt}
  }
  function showErrors(es){output.className='json-validation-result error';output.innerHTML='<strong>UPLOAD BLOCKED — exact master validation failed.</strong><ul>'+es.slice(0,50).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(es.length>50?'<p>Showing first 50 errors. Fix every invalid record.</p>':'');publishBtn.disabled=true}

  function validate(){
    validated=null;publishBtn.disabled=true;const pb=document.getElementById('previewQuestionJson');if(pb)pb.disabled=true;output.className='json-validation-result';output.textContent='';
    if(!input.files.length){output.classList.add('error');output.textContent='Select a JSON file first.';return}
    setLoading(validateBtn,true);
    const reader=new FileReader();
    reader.onload=()=>{let data;try{data=JSON.parse(reader.result)}catch(e){setLoading(validateBtn,false,'VALIDATE JSON');output.className='json-validation-result error';output.textContent='JSON Error: Invalid JSON syntax.';return}
      showPreview(data,input.files[0]);
      const r=validateData(data);if(r.errors.length){setLoading(validateBtn,false,'VALIDATE JSON');showErrors(r.errors);return}
      validated=r;
      saveDraft(data,input.files[0].name);
      const pb=document.getElementById('previewQuestionJson');if(pb)pb.disabled=false;
      const rows=r.qs.map((q,i)=>CMAZoneQuestionStore.normalize(q,i,{subject:r.topSubject,attempt:r.topAttempt})),mcq=rows.filter(q=>q.questionType==='mcq').length,sub=rows.length-mcq,pyq=rows.filter(q=>q.surfaces.includes('mcq-pyq')||q.surfaces.includes('subjective-pyq')).length;
      setLoading(validateBtn,false,'VALIDATE JSON');
      output.className='json-validation-result success';output.innerHTML='<strong>VALIDATION PASSED.</strong> '+rows.length+' questions · '+mcq+' MCQ · '+sub+' Subjective · '+pyq+' PYQ. Exact subject/chapter names confirmed. <b>Publish</b> routes each record automatically.';publishBtn.disabled=false;
    };
    reader.readAsText(input.files[0])
  }

  function publish(){
    if(!validated)return;
    setLoading(publishBtn,true);
    setTimeout(()=>{
      const old=CMAZoneQuestionStore.read(),rows=validated.qs.map((q,i)=>CMAZoneQuestionStore.normalize(q,i,{subject:validated.topSubject,attempt:validated.topAttempt}));
      CMAZoneQuestionStore.write(old.concat(rows));
      clearDraft();
      output.className='json-validation-result success';output.innerHTML='<strong>PUBLISHED.</strong> '+rows.length+' questions added. MCQ/PYQ/Subjective/Full-Length routing is stored per question. Total stored: '+CMAZoneQuestionStore.count()+'.';
      setLoading(publishBtn,false,'PUBLISH QUESTIONS');publishBtn.disabled=true;renderLibrary();
    },250)
  }

  function renderLibrary(){
    if(!library||!list)return;
    const all=CMAZoneQuestionStore.read();\n    const rows=all.filter(q=>(currentFilter==='all'||q.questionType===currentFilter)&&(!librarySearch||String(q.questionNo||'').toLowerCase().includes(librarySearch)||String(q.question||q.questionHtml||q.text||'').replace(/<[^>]*>/g,' ').toLowerCase().includes(librarySearch))&&(!librarySubject||q.subject===librarySubject)&&(!libraryAttempt||String(q.attempt||q.source||'')===libraryAttempt)&&(!libraryChapter||q.chapter===libraryChapter));
    library.style.display='block';
    list.innerHTML=rows.length?rows.map((q,i)=>{
      const previewText=String(q.question||q.questionHtml||q.text||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,220);
      return '<div class="question-library-row"><div class="question-library-main"><div class="question-library-top"><strong>'+esc(q.questionNo||('Question '+(i+1)))+'</strong><span>'+esc(q.questionType==='mcq'?'MCQ':'Subjective')+'</span><span>'+esc(q.subject||'')+'</span><span>'+esc(q.chapter||'')+'</span><span>'+esc(q.marks||'—')+' Marks</span></div><div class="question-library-attempt">'+esc(q.attempt||q.source||'No Attempt')+'</div><p>'+esc(previewText||'Question content stored as HTML.')+'</p></div><button class="btn btn-gold edit-question-btn" data-id="'+esc(q.id)+'" type="button">EDIT</button></div>'
    }).join(''):'<div class="question-library-empty">No questions found for this filter.</div>';
    list.querySelectorAll('.edit-question-btn').forEach(b=>b.addEventListener('click',()=>openEditor(b.dataset.id)));
  }

  function populateSubjectSelect(selected){
    const master=window.CMA_ZONE_CHAPTER_MASTER||{},sel=document.getElementById('editSubject');if(!sel)return;
    const names=[];Object.values(master).forEach(g=>Object.keys(g).forEach(s=>{if(!names.includes(s))names.push(s)}));
    sel.innerHTML='<option value="">Select Subject</option>'+names.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('');
    sel.value=selected||'';
  }
  function populateChapterSelect(subject,selected){
    const master=window.CMA_ZONE_CHAPTER_MASTER||{},sel=document.getElementById('editChapter');if(!sel)return;
    let chapters=[];Object.values(master).forEach(g=>{if(Array.isArray(g[subject]))chapters=g[subject]});
    sel.innerHTML='<option value="">Select Chapter</option>'+chapters.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('');
    sel.value=chapters.includes(selected)?selected:'';
  }

  function openEditor(id){
    const q=CMAZoneQuestionStore.read().find(x=>x.id===id);if(!q)return;editingId=id;
    document.getElementById('editQuestionTitle').textContent='Edit '+(q.questionNo||'Question');
    document.getElementById('editQuestionNo').value=q.questionNo||'';
    document.getElementById('editMarks').value=q.marks??'';
    populateSubjectSelect(q.subject||'');populateChapterSelect(q.subject||'',q.chapter||'');
    document.getElementById('editQuestionContent').value=q.questionHtml||q.question||q.text||'';
    modal.style.display='flex';modal.setAttribute('aria-hidden','false');
  }
  function closeEditor(){modal.style.display='none';modal.setAttribute('aria-hidden','true');editingId=null}
  function saveEdit(){
    if(!editingId)return;
    const subject=document.getElementById('editSubject').value,chapter=document.getElementById('editChapter').value;
    const map=subjectMap();if(!subject||!map[subject]||!chapter||!map[subject].includes(chapter)){alert('Please select a valid Subject and Chapter from the CMA Zone master.');return}
    const qrows=CMAZoneQuestionStore.read(),idx=qrows.findIndex(x=>x.id===editingId);if(idx<0)return;
    const old=qrows[idx],newContent=document.getElementById('editQuestionContent').value;
    if(!confirm('Sure you want to edit your main question content? This changes the uploaded question record.'))return;
    const updated={...old,questionNo:document.getElementById('editQuestionNo').value.trim(),marks:document.getElementById('editMarks').value.trim(),subject,chapter,questionHtml:newContent};
    delete updated.question;
    qrows[idx]=updated;CMAZoneQuestionStore.write(qrows);closeEditor();renderLibrary();
  }

  validateBtn.addEventListener('click',validate);publishBtn.addEventListener('click',publish);
  input.addEventListener('change',()=>{validated=null;sessionStorage.removeItem('cmaZoneQuestionUploadDraft');publishBtn.disabled=true;output.className='json-validation-result';output.textContent=input.files[0]?'File selected. Click Validate JSON.':'';if(!input.files.length)preview.style.display='none'});
  function fillLibraryFilters(){const rows=CMAZoneQuestionStore.read(),ss=document.getElementById('questionSubjectFilter'),aa=document.getElementById('questionAttemptFilter'),cc=document.getElementById('questionChapterFilter');if(!ss||!aa||!cc)return;const subjects=[...new Set(rows.map(q=>q.subject).filter(Boolean))].sort(),attempts=[...new Set(rows.map(q=>q.attempt||q.source).filter(Boolean))].sort(),chapters=[...new Set(rows.map(q=>q.chapter).filter(Boolean))].sort();ss.innerHTML='<option value="">ALL SUBJECTS</option>'+subjects.map(x=>'<option>'+esc(x)+'</option>').join('');aa.innerHTML='<option value="">ALL ATTEMPTS</option>'+attempts.map(x=>'<option>'+esc(x)+'</option>').join('');cc.innerHTML='<option value="">ALL CHAPTERS</option>'+chapters.map(x=>'<option>'+esc(x)+'</option>').join('');ss.value=librarySubject;aa.value=libraryAttempt;cc.value=libraryChapter}
document.querySelectorAll('.question-filter').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.filter;document.querySelectorAll('.question-filter').forEach(x=>x.classList.toggle('active',x===b));renderLibrary()}));
document.getElementById('questionLibrarySearch')?.addEventListener('input',e=>{librarySearch=e.target.value.trim().toLowerCase();renderLibrary()});document.getElementById('questionSubjectFilter')?.addEventListener('change',e=>{librarySubject=e.target.value;renderLibrary()});document.getElementById('questionAttemptFilter')?.addEventListener('change',e=>{libraryAttempt=e.target.value;renderLibrary()});document.getElementById('questionChapterFilter')?.addEventListener('change',e=>{libraryChapter=e.target.value;renderLibrary()});
  document.querySelectorAll('[data-close-edit]').forEach(x=>x.addEventListener('click',closeEditor));
  document.getElementById('editSubject')?.addEventListener('change',e=>populateChapterSelect(e.target.value,''));
  document.getElementById('saveQuestionEdit')?.addEventListener('click',saveEdit);
  document.getElementById('previewQuestionJson')?.addEventListener('click',(event)=>{
    event.preventDefault();
    try{
      let data=validated, fileName=input.files[0]?.name||'Saved JSON';
      if(!data){
        const draft=sessionStorage.getItem('cmaZoneQuestionUploadDraft');
        if(draft){const d=JSON.parse(draft);if(d&&d.data){data=validateData(d.data);fileName=d.fileName||fileName;}}
      }
      if(!data||data.errors?.length){alert('Please validate the JSON first.');return;}
      sessionStorage.setItem('cmaZoneQuestionPreviewData',JSON.stringify({data,fileName}));
      window.location.assign('question-preview.html');
    }catch(e){alert('Preview could not be opened: '+(e.message||'Unknown error'))}
  });
  window.addEventListener('cmaZoneQuestionsUpdated',()=>{fillLibraryFilters();renderLibrary()});
  renderLibrary();
  restoreDraft();
})();