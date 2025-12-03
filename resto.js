// Small interactivity for restaurentwebsite.html
// - hamburger toggle
// - reservation form handling

(function(){
  const hb = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-links');
  if(hb){
    hb.addEventListener('click', ()=>{
      nav.classList.toggle('open');
      hb.classList.toggle('open');
    });
  }

  const form = document.getElementById('reservationForm');
  const msg = document.getElementById('reserveMessage');
  // Smooth anchor scrolling and active nav highlighting
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(!href || href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        history.replaceState(null,'', href);
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  function onScrollHighlight(){
    const pos = window.scrollY + window.innerHeight/3;
    let current = null;
    sections.forEach(s=>{ if(s.offsetTop <= pos) current = s.id });
    document.querySelectorAll('.nav-links a').forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href') === ('#'+current));
    });
  }
  window.addEventListener('scroll', onScrollHighlight);
  window.addEventListener('load', onScrollHighlight);

  // Reservation handling with draft autosave and export
  const DRAFT_KEY = 'reservation.draft';
  const LIST_KEY = 'reservation.list';

  function loadDraft(){
    try{
      const raw = localStorage.getItem(DRAFT_KEY);
      if(!raw) return;
      const data = JSON.parse(raw);
      Object.keys(data).forEach(k=>{
        const el = form.querySelector('[name="'+k+'"]');
        if(el) el.value = data[k];
      });
    }catch(e){/* ignore */}
  }

  function saveDraft(){
    if(!form) return;
    const fd = new FormData(form);
    const obj = {};
    for(const [k,v] of fd.entries()) obj[k]=v;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
  }

  function saveReservation(entry){
    let list = [];
    try{ list = JSON.parse(localStorage.getItem(LIST_KEY)) || [] }catch(e){ list = [] }
    list.unshift(entry);
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  }

  function exportReservationsCSV(){
    let list = [];
    try{ list = JSON.parse(localStorage.getItem(LIST_KEY)) || [] }catch(e){ list = [] }
    if(!list.length){ alert('No reservations to export'); return }
    const keys = Object.keys(list[0]);
    const csv = [keys.join(',')].concat(list.map(r=> keys.map(k=> '"'+String(r[k]||'').replace(/"/g,'""')+'"').join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reservations.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if(form){
    loadDraft();
    form.addEventListener('input', ()=> saveDraft());
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name');
      const date = data.get('date');
      const time = data.get('time');
      if(!name || !date || !time){ msg.textContent = 'Please fill required fields.'; return; }
      const entry = { id: Date.now(), name: name, phone: data.get('phone'), date: date, time: time, guests: data.get('guests') };
      saveReservation(entry);
      localStorage.removeItem(DRAFT_KEY);
      msg.textContent = `Thanks ${name}! Your table for ${entry.guests || 1} on ${date} at ${time} is requested.`;
      form.reset();
      setTimeout(()=> msg.textContent = '', 5000);
    });

    const exportBtn = document.getElementById('exportReservations');
    if(exportBtn) exportBtn.addEventListener('click', exportReservationsCSV);
  }
})();
