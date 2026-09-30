(() => {
  const input=document.getElementById('questionJsonFile'),output=document.getElementById('jsonValidationResult'),validateBtn=document.getElementById('validateQuestionJson'),publishBtn=document.getElementById('publishQuestionJson');
  let validated=null;
  function subjectMap(){const map={},master=window.CMA_ZONE_CHAPTER_MASTER||{};Object.values(master).forEach(g=>Object.keys(g).forEach(s=>map[s]=g[s]));return map}
  function getQuestions(d){if(Array.isArray(d))return d;return d.questions||d.questionBank||d.items||d.data||null}
  function getField(q,n){for(const x of n)if(q&&q[x]!=null&&String(q[x]).trim())return String(q[x]).trim();return''}
  function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function validateData(data){
    const qs=getQuestions(data);if(!Array.isArray(qs)||!qs.length)return{errors:['No questions array found. Expected questions/questionBank/items/data.']};
    const map=subjectMap(),errors=[],topSubject=getField(data,['subject','subjectName']),topAttempt=getField(data,['attempt','paperAttempt']);
    qs.forEach((q,i)=>{const no=i+1,subject=getField(q,['subject','subjectName'])||topSubject,chapter=getField(q,['chapter','chapterName'])||getField(q.category||{},['chapter','chapterName'])||getField(q.metadata||{},['chapter','chapterName']);if(!subject)errors.push('Question '+no+': subject is missing.');else if(!map[subject])errors.push('Question '+no+': wrong subject "'+subject+'". It is not in the CMA Zone master.');if(!chapter)errors.push('Question '+no+': chapter is missing.');else if(subject&&map[subject]&&!map[subject].includes(chapter))errors.push('Question '+no+': chapter "'+chapter+'" does not exactly match the master chapter for "'+subject+'".')});
    return{errors,qs,topSubject,topAttempt}
  }
  function showErrors(es){output.className='json-validation-result error';output.innerHTML='<strong>UPLOAD BLOCKED — exact master validation failed.</strong><ul>'+es.slice(0,50).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(es.length>50?'<p>Showing first 50 errors. Fix every invalid record.</p>':'');publishBtn.disabled=true}
  function validate(){
    validated=null;publishBtn.disabled=true;output.className='json-validation-result';output.textContent='';
    if(!input.files.length){output.classList.add('error');output.textContent='Select a JSON file first.';return}
    const reader=new FileReader();reader.onload=()=>{let data;try{data=JSON.parse(reader.result)}catch(e){output.className='json-validation-result error';output.textContent='JSON Error: Invalid JSON syntax.';return}
      const r=validateData(data);if(r.errors.length){showErrors(r.errors);return} validated=r;
      const rows=r.qs.map((q,i)=>CMAZoneQuestionStore.normalize(q,i,{subject:r.topSubject,attempt:r.topAttempt})),mcq=rows.filter(q=>q.questionType==='mcq').length,sub=rows.length-mcq,pyq=rows.filter(q=>q.surfaces.includes('mcq-pyq')||q.surfaces.includes('subjective-pyq')).length;
      output.className='json-validation-result success';output.innerHTML='<strong>VALIDATION PASSED.</strong> '+rows.length+' questions · '+mcq+' MCQ · '+sub+' Subjective · '+pyq+' PYQ. Exact subject/chapter names confirmed. <b>Publish</b> routes each record automatically.';publishBtn.disabled=false};
    reader.readAsText(input.files[0])
  }
  function publish(){if(!validated)return;const old=CMAZoneQuestionStore.read(),rows=validated.qs.map((q,i)=>CMAZoneQuestionStore.normalize(q,i,{subject:validated.topSubject,attempt:validated.topAttempt}));CMAZoneQuestionStore.write(old.concat(rows));output.className='json-validation-result success';output.innerHTML='<strong>PUBLISHED.</strong> '+rows.length+' questions added. MCQ/PYQ/Subjective/Full-Length routing is stored per question. Total stored: '+CMAZoneQuestionStore.count()+'.';publishBtn.disabled=true}
  validateBtn.addEventListener('click',validate);publishBtn.addEventListener('click',publish);input.addEventListener('change',()=>{validated=null;publishBtn.disabled=true;output.className='json-validation-result';output.textContent=input.files[0]?'File selected. Click Validate JSON.':''})
})();