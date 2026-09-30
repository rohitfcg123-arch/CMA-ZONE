(() => {
 const master = window.CMA_ZONE_CHAPTER_MASTER || {};
 const group = document.getElementById('groupSelect');
 const subject = document.getElementById('subjectSelect');
 const chapter = document.getElementById('chapterSelect');
 const attemptWrap = document.getElementById('attemptWrap');
 const attempt = document.getElementById('attemptSelect');
 const duration = document.getElementById('durationSelect');
 const summary = document.getElementById('subjectiveSummary');
 const status = document.getElementById('subjectiveStatus');
 const preview = document.getElementById('chapterPreview');
 let mode = 'pyq';

 const modes = document.querySelectorAll('.subjective-mode');
 modes.forEach(btn => btn.addEventListener('click', () => {
   modes.forEach(x => x.classList.remove('active')); btn.classList.add('active');
   mode = btn.dataset.mode;
   attemptWrap.style.display = mode === 'pyq' ? 'flex' : 'none';
   updateSummary();
 }));

 group.addEventListener('change', () => {
   subject.innerHTML = '<option value="">Select Subject</option>';
   chapter.innerHTML = '<option value="all">All Chapters</option>';
   chapter.disabled = true;
   const data = master[group.value] || {};
   Object.keys(data).forEach(name => {
     const o=document.createElement('option'); o.value=name; o.textContent=name; subject.appendChild(o);
   });
   subject.disabled = Object.keys(data).length === 0;
   preview.innerHTML='<span>Select a subject to view its chapters.</span>';
   updateSummary();
 });
 subject.addEventListener('change', () => {
   const data = master[group.value] || {};
   const chapters = data[subject.value] || [];
   chapter.innerHTML='<option value="all">All Chapters</option>';
   chapters.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;chapter.appendChild(o);});
   chapter.disabled = chapters.length === 0;
   preview.innerHTML = chapters.length ? chapters.map((x,i)=>'<div class="chapter-chip"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+x+'</span></div>').join('') : '<span>Select a subject to view its chapters.</span>';
   updateSummary();
 });
 [chapter,attempt,duration].forEach(el=>el.addEventListener('change',updateSummary));

 function updateSummary(){
   const modeText=mode==='pyq'?'PYQ':'MTP';
   const subjectText=subject.value||'Select Subject';
   const chapterText=chapter.value==='all'?'All Chapters':(chapter.value||'All Chapters');
   const mins=Number(duration.value);
   const h=Math.floor(mins/60), m=mins%60;
   const time=h+' Hour'+(h!==1?'s':'')+(m?' '+m+' Minutes':'');
   summary.textContent=modeText+' · '+subjectText+' · '+chapterText+' · '+time;
 }
 document.getElementById('startSubjective').addEventListener('click',()=>{
   if(!group.value||!subject.value){status.textContent='Please select CMA Group and Subject first.';status.classList.add('is-ready');return;}
   const settings={mode,group:group.value,subject:subject.value,chapter:chapter.value,durationMinutes:Number(duration.value),attempt:mode==='pyq'?attempt.value:null};
   sessionStorage.setItem('cmaZoneSubjectiveSetup',JSON.stringify(settings));
   status.textContent='Settings saved. The selected '+(mode==='pyq'?'PYQ':'MTP')+' paper will use only this subject/chapter and the selected exam timing.';
   status.classList.add('is-ready');
 });
 updateSummary();
})();