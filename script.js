// Utility
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let confettiPieces = [];

function randomColor(){
  // choose palette based on screen size for softer mobile look
  const small = window.innerWidth <= 420;
  const desktop = ['#ffcc80','#ff8a80','#ffd54f','#81d4fa','#b39ddb','#a5d6a7','#ffab91'];
  const mobile = ['#ffdce0','#fff3e0','#fbc2eb','#cfe9ff','#d7f5e6','#ffe9b8'];
  const colors = small ? mobile : desktop;
  return colors[Math.floor(Math.random()*colors.length)];
}

function createConfettiPiece(x,y,force){
  const small = window.innerWidth <= 420;
  const w = small ? (Math.random()*4 + 3) : (Math.random()*8 + 6);
  const shape = small ? 'circle' : 'rect';
  confettiPieces.push({
    x: (typeof x === 'number') ? x : Math.random()*confettiCanvas.width,
    y: (typeof y === 'number') ? y : -10,
    w: w,
    h: small ? w : w*0.6,
    color: randomColor(),
    shape: shape,
    rotation: Math.random()*360,
    rotationSpeed: small ? (Math.random()-0.5)*3 : (Math.random()-0.5)*8,
    vx: (Math.random()-0.5) * (force? force : (small ? 1.2 : 2)),
    vy: (Math.random()* (small ? 1.6 : 3)) + (force? force*0.4 : (small ? 1.2 : 2)),
    gravity: small ? (0.06 + Math.random()*0.03) : (0.12 + Math.random()*0.06),
  });
}

function burstConfetti(x,y,count,force){
  for(let i=0;i<count;i++) createConfettiPiece(x,y,force);
}

function updateConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  for(let i=confettiPieces.length-1;i>=0;i--){
    const p = confettiPieces[i];
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI/180);
    ctx.fillStyle = p.color;
    if(p.shape === 'circle'){
      ctx.beginPath();
      ctx.arc(0,0, Math.max(1, p.w/1.8), 0, Math.PI*2);
      ctx.fill();
    } else {
      // rounded rect
      const rx = Math.min(6, p.w/4);
      const rw = p.w, rh = p.h;
      ctx.beginPath();
      ctx.moveTo(-rw/2 + rx, -rh/2);
      ctx.arcTo(rw/2, -rh/2, rw/2, rh/2, rx);
      ctx.arcTo(rw/2, rh/2, -rw/2, rh/2, rx);
      ctx.arcTo(-rw/2, rh/2, -rw/2, -rh/2, rx);
      ctx.arcTo(-rw/2, -rh/2, rw/2, -rh/2, rx);
      ctx.fill();
    }
    ctx.restore();

    if(p.y > confettiCanvas.height + 50 || p.x < -100 || p.x > confettiCanvas.width + 100){
      confettiPieces.splice(i,1);
    }
  }
}

function animate(){
  updateConfetti();
  requestAnimationFrame(animate);
}
animate();

// Regular gentle confetti rain
// Regular gentle confetti rain (reduced on mobile)
const isSmallScreen = window.innerWidth <= 420;
setInterval(()=>{
  const chance = isSmallScreen ? 0.18 : 0.6;
  if(Math.random() < chance) createConfettiPiece(isSmallScreen ? undefined : undefined);
}, isSmallScreen ? 300 : 120);

// Balloons: spawn on wish or periodically
function spawnBalloon(x){
  const el = document.createElement('div');
  el.className = 'balloon';
  const size = 44 + Math.floor(Math.random()*40);
  el.style.width = size + 'px';
  el.style.height = Math.floor(size*1.25) + 'px';
  const left = (x === undefined) ? Math.random() * window.innerWidth : Math.min(Math.max(x - size/2, 10), window.innerWidth - size - 10);
  el.style.left = left + 'px';
  el.style.background = randomColor();
  el.style.bottom = '-120px';
  el.style.opacity = '0.98';
  document.body.appendChild(el);

  const rise = 8000 + Math.random()*6000;
  el.animate([
    { transform: `translateY(0) rotate(0deg)`, offset: 0 },
    { transform: `translateY(-${window.innerHeight + 200}px) rotate(${Math.random()*360}deg)`, offset: 1 }
  ],{ duration: rise, easing: 'cubic-bezier(.17,.67,.3,1)', iterations:1 });

  setTimeout(()=>el.remove(), rise + 200);
}

// Periodic gentle balloons
// Periodic gentle balloons (disabled on small screens for clarity)
if(!isSmallScreen){
  setInterval(()=>{
    if(Math.random() < 0.25) spawnBalloon();
  }, 2500);
}

// Typed subtitle
function typeSubtitle(){
  const el = document.querySelector('.subtitle');
  if(!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  let i=0;
  const iv = setInterval(()=>{
    el.textContent += text[i++]||'';
    if(i>text.length) clearInterval(iv);
  },36);
}
typeSubtitle();

// Autoplay music when possible and trigger an initial celebration
const audio = document.getElementById('birthdaySong');
function tryAutoplayAndCelebrate(){
  if(audio){
    // audio is started muted via attribute; try to unmute shortly after load
    audio.play().catch(()=>{});

    // Try resume AudioContext (helps in some browsers)
    try{
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(AudioCtx){
        const ctx = new AudioCtx();
        if(ctx.state === 'suspended'){
          ctx.resume().catch(()=>{});
        }
      }
    }catch(e){}

    // Retry loop: attempt to unmute/play a few times before showing toast
    let attempts = 0;
    const maxAttempts = 6;
    const tryUnmute = ()=>{
      attempts++;
      try{
        audio.muted = false;
        audio.volume = 0.9;
        audio.play().then(()=>{
          // success: hide toast if any
          const toast = document.getElementById('audioToast'); if(toast){ toast.style.opacity='0'; toast.setAttribute('aria-hidden','true'); }
        }).catch(()=>{
          if(attempts < maxAttempts){
            setTimeout(tryUnmute, 400);
          } else {
            // still blocked after retries -> show toast and attach click fallback
            const toast = document.getElementById('audioToast');
            if(toast){ toast.style.opacity = '1'; toast.setAttribute('aria-hidden','false'); }
            const onClickEnable = () => { audio.muted = false; audio.play().catch(()=>{}); document.body.removeEventListener('click', onClickEnable); if(toast){ toast.style.opacity='0'; toast.setAttribute('aria-hidden','true'); } };
            document.body.addEventListener('click', onClickEnable, { once: true });
          }
        });
      }catch(e){
        if(attempts < maxAttempts) setTimeout(tryUnmute, 400);
      }
    };
    setTimeout(tryUnmute, 400);
  }

  // initial confetti burst at center
  // smaller burst for mobile
  const initialBurst = window.innerWidth <= 420 ? 28 : 80;
  const initialForce = window.innerWidth <= 420 ? 3.5 : 6;
  burstConfetti(window.innerWidth/2, window.innerHeight/2, initialBurst, initialForce);

  // spawn several balloons across the width
  for(let i=0;i<10;i++){
    setTimeout(()=> spawnBalloon((i+0.5)*window.innerWidth/10 + (Math.random()-0.5)*80), i*160);
  }
}

if(document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', tryAutoplayAndCelebrate);
} else {
  tryAutoplayAndCelebrate();
}

// Sequentially reveal message lines with tiny hearts and confetti accents
function revealMessage(){
  const lines = Array.from(document.querySelectorAll('.message .line'));
  lines.forEach((el, idx) => {
    setTimeout(()=>{
      el.classList.add('show');
      // spawn a couple of small confetti and a heart near the element
      const r = el.getBoundingClientRect();
  // smaller accents on mobile
  const accCount = window.innerWidth <= 420 ? 3 : 6;
  const accForce = window.innerWidth <= 420 ? 1.8 : 3;
  burstConfetti(r.left + r.width/2, r.top + r.height/2, accCount, accForce);
      spawnHeart(r.left + r.width/2, r.top + r.height/2);
    }, 700 + idx * 520);
  });
}

function spawnHeart(x,y){
  const h = document.createElement('div');
  h.className = 'heart';
  h.style.left = x + 'px';
  h.style.top = y + 'px';
  document.body.appendChild(h);
  const dur = 1400 + Math.random()*600;
  h.animate([
    { transform: 'translate(-50%,-50%) scale(0.6)', opacity: 0 },
    { transform: 'translate(-50%,-120%) scale(1)', opacity: 1 },
    { transform: 'translate(-50%,-260%) scale(0.6)', opacity: 0 }
  ], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
  setTimeout(()=>h.remove(), dur + 80);
}

// Kick off reveal shortly after DOM ready
if(document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', ()=> setTimeout(revealMessage, 800));
} else {
  setTimeout(revealMessage, 800);
}

// Photo fallback: use name initial if image missing
function setupPhotoFallback(){
  const photo = document.getElementById('userPhoto');
  const fallback = document.getElementById('photoFallback');
  const nameEl = document.querySelector('.name');
  const initial = nameEl ? (nameEl.textContent.trim()[0]||'Q') : 'Q';
  if(fallback) fallback.querySelector('span').textContent = initial.toUpperCase();
  if(photo){
    // if image already failed to load, ensure fallback visible
    photo.addEventListener('error', ()=>{ if(fallback) fallback.style.display='flex'; photo.style.display='none'; });
    // if image loads, hide fallback
    photo.addEventListener('load', ()=>{ if(fallback) fallback.style.display='none'; photo.style.display='block'; });
  }
}

if(document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', setupPhotoFallback);
} else {
  setupPhotoFallback();
}
