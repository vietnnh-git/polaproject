document.getElementById('emailForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const input = this.querySelector('input[type="email"]');
  const btn   = this.querySelector('button');
  const email = input.value;

  btn.textContent = '✓ Đã đăng ký!';
  btn.classList.add('success');
  input.value = '';

  setTimeout(() => {
    btn.textContent = 'Nhận thông báo';
    btn.classList.remove('success');
  }, 3000);

  console.log('Email đăng ký:', email);
});

window.addEventListener('load', () => console.log('🚀 PolaProject loaded!'));
