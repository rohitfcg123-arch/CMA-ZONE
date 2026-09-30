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

    g.addEventListener('change', () => {
      const names = Object.keys(data());
      s.innerHTML = '<option value="">Select Subject</option>';
      names.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; s.appendChild(o);
      });
      s.disabled = names.length === 0;
      c.innerHTML = '<option value="all">All Chapters</option>';
      c.disabled = true;
      update();
    });

    s.addEventListener('change', () => {
      const chapters = Array.isArray(data()[s.value]) ? data()[s.value] : [];
      c.innerHTML = '<option value="all">All Chapters</option>';
      chapters.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; c.appendChild(o);
      });
      c.disabled = chapters.length === 0;
      update();
    });

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
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();