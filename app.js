// ===== Ajustes de negocio =====
const WA_NUMBER = "524772521372"; // <— cambia al WhatsApp de la dentista (solo números con LADA)
const CALENDLY_URL = "https://calendly.com/usuario-dentista/valoracion?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=0b7d7a&locale=es";

// ===== Año automático =====
const yearEl = document.getElementById("y");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Links de WhatsApp =====
const wa = (t) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t || "Hola, quiero agendar una valoración.")}`;
document.querySelectorAll(".wa").forEach(a=>{
  const msg = a.getAttribute("data-wa-text") || "Hola, quiero información.";
  a.href = wa(msg);
  a.target = "_blank";
  a.rel = "noopener";
});

// ===== Hero rotador suave =====
const hero = document.getElementById("heroArt");
if (hero){
  const slides = [...hero.querySelectorAll("img")];
  let i = 0, timer;
  const show = (n)=>{
    slides.forEach(s=>s.classList.remove("active"));
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("active");
  };
  const start=()=>{ stop(); if(slides.length>1) timer=setInterval(()=>show(i+1), 3800); };
  const stop =()=>{ if(timer){ clearInterval(timer); timer=null; } };
  slides.forEach(img=>{ img.decoding="async"; img.loading="lazy"; });
  show(0); start();
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
}

// ===== Menú responsive =====
const nav = document.querySelector('.menu');
const navToggle = document.getElementById('navToggle');
if (nav && navToggle){
  navToggle.addEventListener('click', ()=> nav.classList.toggle('open'));
  document.querySelectorAll('.menu a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ===== Inyecta Calendly URL si se cambia en una sola variable =====
const calIframe = document.querySelector('#agenda iframe');
if (calIframe){
  calIframe.src = CALENDLY_URL;
}
// --- Acordeón de servicios (versión robusta con delegación + ARIA) ---
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.svc-name');
  if (!btn) return;                             // ignora clics fuera del nombre
  const li = btn.closest('.svc-item');
  if (!li) return;

  const isOpen = li.classList.toggle('open');   // abre/cierra
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
// === Reseñas (auto-rotación 3 visibles, cada 5s) ===
(() => {
  const KEY = 'clinic_reviews_v1';
  const INTERVAL_MS = 5000;

  const $form = document.getElementById('reviewForm');
  const $ul   = document.getElementById('reviewsUl');
  const $more = document.getElementById('loadMoreReviews');
  if (!$ul) return;
  if ($more) $more.style.display = 'none'; // ya no usamos "Ver más"

  const read  = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const order = (arr) => arr.slice().sort((a,b) => b.ts - a.ts);
  const escape = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stars  = (n) => { n=Math.max(1,Math.min(5,n|0)); return '★★★★★☆☆☆☆☆'.slice(5-n,10-n); };
  const fmtDate= (ts) => new Date(ts).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'2-digit'});

  let all = read();
  let ordered = order(all);
  let start = 0;
  let timer = null;

  function renderWindow(){
    if (ordered.length === 0){
      $ul.innerHTML = '<li class="review-card"><p class="review-text muted">Sé la primera persona en dejar una reseña.</p></li>';
      return;
    }
    const k = Math.min(3, ordered.length);
    const html = Array.from({length:k}, (_,i)=>{
      const r = ordered[(start + i) % ordered.length];
      return `
        <li class="review-card">
          <div class="review-head">
            <span class="review-name">${escape(r.name || 'Paciente')}</span>
            <span class="review-date">${fmtDate(r.ts)}</span>
          </div>
          <div class="review-stars" aria-label="Calificación: ${r.rating} de 5">${stars(r.rating)}</div>
          <p class="review-text">${escape(r.msg)}</p>
        </li>
      `;
    }).join('');
    $ul.innerHTML = html;
  }

  function startLoop(){
    stopLoop();
    renderWindow();
    if (ordered.length <= 3) return;        // si hay 3 o menos, no rotamos
    timer = setInterval(() => {
      start = (start + 1) % ordered.length; // corre la ventana
      renderWindow();
    }, INTERVAL_MS);
  }
  function stopLoop(){ if (timer){ clearInterval(timer); timer=null; } }

  // Pausar en hover y cuando la pestaña no está visible
  $ul.addEventListener('mouseenter', stopLoop);
  $ul.addEventListener('mouseleave', startLoop);
  document.addEventListener('visibilitychange', () => document.hidden ? stopLoop() : startLoop());

  // Altas nuevas: entran hasta arriba y reiniciamos ventana
  if ($form){
    $form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData($form);
      const name = (fd.get('name')||'').toString().trim();
      const rating = parseInt(fd.get('rating')||'0', 10);
      const msg = (fd.get('message')||'').toString().trim();
      if (!rating || !msg){ alert('Elige calificación y escribe tu reseña.'); return; }

      all.push({ name, rating, msg, ts: Date.now() });
      write(all);
      ordered = order(all);
      start = 0;
      $form.reset();
      startLoop();
    });
  }

  startLoop();
})();
// --- ScrollSpy del menú (resalta sección visible) ---
(() => {
  const ids = ['inicio','quienes','resenas','servicios','before','faq','contacto'];
  const sections = ids
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const linkMap = new Map(
    Array.from(document.querySelectorAll('.menu a[href^="#"]'))
      .map(a => [a.getAttribute('href').slice(1), a])
  );

  const setActive = () => {
    const y = window.scrollY + 140; // compensa la navbar sticky
    let current = sections[0]?.id;
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    // limpia y aplica .active
    linkMap.forEach(a => a.classList.remove('active'));
    if (current && linkMap.get(current)) linkMap.get(current).classList.add('active');
  };

  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('load', setActive);
})();
(() => {
  const ids = ['inicio','quienes','resenas','servicios','before','faq','contacto'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const linkMap = new Map(Array.from(document.querySelectorAll('.menu a[href^="#"]'))
    .map(a => [a.getAttribute('href').slice(1), a]));

  const setActive = () => {
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    for (const sec of sections){ if (sec.offsetTop <= y) current = sec.id; }
    linkMap.forEach(a => a.classList.remove('active'));
    if (current && linkMap.get(current)) linkMap.get(current).classList.add('active');
  };
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('load', setActive);
})();
