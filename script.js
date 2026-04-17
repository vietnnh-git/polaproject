// Xử lý form đăng ký email
document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value;
    const button = this.querySelector('button');
    
    // Thay đổi text button
    const originalText = button.textContent;
    button.textContent = '✓ Đã lưu!';
    button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    // Xóa input
    emailInput.value = '';
    
    // Quay lại bình thường sau 2 giây
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 2000);
    
    // Log email (có thể gửi lên server sau)
    console.log('Email đăng ký:', email);
});

// Thêm animation khi page load
window.addEventListener('load', function() {
    console.log('🚀 PolaProject banner loaded!');
});
