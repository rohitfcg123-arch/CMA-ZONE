(() => {
  const setup = JSON.parse(sessionStorage.getItem('cmaZoneSubjectiveSetup') || 'null');
  const rows = window.CMAZoneQuestionStore?.read() || [];
  if (!setup) { location.replace('subjective.html'); return; }

  const qs = rows.filter(q =>
    q.questionType === 'subjective' &&
    q.subject === setup.subject &&
    Array.isArray(q.surfaces) &&
    q.surfaces.includes('subjective-pyq') &&
    (setup.chapter === 'all' || q.chapter === setup.chapter) &&
    (setup.mode !== 'pyq' || !setup.attempt || setup.attempt === 'all' || q.attempt === setup.attempt)
  );

  const timer = document.getElementById('timer');
  const list = document.getElementById('qList');
  const submit = document.getElementById('submit');
  const status = document.getElementById('status');

  document.getElementById('src').textContent =
    setup.mode === 'mtp' ? 'MTP' : 'PYQ · ' + (setup.attempt || 'All Attempts');
  document.getElementById('title').textContent = setup.subject;
  document.getElementById('meta').textContent =
    (setup.chapter === 'all' ? 'All Chapters' : setup.chapter) + ' · ' + qs.length + ' questions · Solve on paper';
  document.getElementById('paperInfo').textContent =
    (setup.chapter === 'all' ? 'All Chapters' : setup.chapter) + ' · ' + qs.length + ' questions · Questions continue vertically on one paper';

  let left = Number(setup.durationMinutes || 180) * 60;
  let finished = false;

  const fmt = x => Math.floor(Math.max(0, x) / 60) + ':' + String(Math.max(0, x) % 60).padStart(2, '0');

  const renderQuestion = (x, index) => {
    const card = document.createElement('article');
    card.className = 'subjective-question-card';
    const no = document.createElement('div');
    no.className = 'subjective-question-top';
    no.innerHTML =
      '<div><div class="question-no">Question ' + (x.questionNo || (index + 1)) + '</div>' +
      '<div class="question-meta-line"><span><b>Subject:</b> ' + (x.subject || setup.subject) + '</span>' +
      '<span><b>Chapter:</b> ' + (x.chapter || '—') + '</span>' +
      (x.marks ? '<span><b>Marks:</b> ' + x.marks + '</span>' : '') + '</div></div>' +
      '<span class="attempt-badge">' + (x.attempt || (setup.mode === 'mtp' ? 'MTP' : 'PYQ')) + ' Attempt</span>';
    card.appendChild(no);

    const divider = document.createElement('div');
    divider.className = 'question-divider';
    card.appendChild(divider);

    const body = document.createElement('div');
    body.className = 'question-text';
    if (x.questionHtml) body.innerHTML = x.questionHtml;
    else body.innerHTML = '<p>' + String(x.question || '').replace(/\n/g, '<br>') + '</p>';
    card.appendChild(body);

    const note = document.createElement('div');
    note.className = 'paper-note';
    note.textContent = 'Solve this question on paper.';
    card.appendChild(note);
    return card;
  };

  const render = () => {
    list.innerHTML = '';
    if (!qs.length) {
      list.innerHTML = '<div class="subjective-empty">No matching questions found for the selected Group, Subject, Chapter or Attempt.</div>';
      submit.disabled = true;
      return;
    }
    qs.forEach((x, i) => list.appendChild(renderQuestion(x, i)));
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(loop);
    sessionStorage.setItem('cmaZoneSubjectiveResult', JSON.stringify({
      setup,
      questionIds: qs.map(x => x.id),
      completedAt: new Date().toISOString()
    }));
    submit.disabled = true;
    status.textContent = 'Paper submitted. Exam session completed.';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  submit.addEventListener('click', finish);
  render();
  timer.textContent = fmt(left);

  const loop = setInterval(() => {
    if (finished) return;
    left--;
    timer.textContent = fmt(left);
    if (left <= 0) finish();
  }, 1000);
})();