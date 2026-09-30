(() => {
 const master=window.CMA_ZONE_CHAPTER_MASTER||{};
 const groupMap={foundation:'Foundation',inter1:'Intermediate Group 1',inter2:'Intermediate Group 2',final3:'Final Group 3',final4:'Final Group 4'};
 const g=document.getElementById('examGroup'),s=document.getElementById('examSubject'),c=document.getElementById('examChapter'),a=document.getElementById('examAttempt'),d=document.getElementById('examDuration'),sum=document.getElementById('examSummary'),status=document.getElementById('examStatus');
 const data=()=>master[groupMap[g.value]]||{};
 const update=()=>{const mins=Number(d.value),h=Math.floor(mins/60),m=mins%60;sum.textContent=(s.value||'Select Subject')+' · '+(c.value==='all'?'All Chapters':(c.value||'All Chapters'))+' · '+h+' Hour'+(h!==1?'s':'')+(m?' '+m+' Minutes':'')+' · 15 MCQ + Subjective Questions'};
 g.addEventListener('change',()=>{s.innerHTML='<option value="">Select Subject</option>';c.innerHTML='<option value="all">All Chapters</option>';c.disabled=true;Object.keys(data()).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;s.appendChild(o)});s.disabled=!Object.keys(data()).length;update()});
 s.addEventListener('change',()=>{const chapters=data()[s.value]||[];c.innerHTML='<option value="all">All Chapters</option>';chapters.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;c.appendChild(o)});c.disabled=!chapters.length;update()});
 [c,a,d].forEach(x=>x.addEventListener('change',update));
 document.getElementById('startExam').addEventListener('click',()=>{if(!g.value||!s.value){status.textContent='Please select CMA Group and Subject first.';status.classList.add('is-ready');return}sessionStorage.setItem('cmaZoneFullExamSetup',JSON.stringify({group:g.value,masterGroup:groupMap[g.value],subject:s.value,chapter:c.value,attempt:a.value,durationMinutes:Number(d.value),mcqCount:15,subjectiveOnScreen:true,subjectiveAnswerMode:'paper'}));status.textContent='Full exam setup saved. The exam will start with 15 selectable MCQs and then show the subjective section.';status.classList.add('is-ready')});
 update();
})();