// Email form
document.getElementById('emailForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = this.querySelector('input[type="email"]');
  const btn   = this.querySelector('button');
  const email = input.value;

  btn.textContent = '✓ Đã đăng ký!';
  btn.classList.add('success');
  input.value = '';

  setTimeout(() => {
    btn.innerHTML = '<span class="btn-shimmer"></span>Nhận thông báo';
    btn.classList.remove('success');
  }, 3000);

  console.log('Email đăng ký:', email);
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

// Autoplay: muted first (browsers always allow) → unmute on first interaction
audio.muted  = true;
audio.volume = 0.6;
audio.play().then(() => {
  // Playing muted — unmute on first user gesture anywhere on page
  const unmute = () => {
    audio.muted = false;
    setPlaying(true);
    document.removeEventListener('click',     unmute);
    document.removeEventListener('touchstart', unmute);
    document.removeEventListener('keydown',   unmute);
  };
  document.addEventListener('click',     unmute, { once: true });
  document.addEventListener('touchstart', unmute, { once: true });
  document.addEventListener('keydown',   unmute, { once: true });
}).catch(() => {
  // Autoplay fully blocked — wait for manual play button
});

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

// ── Spotlight — mouse-follow light beam ──
const card = document.querySelector('.card');
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  card.style.setProperty('--my', `${e.clientY - rect.top}px`);
});

window.addEventListener('load', () => console.log('✦ Pola Project loaded!'));
