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
