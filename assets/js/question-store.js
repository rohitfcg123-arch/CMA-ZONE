(() => {
  const KEY='cmaZoneQuestionStoreV1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function write(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('cmaZoneQuestionsUpdated'))}
  function normalize(q, index, batchMeta){
    const options=q.options||q.choices||q.answers||[];
    const isMcq=Array.isArray(options)&&options.length>0;
    const source=String(q.source||q.questionType||q.type||'').toLowerCase();
    const isPyq=!!(batchMeta.attempt||q.attempt||q.paperAttempt||source.includes('pyq'));
    const questionType=isMcq?'mcq':'subjective';
    const surfaces=isMcq ? (isPyq?['mcq-pyq','full-exam']:['mcq-bank','full-exam']) : ['subjective-pyq','full-exam'];
    return {...q,id:q.id||('Q-'+Date.now()+'-'+index+'-'+Math.random().toString(36).slice(2,8)),subject:q.subject||q.subjectName||batchMeta.subject,chapter:q.chapter||q.chapterName||(q.category&&q.category.chapter)||q.category?.chapterName||(q.metadata&&q.metadata.chapter)||q.metadata?.chapterName,attempt:q.attempt||q.paperAttempt||batchMeta.attempt||null,questionType,surfaces,source:isPyq?'PYQ':(questionType==='mcq'?'MCQ Bank':'Subjective PYQ'),publishedAt:new Date().toISOString()};
  }
  window.CMAZoneQuestionStore={KEY,read,write,normalize,clear(){write([])},count(){return read().length}};
})();