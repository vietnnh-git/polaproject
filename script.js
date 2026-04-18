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

  // ── Card border glow — additive: mỗi sao gần card tạo 1 điểm sáng riêng ──
  const cardEl = document.querySelector('.card');
  const glowEl = document.getElementById('cardStarGlow');

  function closestBorderPoint(px, py, rect) {
    const inside = px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
    if (!inside) {
      return {
        x: Math.max(rect.left, Math.min(px, rect.right)),
        y: Math.max(rect.top,  Math.min(py, rect.bottom))
      };
    }
    const dL = px - rect.left, dR = rect.right - px;
    const dT = py - rect.top,  dB = rect.bottom - py;
    const m  = Math.min(dL, dR, dT, dB);
    if (m === dL) return { x: rect.left,  y: py };
    if (m === dR) return { x: rect.right, y: py };
    if (m === dT) return { x: px, y: rect.top };
                  return { x: px, y: rect.bottom };
  }

  function updateCardGlow() {
    const rect   = cardEl.getBoundingClientRect();
    const MARGIN = 65;

    // Tính contribution của mỗi sao gần card
    const contribs = [];
    shooters.forEach(s => {
      if (!s.alive) return;
      const dx = Math.max(0, rect.left - s.x, s.x - rect.right);
      const dy = Math.max(0, rect.top  - s.y, s.y - rect.bottom);
      const d  = Math.hypot(dx, dy);
      if (d < MARGIN) {
        const pt = closestBorderPoint(s.x, s.y, rect);
        contribs.push({
          lx: pt.x - (rect.left - 1),
          ly: pt.y - (rect.top  - 1),
          t:  1 - d / MARGIN          // intensity: 0→1 khi d: MARGIN→0
        });
      }
    });

    glowEl.style.left   = `${rect.left  - 1}px`;
    glowEl.style.top    = `${rect.top   - 1}px`;
    glowEl.style.width  = `${rect.width + 2}px`;
    glowEl.style.height = `${rect.height + 2}px`;

    if (contribs.length === 0) {
      glowEl.style.opacity = 0;
      return;
    }

    // Mỗi sao → 1 radial-gradient tại điểm viền gần nhất với nó
    glowEl.style.background = contribs.map(c =>
      `radial-gradient(circle 65px at ${c.lx.toFixed(1)}px ${c.ly.toFixed(1)}px,` +
      `rgba(215,238,255,${c.t.toFixed(3)}),` +
      `rgba(175,215,255,${(c.t * 0.55).toFixed(3)}) 38%,transparent 68%)`
    ).join(',');
    glowEl.style.opacity = 1;
  }

  // ── Shooting Stars — cải thiện ──
  let shooters   = [];
  let nextShoot  = Date.now() + 1500 + Math.random() * 2000;

  class ShootingStar {
    constructor() {
      // Spawn từ rìa màn hình — 60% từ trên, 40% từ trái
      const ang = Math.PI * (28 + Math.random() * 24) / 180;
      if (Math.random() < 0.60) {
        // Từ rìa trên
        this.x = Math.random() * canvas.width * 0.85;
        this.y = -10;
      } else {
        // Từ rìa trái
        this.x = -10;
        this.y = Math.random() * canvas.height * 0.60;
      }

      const spd     = 4 + Math.random() * 4;
      this.vx       = Math.cos(ang) * spd;
      this.vy       = Math.sin(ang) * spd;
      this.tailLen  = 200 + Math.random() * 200;   // dài hơn — sao chổi
      this.width    = 0.35 + Math.random() * 0.45; // mỏng hơn nhiều
      this.alpha    = 0;
      this.maxAlpha = 0.50 + Math.random() * 0.35;
      this.alive    = true;
      this.traveled = 0; // để fade-in theo khoảng cách đi được

      // Màu: trắng-xanh lạnh thiên hà
      const pal = [[255,255,255],[225,235,255],[205,218,255],[210,228,255]];
      this.rgb = pal[Math.floor(Math.random() * pal.length)];
    }

    update() {
      this.x        += this.vx;
      this.y        += this.vy;
      this.traveled += Math.hypot(this.vx, this.vy);

      // Fade in trong 120px đầu kể từ rìa màn hình
      const fadeIn  = Math.min(this.traveled / 120, 1);

      // Fade out khi gần rìa phải / rìa dưới
      const toRight  = canvas.width  - this.x;
      const toBottom = canvas.height - this.y;
      const fadeOut  = Math.max(0, Math.min(toRight, toBottom, 180) / 180);

      this.alpha = this.maxAlpha * fadeIn * fadeOut;

      if (this.x > canvas.width + 20 || this.y > canvas.height + 20)
        this.alive = false;
    }

    draw() {
      if (this.alpha < 0.006) return;
      const [r, g, b] = this.rgb;
      const spd   = Math.hypot(this.vx, this.vy);
      const dirX  = this.vx / spd, dirY = this.vy / spd;
      const perpX = -dirY,  perpY = dirX;
      const tailX = this.x - dirX * this.tailLen;
      const tailY = this.y - dirY * this.tailLen;
      const hw    = this.width; // bán chiều rộng lõi (mỏng)

      // ── Motion blur: 3 lớp ghost mờ dần phía sau ──
      for (let i = 3; i >= 1; i--) {
        const gAlpha = this.alpha * (0.07 * (4 - i)); // 0.07, 0.14, 0.21 → nhẹ
        const ox = -dirX * i * 5;
        const oy = -dirY * i * 5;
        const gbGrad = ctx.createLinearGradient(
          this.x + ox, this.y + oy,
          tailX  + ox, tailY  + oy
        );
        gbGrad.addColorStop(0, `rgba(${r},${g},${b},${gAlpha.toFixed(3)})`);
        gbGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.moveTo((this.x + ox) + perpX * hw * 2, (this.y + oy) + perpY * hw * 2);
        ctx.lineTo(tailX + ox, tailY + oy);
        ctx.lineTo((this.x + ox) - perpX * hw * 2, (this.y + oy) - perpY * hw * 2);
        ctx.closePath();
        ctx.fillStyle = gbGrad;
        ctx.fill();
      }

      // ── Lớp hào quang mềm bên ngoài ──
      const outerGrad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      outerGrad.addColorStop(0,   `rgba(${r},${g},${b},${(this.alpha * 0.18).toFixed(3)})`);
      outerGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.moveTo(this.x + perpX * hw * 4, this.y + perpY * hw * 4);
      ctx.lineTo(tailX, tailY);
      ctx.lineTo(this.x - perpX * hw * 4, this.y - perpY * hw * 4);
      ctx.closePath();
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // ── Lõi sắc nét — thuôn từ đầu → đuôi ──
      const coreGrad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      coreGrad.addColorStop(0,    `rgba(${r},${g},${b},${this.alpha.toFixed(3)})`);
      coreGrad.addColorStop(0.40, `rgba(${r},${g},${b},${(this.alpha * 0.50).toFixed(3)})`);
      coreGrad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.moveTo(this.x + perpX * hw, this.y + perpY * hw);
      ctx.lineTo(tailX, tailY);
      ctx.lineTo(this.x - perpX * hw, this.y - perpY * hw);
      ctx.closePath();
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── Hào quang đầu sao — nhỏ và chặt ──
      const headR = hw * 5;
      const gl    = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, headR);
      gl.addColorStop(0,    `rgba(${r},${g},${b},${this.alpha.toFixed(3)})`);
      gl.addColorStop(0.40, `rgba(${r},${g},${b},${(this.alpha * 0.28).toFixed(3)})`);
      gl.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, headR, 0, Math.PI * 2);
      ctx.fillStyle = gl;
      ctx.fill();

      // ── Hạt nhân trắng cực nhỏ ──
      ctx.beginPath();
      ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(this.alpha * 2.2, 1).toFixed(3)})`;
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

    updateCardGlow();

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
