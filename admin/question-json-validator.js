(() => {
  const input = document.getElementById('questionJsonFile');
  const output = document.getElementById('jsonValidationResult');
  const validateBtn = document.getElementById('validateQuestionJson');

  function subjectMap() {
    const map = {};
    const master = window.CMA_ZONE_CHAPTER_MASTER || {};
    Object.values(master).forEach(group => Object.keys(group).forEach(subject => { map[subject] = group[subject]; }));
    return map;
  }

  function getQuestions(data) {
    if (Array.isArray(data)) return data;
    return data.questions || data.questionBank || data.items || data.data || null;
  }

  function getField(q, names) {
    for (const name of names) {
      if (q && typeof q === 'object' && q[name] != null && String(q[name]).trim() !== '') return String(q[name]).trim();
    }
    return '';
  }

  function validate() {
    output.className = 'json-validation-result';
    output.textContent = '';
    if (!input.files.length) {
      output.classList.add('error');
      output.textContent = 'Select a JSON file first.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); }
      catch (e) {
        output.classList.add('error');
        output.textContent = 'JSON Error: Invalid JSON syntax. The file cannot be uploaded.';
        return;
      }

      const questions = getQuestions(data);
      if (!Array.isArray(questions) || !questions.length) {
        output.classList.add('error');
        output.textContent = 'JSON Error: No questions array found. Expected "questions" (or questionBank/items/data) containing question objects.';
        return;
      }

      const map = subjectMap();
      const errors = [];
      const topSubject = getField(data, ['subject','subjectName']);
      questions.forEach((q, i) => {
        const no = i + 1;
        const subject = getField(q, ['subject','subjectName']) || topSubject;
        const chapter = getField(q, ['chapter','chapterName']) ||
          getField(q.category || {}, ['chapter','chapterName']) ||
          getField(q.metadata || {}, ['chapter','chapterName']);

        if (!subject) {
          errors.push('Question ' + no + ': subject is missing.');
          return;
        }
        if (!map[subject]) {
          errors.push('Question ' + no + ': wrong subject "' + subject + '". Subject is not present in the CMA Zone master.');
          return;
        }
        if (!chapter) {
          errors.push('Question ' + no + ': chapter is missing. Every question must use an exact master chapter name.');
          return;
        }
        if (!map[subject].includes(chapter)) {
          errors.push('Question ' + no + ': wrong chapter "' + chapter + '" for "' + subject + '". Select an exact chapter from the CMA Zone master.');
        }
      });

      if (errors.length) {
        output.classList.add('error');
        output.innerHTML = '<strong>Upload blocked — chapter/subject validation failed.</strong><ul>' +
          errors.slice(0, 50).map(e => '<li>' + e.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</li>').join('') +
          '</ul>' + (errors.length > 50 ? '<p>Showing first 50 errors. Fix all invalid records before upload.</p>' : '');
        return;
      }

      output.classList.add('success');
      output.innerHTML = '<strong>Validation passed.</strong> ' + questions.length +
        ' question(s) use valid CMA Zone subjects and exact master chapter names. The JSON is ready for the next upload/publish step.';
    };
    reader.readAsText(input.files[0]);
  }

  validateBtn.addEventListener('click', validate);
  input.addEventListener('change', () => {
    output.className = 'json-validation-result';
    output.textContent = input.files[0] ? 'File selected. Click Validate JSON.' : '';
  });
})();