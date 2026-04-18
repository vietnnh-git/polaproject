// ── Star Field — 3 tier: tiny / medium / large ──
(function () {
  const canvas = document.getElementById('fireflies');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Star class — tier controls size, brightness, behaviour ──
  class Star {
    constructor(tier) {
      this.tier = tier;
      this.reset();
    }

    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.phase = Math.random() * Math.PI * 2;

      if (this.tier === 'tiny') {
        this.r        = Math.random() * 0.30 + 0.08;
        this.glow     = this.r * 3;
        this.speed    = 0.003 + Math.random() * 0.007;
        this.maxAlpha = 0.10 + Math.random() * 0.22;
      } else if (this.tier === 'medium') {
        this.r        = Math.random() * 0.65 + 0.32;
        this.glow     = this.r * 4.5;
        this.speed    = 0.005 + Math.random() * 0.014;
        this.maxAlpha = 0.28 + Math.random() * 0.48;
      } else {                                   // large
        this.r        = Math.random() * 0.80 + 1.10;
        this.glow     = this.r * 7;
        this.speed    = 0.004 + Math.random() * 0.009;
        this.maxAlpha = 0.60 + Math.random() * 0.40;
      }

      // 85% cool white-blue, 15% warm gold
      const cold = Math.random() > 0.15;
      this.hue = cold ? 210 + Math.random() * 50 : 44 + Math.random() * 18;
      this.sat = cold ? 18  + Math.random() * 42  : 75 + Math.random() * 20;
      this.lum = 86 + Math.random() * 14;
    }

    update() { this.phase += this.speed; }

    draw() {
      const alpha = (Math.sin(this.phase) * 0.5 + 0.5) * this.maxAlpha;
      if (alpha < 0.012) return;

      const col = `${this.hue},${this.sat}%,${this.lum}%`;

      // Hào quang
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glow);
      g.addColorStop(0,   `hsla(${col},${(alpha * 0.55).toFixed(3)})`);
      g.addColorStop(0.4, `hsla(${col},${(alpha * 0.18).toFixed(3)})`);
      g.addColorStop(1,   `hsla(${col},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.glow, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Lõi sao
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${col},${Math.min(alpha * 1.9, 1).toFixed(3)})`;
      ctx.fill();

      // Tia chữ thập — chỉ sao lớn, chỉ khi đủ sáng
      if (this.tier === 'large' && alpha > 0.38) {
        const t      = (alpha - 0.38) * 1.6;
        const hRay   = this.glow * 3.0;
        const vRay   = this.glow * 1.8;

        ctx.save();
        ctx.globalAlpha = t * 0.48;

        const gH = ctx.createLinearGradient(this.x - hRay, this.y, this.x + hRay, this.y);
        gH.addColorStop(0,   'transparent');
        gH.addColorStop(0.5, `hsla(${col},1)`);
        gH.addColorStop(1,   'transparent');
        ctx.fillStyle = gH;
        ctx.fillRect(this.x - hRay, this.y - 1.3, hRay * 2, 2.6);

        const gV = ctx.createLinearGradient(this.x, this.y - vRay, this.x, this.y + vRay);
        gV.addColorStop(0,   'transparent');
        gV.addColorStop(0.5, `hsla(${col},1)`);
        gV.addColorStop(1,   'transparent');
        ctx.fillStyle = gV;
        ctx.fillRect(this.x - 1.3, this.y - vRay, 2.6, vRay * 2);

        ctx.restore();
      }
    }
  }

  // Khởi tạo 3 tier
  const stars = [
    ...Array.from({ length: 155 }, () => new Star('tiny')),
    ...Array.from({ length:  42 }, () => new Star('medium')),
    ...Array.from({ length:  12 }, () => new Star('large')),
  ];

  // ── Shooting Stars — cải thiện ──
  let shooters   = [];
  let nextShoot  = Date.now() + 1500 + Math.random() * 2000;

  class ShootingStar {
    constructor() {
      // Spawn rộng hơn: bất kỳ đâu trong 80% trên-trái màn hình
      this.x = Math.random() * canvas.width  * 0.82;
      this.y = Math.random() * canvas.height * 0.50;

      // Góc: 28°–52° (đa dạng hơn trước)
      const ang     = Math.PI * (28 + Math.random() * 24) / 180;
      const spd     = 11 + Math.random() * 10;
      this.vx       = Math.cos(ang) * spd;
      this.vy       = Math.sin(ang) * spd;
      this.tailLen  = 85 + Math.random() * 130;
      this.width    = 0.9 + Math.random() * 1.1;
      this.alpha    = 0;
      this.maxAlpha = 0.55 + Math.random() * 0.45;
      this.alive    = true;

      // Màu: trắng-xanh thiên hà
      const pal = [[255,255,255],[225,235,255],[205,218,255],[215,205,255]];
      this.rgb = pal[Math.floor(Math.random() * pal.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Fade in nhanh
      this.alpha = Math.min(this.alpha + 0.11, this.maxAlpha);

      // Fade out gần mép màn hình
      const edge = Math.min(canvas.width - this.x, canvas.height - this.y, this.x + 40);
      if (edge < 140) this.alpha *= edge / 140;

      if (this.x > canvas.width + 30 || this.y > canvas.height + 30 || this.alpha < 0.008)
        this.alive = false;
    }

    draw() {
      if (this.alpha < 0.008) return;
      const [r, g, b] = this.rgb;
      const spd  = Math.hypot(this.vx, this.vy);
      const tx   = this.x - (this.vx / spd) * this.tailLen;
      const ty   = this.y - (this.vy / spd) * this.tailLen;

      // Đuôi gradient — mờ dần về phía sau
      const tail = ctx.createLinearGradient(this.x, this.y, tx, ty);
      tail.addColorStop(0,    `rgba(${r},${g},${b},${this.alpha})`);
      tail.addColorStop(0.28, `rgba(${r},${g},${b},${(this.alpha * 0.45).toFixed(3)})`);
      tail.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = tail;
      ctx.lineWidth   = this.width;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Hào quang đầu sao
      const gl = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 9);
      gl.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha})`);
      gl.addColorStop(0.4, `rgba(${r},${g},${b},${(this.alpha * 0.32).toFixed(3)})`);
      gl.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = gl;
      ctx.fill();

      // Lõi trắng sáng
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(this.alpha * 1.6, 1).toFixed(3)})`;
      ctx.fill();
    }
  }

  function spawnShooters() {
    if (document.hidden) { nextShoot = Date.now() + 2000; return; }
    // 50% → 1, 35% → 2, 15% → 3 cùng lúc
    const roll  = Math.random();
    const count = roll < 0.50 ? 1 : roll < 0.85 ? 2 : 3;
    for (let i = 0; i < count; i++) {
      setTimeout(() => shooters.push(new ShootingStar()), i * (140 + Math.random() * 260));
    }
    nextShoot = Date.now() + 2200 + Math.random() * 3800;
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => { s.update(); s.draw(); });

    if (Date.now() >= nextShoot) spawnShooters();
    for (let i = shooters.length - 1; i >= 0; i--) {
      shooters[i].update();
      shooters[i].draw();
      if (!shooters[i].alive) shooters.splice(i, 1);
    }

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
