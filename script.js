// ── Firefly forest ──
(function () {
  const canvas = document.getElementById('fireflies');
  const ctx    = canvas.getContext('2d');
  const COUNT  = 70;
  const flies  = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Firefly {
    constructor() { this.init(); }

    init() {
      this.x      = Math.random() * canvas.width;
      this.y      = Math.random() * canvas.height;
      this.vx     = (Math.random() - 0.5) * 0.35;
      this.vy     = (Math.random() - 0.5) * 0.35;
      this.r      = Math.random() * 1.8 + 0.8;       // core radius
      this.glow   = this.r * (5 + Math.random() * 5); // glow radius
      this.phase  = Math.random() * Math.PI * 2;
      this.speed  = 0.018 + Math.random() * 0.025;
      // golden-yellow to yellow-green hue
      this.hue    = 48 + Math.random() * 30;
      this.sat    = 90 + Math.random() * 10;
    }

    update() {
      this.phase += this.speed;
      // gentle random drift
      this.vx += (Math.random() - 0.5) * 0.018;
      this.vy += (Math.random() - 0.5) * 0.018;
      const max = 0.5;
      this.vx = Math.max(-max, Math.min(max, this.vx));
      this.vy = Math.max(-max, Math.min(max, this.vy));
      this.x += this.vx;
      this.y += this.vy;
      // wrap around
      if (this.x < -20)              this.x = canvas.width  + 20;
      if (this.x > canvas.width + 20) this.x = -20;
      if (this.y < -20)               this.y = canvas.height + 20;
      if (this.y > canvas.height + 20) this.y = -20;
    }

    draw() {
      const alpha = (Math.sin(this.phase) * 0.5 + 0.5); // 0..1
      if (alpha < 0.04) return;

      // outer glow
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glow);
      g.addColorStop(0,   `hsla(${this.hue},${this.sat}%,72%,${alpha * 0.65})`);
      g.addColorStop(0.35,`hsla(${this.hue},${this.sat}%,60%,${alpha * 0.28})`);
      g.addColorStop(1,   `hsla(${this.hue},${this.sat}%,50%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.glow, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // bright core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},100%,92%,${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) flies.push(new Firefly());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flies.forEach(f => { f.update(); f.draw(); });
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
