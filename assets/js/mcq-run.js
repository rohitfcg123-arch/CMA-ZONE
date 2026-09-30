(() => {
  const setup = JSON.parse(sessionStorage.getItem('cmaZoneMcqSetup') || 'null');
  const store = window.CMAZoneQuestionStore || null;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '');
  if (!setup) { location.replace('mcq.html'); return; }

  let questions = [];
  let index = 0;
  let answers = {};
  let wholeLeft = Number(setup.wholeDurationMinutes || 0) * 60;
  let questionLeft = Number(setup.perQuestionSeconds || 0);
  let interval = null;
  const key=q=>q.id||[q.subject,q.chapter,q.attempt,q.questionNo,q.question].join('|');
  const readList=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}};
  const writeList=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const isCorrect=(q,ans)=>{const c=q.correctAnswer??q.answer??q.correctOption??q.answerIndex; if(c==null)return false; if(typeof c==='number')return Number(ans)===c; const opts=getOptions(q); return String(c).trim().toLowerCase()===String(ans).trim().toLowerCase()||String(c).trim().toLowerCase()===String(opts[Number(ans)]??'').trim().toLowerCase()};

  const matches = q => q && q.questionType === 'mcq' &&
    q.subject === setup.subject &&
    Array.isArray(q.surfaces) &&
    q.surfaces.includes(setup.source === 'pyq' ? 'mcq-pyq' : 'mcq-bank') &&
    (setup.chapter === 'all' || q.chapter === setup.chapter) &&
    (setup.source !== 'pyq' || !setup.attempt || setup.attempt === 'all' || q.attempt === setup.attempt);

  const getOptions = q => Array.isArray(q.options) ? q.options :
    Array.isArray(q.choices) ? q.choices : [];

  const shuffle = arr => {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };

  const format = sec => {
    sec = Math.max(0, Number(sec)||0);
    const m = Math.floor(sec/60), s = sec%60;
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  };

  const render = () => {
    const q = questions[index];
    if (!q) return;
    $('runSource').textContent = setup.source === 'pyq' ? 'PYQ · PREVIOUS YEAR MCQ' : 'MCQ BANK';
    $('runTitle').textContent = setup.subject + ' Practice';
    $('runSubject').textContent = setup.subject;
    $('runMeta').textContent = (setup.chapter === 'all' ? 'All Chapters' : setup.chapter) + ' · ' + questions.length + ' Questions';
    $('runProgress').textContent = 'Question ' + (index+1) + ' of ' + questions.length;
    $('questionNo').textContent = 'Question ' + (index+1) + (q.marks ? ' · ' + q.marks + ' Marks' : '');
    $('questionText').innerHTML = q.questionHtml || q.question || q.text || '';
    const box = $('options'); box.innerHTML = '';
    getOptions(q).forEach((opt,i) => {
      const label = document.createElement('label');
      label.className = 'mcq-option';
      label.innerHTML = '<input type="radio" name="mcqOption" value="' + i + '"' + (String(answers[index]) === String(i) ? ' checked' : '') + '><span>' + esc(typeof opt === 'object' ? (opt.text || opt.label || '') : opt) + '</span>';
      label.querySelector('input').addEventListener('change', e => { answers[index] = e.target.value; });
      box.appendChild(label);
    });
    $('prevBtn').disabled = index === 0;
    $('nextBtn').textContent = index === questions.length-1 ? 'SUBMIT PRACTICE →' : 'Next →';
    $('runStatus').textContent = '';
    const bm=readList('cmaZoneMcqBookmarks');$('bookmarkCurrent').textContent=bm.includes(key(q))?'★ Bookmarked':'☆ Bookmark';
    resetQuestionTimer();
  };

  const finish = reason => {
    clearInterval(interval);
    const wrong=questions.filter((q,i)=>answers[i]!=null&&!isCorrect(q,answers[i])).map(key);writeList('cmaZoneMcqWrong',wrong);const result = { setup, total: questions.length, answered: Object.keys(answers).length, answers, reason, completedAt: new Date().toISOString() };
    sessionStorage.setItem('cmaZoneMcqResult', JSON.stringify(result));
    $('questionText').innerHTML = '<h3>Practice completed</h3><p>You answered ' + result.answered + ' of ' + result.total + ' questions.</p>';
    $('options').innerHTML = '';
    $('prevBtn').style.display = 'none';
    $('nextBtn').textContent = 'BACK TO MCQ PORTAL';
    $('nextBtn').onclick = () => location.replace('mcq.html');
    $('runStatus').textContent = reason === 'time' ? 'Time is over. Your practice round has been submitted.' : 'Practice round submitted.';
  };

  const resetQuestionTimer = () => {
    if (setup.timerMode !== 'question') return;
    questionLeft = Number(setup.perQuestionSeconds || 60);
    $('runTimer').textContent = format(questionLeft);
  };

  const tick = () => {
    if (setup.timerMode === 'whole') {
      wholeLeft--;
      $('runTimer').textContent = format(wholeLeft);
      if (wholeLeft <= 0) finish('time');
    } else if (setup.timerMode === 'question') {
      questionLeft--;
      $('runTimer').textContent = format(questionLeft);
      if (questionLeft <= 0) {
        if (index < questions.length-1) { index++; render(); }
        else finish('time');
      }
    }
  };

  const init = () => {
    const all = store ? store.read() : [];
    questions = all.filter(matches);
    const special=setup.special;
    if(special==='bookmark'){const bm=new Set(readList('cmaZoneMcqBookmarks'));questions=questions.filter(q=>bm.has(key(q)))}
    if(special==='wrong'){const wrong=new Set(readList('cmaZoneMcqWrong'));questions=questions.filter(q=>wrong.has(key(q)))}
    if (setup.order === 'random') questions = shuffle(questions);
    if (setup.questionCount && setup.questionCount !== 'all') questions = questions.slice(0, Number(setup.questionCount));
    if (!questions.length) {
      $('runTitle').textContent = 'No questions found';
      $('runMeta').textContent = 'No matching MCQ questions are available in this browser store.';
      $('questionText').textContent = 'Please go back to the MCQ setup and choose another Group, Subject, Chapter, Attempt, or source.';
      $('options').innerHTML = '';
      $('prevBtn').style.display = 'none';
      $('nextBtn').textContent = 'BACK TO MCQ PORTAL';
      $('nextBtn').onclick = () => location.replace('mcq.html');
      return;
    }
    render();
    if (setup.timerMode === 'whole') $('runTimer').textContent = format(wholeLeft);
    else if (setup.timerMode === 'question') $('runTimer').textContent = format(questionLeft);
    else $('runTimer').textContent = 'NO TIMER';
    if (setup.timerMode !== 'none') interval = setInterval(tick, 1000);
  };

  $('bookmarkCurrent').onclick=()=>{const q=questions[index],arr=readList('cmaZoneMcqBookmarks'),k=key(q),i=arr.indexOf(k);if(i>=0)arr.splice(i,1);else arr.push(k);writeList('cmaZoneMcqBookmarks',arr);render()};
  $('clearAnswer').onclick=()=>{delete answers[index];render()};
  $('prevBtn').onclick = () => { if (index > 0) { index--; render(); } };
  $('nextBtn').onclick = () => { if (index < questions.length-1) { index++; render(); } else finish('manual'); };
  init();
})();