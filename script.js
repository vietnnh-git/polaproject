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

// Music player
const audio   = document.getElementById('bgAudio');
const playBtn = document.getElementById('playBtn');
const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');

playBtn.addEventListener('click', () => {
  if (!audio.src || audio.src === window.location.href) return; // no track yet

  if (audio.paused) {
    audio.play();
    iconPlay.style.display  = 'none';
    iconPause.style.display = 'block';
    playBtn.classList.add('playing');
  } else {
    audio.pause();
    iconPlay.style.display  = 'block';
    iconPause.style.display = 'none';
    playBtn.classList.remove('playing');
  }
});

window.addEventListener('load', () => console.log('✦ PolaProject loaded!'));
