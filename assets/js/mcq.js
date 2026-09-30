(() => {
  const params = new URLSearchParams(window.location.search);
  const group = params.get('group') || '';
  const subject = params.get('subject') || 'Selected Subject';

  const chapterMaster = {
    // Chapter names will be filled from the exact chapter master supplied for each subject.
    // Do not replace these with invented chapter names.
  };

  const attemptMaster = {
    // Attempts will be populated from the question database for the selected subject.
  };

  const subjectTitle = document.getElementById('subjectTitle');
  const subjectMeta = document.getElementById('subjectMeta');
  const source = document.getElementById('sourceSelect');
  const chapter = document.getElementById('chapterSelect');
  const attemptField = document.getElementById('attemptField');
  const attempt = document.getElementById('attemptSelect');
  const count = document.getElementById('questionCount');
  const order = document.getElementById('orderSelect');
  const timerMode = document.getElementById('timerMode');
  const wholeOptions = document.getElementById('wholeTimerOptions');
  const questionOptions = document.getElementById('questionTimerOptions');
  const wholeDuration = document.getElementById('wholeDuration');
  const questionDuration = document.getElementById('questionDuration');
  const summary = document.getElementById('setupSummary');
  const start = document.getElementById('startPractice');
  const status = document.getElementById('dataStatus');

  subjectTitle.textContent = subject;
  subjectMeta.textContent = 'MCQ Portal · ' + (group ? group.replace(/(^|\s)\S/g, m => m.toUpperCase()) : 'CMA') + ' · Choose your practice settings below.';

  function populateChapters() {
    chapter.innerHTML = '<option value="all">All Chapters</option>';
    (chapterMaster[subject] || []).forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      chapter.appendChild(option);
    });
  }

  function populateAttempts() {
    attempt.innerHTML = '<option value="all">All Attempts</option>';
    (attemptMaster[subject] || []).forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      attempt.appendChild(option);
    });
  }

  function updateTimerUI() {
    wholeOptions.classList.toggle('is-active', timerMode.value === 'whole');
    questionOptions.classList.toggle('is-active', timerMode.value === 'question');
  }

  function labelCount() {
    return count.value === 'all' ? 'All Available Questions' : count.value + ' Questions';
  }

  function updateSummary() {
    const sourceText = source.value === 'bank' ? 'MCQ Bank' : 'PYQ';
    const chapterText = chapter.value === 'all' ? 'All Chapters' : chapter.value;
    const orderText = order.value === 'random' ? 'Random' : 'Same Order';
    let timerText = 'No Timer';
    if (timerMode.value === 'whole') timerText = 'Whole Test · ' + wholeDuration.value + ' min';
    if (timerMode.value === 'question') timerText = 'Per Question · ' + questionDuration.value + ' sec';
    summary.innerHTML = '<strong>' + sourceText + '</strong><span>' +
      chapterText + ' · ' + labelCount() + ' · ' + orderText + ' · ' + timerText + '</span>';
  }

  function updateSourceUI() {
    const isPyq = source.value === 'pyq';
    attemptField.classList.toggle('is-visible', isPyq);
    populateChapters();
    populateAttempts();
    updateSummary();
  }

  [source, chapter, attempt, count, order, timerMode, wholeDuration, questionDuration].forEach((el) => {
    el.addEventListener('change', () => {
      if (el === source) updateSourceUI();
      else {
        updateTimerUI();
        updateSummary();
      }
    });
  });

  start.addEventListener('click', () => {
    const settings = {
      group,
      subject,
      source: source.value,
      chapter: chapter.value,
      attempt: source.value === 'pyq' ? attempt.value : null,
      questionCount: count.value,
      order: order.value,
      timerMode: timerMode.value,
      wholeDurationMinutes: timerMode.value === 'whole' ? Number(wholeDuration.value) : null,
      perQuestionSeconds: timerMode.value === 'question' ? Number(questionDuration.value) : null
    };

    sessionStorage.setItem('cmaZoneMcqSetup', JSON.stringify(settings));
    status.textContent = 'Practice settings saved. The question engine will use only the selected source, chapter and attempt filters.';
    status.classList.add('is-ready');
  });

  populateChapters();
  populateAttempts();
  updateSourceUI();
  updateTimerUI();
  status.textContent = 'Setup ready. Question data is read from the CMA Zone master database when the MCQ engine is connected.';
})();