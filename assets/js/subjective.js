(() => {
  const init = () => {
    const master = window.CMA_ZONE_CHAPTER_MASTER || {};
    const store = window.CMAZoneQuestionStore || null;
    const groupMap = {foundation:'Foundation',inter1:'Intermediate Group 1',inter2:'Intermediate Group 2',final3:'Final Group 3',final4:'Final Group 4'};
    const group = document.getElementById('groupSelect');
    const subject = document.getElementById('subjectSelect');
    const chapter = document.getElementById('chapterSelect');
    const attemptWrap = document.getElementById('attemptWrap');
    const attempt = document.getElementById('attemptSelect');
    const duration = document.getElementById('durationSelect');
    const summary = document.getElementById('subjectiveSummary');
    const status = document.getElementById('subjectiveStatus');
    const preview = document.getElementById('chapterPreview');
    const start = document.getElementById('startSubjective');
    if (!group || !subject || !chapter || !start) return;

    let mode = 'pyq';

    const setOptions = (select, items, firstText, firstValue='') => {
      select.innerHTML = '';
      const first = document.createElement('option');
      first.value = firstValue;
      first.textContent = firstText;
      select.appendChild(first);
      items.forEach(name => {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        select.appendChild(o);
      });
      select.disabled = items.length === 0;
    };

    const updateSummary = () => {
      const mins = Number(duration?.value || 180);
      const h = Math.floor(mins / 60), m = mins % 60;
      const time = h + ' Hour' + (h !== 1 ? 's' : '') + (m ? ' ' + m + ' Minutes' : '');
      summary.textContent = (mode === 'pyq' ? 'PYQ' : 'MTP') + ' · ' +
        (subject.value || 'Select Subject') + ' · ' +
        (chapter.value === 'all' ? 'All Chapters' : (chapter.value || 'All Chapters')) + ' · ' + time;
    };

    const loadSubjects = () => {
      const data = master[groupMap[group.value]] || {};
      const names = Object.keys(data);
      setOptions(subject, names, 'Select Subject');
      setOptions(chapter, [], 'All Chapters', 'all');
      chapter.disabled = true;
      preview.innerHTML = '<span>Select a subject to view its chapters.</span>';
      updateSummary();
    };

    const loadChapters = () => {
      const data = master[groupMap[group.value]] || {};
      const chapters = Array.isArray(data[subject.value]) ? data[subject.value] : [];
      setOptions(chapter, chapters, 'All Chapters', 'all');
      chapter.disabled = chapters.length === 0;
      preview.innerHTML = chapters.length
        ? chapters.map((x,i) => '<div class="chapter-chip"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+x+'</span></div>').join('')
        : '<span>Select a subject to view its chapters.</span>';
      updateSummary();
    };

    document.querySelectorAll('.subjective-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.subjective-mode').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode === 'mtp' ? 'mtp' : 'pyq';
        if (attemptWrap) attemptWrap.style.display = mode === 'pyq' ? '' : 'none';
        updateSummary();
      });
    });

    group.addEventListener('change', loadSubjects);
    subject.addEventListener('change', loadChapters);
    chapter.addEventListener('change', updateSummary);
    if (attempt) attempt.addEventListener('change', updateSummary);
    if (duration) duration.addEventListener('change', updateSummary);

    start.addEventListener('click', () => {
      if (!group.value || !subject.value) {
        status.textContent = 'Please select CMA Group and Subject first.';
        status.classList.add('is-ready');
        return;
      }
      const setup = {
        mode, group: group.value, masterGroup: groupMap[group.value],
        subject: subject.value, chapter: chapter.value || 'all',
        durationMinutes: Number(duration.value || 180),
        attempt: mode === 'pyq' ? attempt.value : null
      };
      sessionStorage.setItem('cmaZoneSubjectiveSetup', JSON.stringify(setup));
      const stored = store ? store.read() : [];
      const surface = mode === 'mtp' ? 'subjective-pyq' : 'subjective-pyq';
      const n = stored.filter(q => q.questionType === 'subjective' && q.subject === subject.value &&
        (setup.chapter === 'all' || q.chapter === setup.chapter) &&
        Array.isArray(q.surfaces) && q.surfaces.includes(surface)).length;
      status.textContent = (mode === 'mtp' ? 'MTP' : 'PYQ') + ' settings saved. ' + n + ' matching subjective question(s) are available in this browser store.';
      status.classList.add('is-ready');
    });

    if (attemptWrap) attemptWrap.style.display = '';
    loadSubjects();
    updateSummary();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();