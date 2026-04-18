// ── Star Field ──
(function () {
  const canvas = document.getElementById('fireflies');
  const ctx    = canvas.getContext('2d');
  const STAR_COUNT = 200;
  const stars  = [];
  let   shootingStars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Star {
    constructor() { this.init(); }

    init() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.r     = Math.random() * 1.1 + 0.2;
      this.glow  = this.r * (3 + Math.random() * 5);
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.004 + Math.random() * 0.012;
      // 85% white-blue, 15% warm gold
      const cold = Math.random() > 0.15;
      this.hue   = cold ? (210 + Math.random() * 50) : (45 + Math.random() * 20);
      this.sat   = cold ? (20 + Math.random() * 45) : (80 + Math.random() * 15);
      this.lum   = 85 + Math.random() * 15;
    }

    update() {
      this.phase += this.speed;
    }

    draw() {
      const alpha = 0.25 + (Math.sin(this.phase) * 0.5 + 0.5) * 0.75;

      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glow);
      g.addColorStop(0,   `hsla(${this.hue},${this.sat}%,${this.lum}%,${alpha * 0.5})`);
      g.addColorStop(1,   `hsla(${this.hue},${this.sat}%,${this.lum}%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.glow, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},${this.sat}%,${this.lum}%,${alpha})`;
      ctx.fill();
    }
  }

  class ShootingStar {
    constructor() {
      this.x    = Math.random() * canvas.width * 0.75;
      this.y    = Math.random() * canvas.height * 0.45;
      const spd = 9 + Math.random() * 7;
      const ang = Math.PI / 5 + Math.random() * Math.PI / 5;
      this.vx   = Math.cos(ang) * spd;
      this.vy   = Math.sin(ang) * spd;
      this.life = 1;
      this.dead = false;
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.life -= 0.022;
      if (this.life <= 0) this.dead = true;
    }

    draw() {
      const tail = { x: this.x - this.vx * 9, y: this.y - this.vy * 9 };
      const g = ctx.createLinearGradient(tail.x, tail.y, this.x, this.y);
      g.addColorStop(0, `rgba(255,255,255,0)`);
      g.addColorStop(1, `rgba(220,210,255,${this.life * 0.9})`);
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = g;
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // bright head
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.life})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

  function launchShootingStar() {
    shootingStars.push(new ShootingStar());
    setTimeout(launchShootingStar, 3000 + Math.random() * 4000);
  }
  setTimeout(launchShootingStar, 1200 + Math.random() * 2000);

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.update(); s.draw(); });
    shootingStars.forEach(s => { s.update(); s.draw(); });
    shootingStars = shootingStars.filter(s => !s.dead);
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── Email form ──
document.getElementById('emailForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = this.querySelector('input[type="email"]');
  const btn   = this.querySelector('button');
  btn.textContent = '✓ Đã đăng ký!';
  btn.classList.add('success');
  input.value = '';
  setTimeout(() => {
    btn.innerHTML = '<span class="btn-shimmer"></span>Nhận thông báo';
    btn.classList.remove('success');
  }, 3000);
});

// ── Music player ──
const audio     = document.getElementById('bgAudio');
const playBtn   = document.getElementById('playBtn');
const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');

function setPlaying(state) {
  iconPlay.style.display  = state ? 'none'  : 'block';
  iconPause.style.display = state ? 'block' : 'none';
  playBtn.classList.toggle('playing', state);
}

audio.muted  = true;
audio.volume = 0.6;
audio.currentTime = 33;

audio.removeAttribute('loop');
audio.addEventListener('ended', () => {
  audio.currentTime = 33;
  audio.play().catch(() => {});
});

audio.play().then(() => {
  const unmute = () => {
    audio.muted = false;
    setPlaying(true);
  };
  document.addEventListener('click',     unmute, { once: true });
  document.addEventListener('touchstart', unmute, { once: true });
  document.addEventListener('keydown',   unmute, { once: true });
}).catch(() => {});

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.muted = false;
    audio.play();
    setPlaying(true);
  } else {
    audio.pause();
    setPlaying(false);
  }
});

// ── Spotlight ──
const card = document.querySelector('.card');
card.addEventListener('mousemove', (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
});
