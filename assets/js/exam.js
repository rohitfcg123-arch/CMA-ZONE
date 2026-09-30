(() => {
  const init = () => {
    const master = window.CMA_ZONE_CHAPTER_MASTER || {};
    const store = window.CMAZoneQuestionStore || null;
    const groupMap = {foundation:'Foundation',inter1:'Intermediate Group 1',inter2:'Intermediate Group 2',final3:'Final Group 3',final4:'Final Group 4'};
    const g = document.getElementById('examGroup');
    const s = document.getElementById('examSubject');
    const c = document.getElementById('examChapter');
    const a = document.getElementById('examAttempt');
    const d = document.getElementById('examDuration');
    const sum = document.getElementById('examSummary');
    const status = document.getElementById('examStatus');
    const start = document.getElementById('startExam');
    if (!g || !s || !c || !start) return;

    const data = () => master[groupMap[g.value]] || {};
    const update = () => {
      const mins = Number(d?.value || 195), h = Math.floor(mins/60), m = mins%60;
      sum.textContent = (s.value || 'Select Subject') + ' · ' +
        (c.value === 'all' ? 'All Chapters' : (c.value || 'All Chapters')) + ' · ' +
        h + ' Hour' + (h !== 1 ? 's' : '') + (m ? ' ' + m + ' Minutes' : '') +
        ' · 15 MCQ + Subjective Questions';
    };

    const loadSubjects = () => {
      const names = Object.keys(data());
      const previous = s.value;
      s.innerHTML = '<option value="">Select Subject</option>';
      names.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; s.appendChild(o);
      });
      if (previous && names.includes(previous)) s.value = previous;
      s.disabled = names.length === 0;
      c.innerHTML = '<option value="all">All Chapters</option>';
      c.disabled = true;
      update();
      if (s.value) loadChapters();
    };

    const loadChapters = () => {
      const chapters = Array.isArray(data()[s.value]) ? data()[s.value] : [];
      const previous = c.value;
      c.innerHTML = '<option value="all">All Chapters</option>';
      chapters.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; c.appendChild(o);
      });
      if (previous && (previous === 'all' || chapters.includes(previous))) c.value = previous;
      c.disabled = chapters.length === 0;
      update();
    };

    g.addEventListener('change', loadSubjects);
    g.addEventListener('input', loadSubjects);
    s.addEventListener('change', loadChapters);
    s.addEventListener('input', loadChapters);

    [c,a,d].forEach(x => x && x.addEventListener('change', update));

    start.addEventListener('click', () => {
      if (!g.value || !s.value) {
        status.textContent = 'Please select CMA Group and Subject first.';
        status.classList.add('is-ready');
        return;
      }
      const setup = {
        group:g.value, masterGroup:groupMap[g.value], subject:s.value,
        chapter:c.value || 'all', attempt:a.value,
        durationMinutes:Number(d.value || 195), mcqCount:15,
        subjectiveOnScreen:true, subjectiveAnswerMode:'paper'
      };
      sessionStorage.setItem('cmaZoneFullExamSetup', JSON.stringify(setup));
      const stored = store ? store.read() : [];
      const n = stored.filter(q => q.subject === s.value &&
        (setup.chapter === 'all' || q.chapter === setup.chapter) &&
        Array.isArray(q.surfaces) && q.surfaces.includes('full-exam')).length;
      status.textContent = 'Full exam setup saved. ' + n + ' matching question(s) are available in this browser store.';
      status.classList.add('is-ready');
    });

    update();
    // Mobile browsers can restore a select value after DOMContentLoaded.
    // Re-hydrate once the page is visible so Subject/Chapter never stay disabled incorrectly.
    const hydrate = () => {
      if (g.value) loadSubjects();
      if (s.value) loadChapters();
      update();
    };
    window.addEventListener('pageshow', hydrate);
    setTimeout(hydrate, 0);
    setTimeout(hydrate, 250);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();