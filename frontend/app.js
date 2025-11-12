/* file: frontend/app.js */

// Định nghĩa địa chỉ server
const API_URL = 'http://localhost:3000/api';

// === 1. Lấy các phần tử HTML ===
// (Lưu ý: chúng ta lấy 'start-container' để ẩn đi)
const startContainer = document.getElementById('start-container');
const interviewSection = document.getElementById('interview-section');

const startButton = document.getElementById('start-button');
const tokenInput = document.getElementById('token-input');
const nameInput = document.getElementById('name-input');
const startStatus = document.getElementById('start-status');
const videoPreview = document.getElementById('video-preview');
const themeToggle = document.getElementById('theme-toggle'); // Nút gạt theme

// === 2. Biến toàn cục ===
let sessionFolder = ''; // Lưu tên thư mục server trả về
let userName = '';
let token = '';

// === 3. Logic cho Dark/Light Mode ===
themeToggle.addEventListener('change', () => {
  // Thêm hoặc xóa class 'dark-mode' ra khỏi thẻ <body>
  document.body.classList.toggle('dark-mode');
});

// === 4. Logic cho Nút "Bắt đầu" ===
startButton.addEventListener('click', async () => {
  console.log('Nút bắt đầu đã được nhấn');
  
  // Lấy giá trị từ các ô input
  token = tokenInput.value;
  userName = nameInput.value;

  if (!token || !userName) {
    startStatus.textContent = 'Lỗi: Vui lòng nhập cả Token và Tên.';
    startStatus.style.color = 'red';
    return;
  }

  // Hiển thị trạng thái
  startStatus.textContent = 'Đang xác thực token...';
  startStatus.style.color = '#888'; // Màu xám

  try {
    // --- Bước 1: Gọi API verify-token ---
    const tokenRes = await fetch(`${API_URL}/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    });

    if (!tokenRes.ok) {
      // Token không hợp lệ
      throw new Error('Token không hợp lệ. Vui lòng kiểm tra lại.');
    }
    console.log('Token OK');
    startStatus.textContent = 'Đã xác thực. Đang bắt đầu phiên làm việc...';

    // --- Bước 2: Gọi API session/start ---
    const sessionRes = await fetch(`${API_URL}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, userName: userName })
    });

    const sessionData = await sessionRes.json();
    if (!sessionRes.ok || !sessionData.ok) {
      throw new Error(sessionData.message || 'Không thể bắt đầu phiên làm việc.');
    }

    // Lưu lại tên thư mục server trả về
    sessionFolder = sessionData.folder;
    console.log('Session OK, thư mục:', sessionFolder);
    
    // --- Bước 3: Ẩn Form, Hiện Camera ---
    startContainer.style.display = 'none'; // Ẩn card đăng nhập
    interviewSection.style.display = 'block'; // Hiện card phỏng vấn

    // --- Bước 4: Xin quyền Camera/Microphone ---
    await setupCamera();

  } catch (error) {
    console.error('Lỗi ở bước bắt đầu:', error);
    startStatus.textContent = `Lỗi: ${error.message}`;
    startStatus.style.color = 'red';
  }
});

// === 5. Logic xin quyền Camera ===
async function setupCamera() {
  console.log('Đang xin quyền camera...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true // Xin cả quyền audio
    });
    
    // Hiển thị video preview lên thẻ <video>
    videoPreview.srcObject = stream;
    
    // (Chúng ta sẽ khởi tạo MediaRecorder ở bước sau)

  } catch (err) {
    console.error('Lỗi khi lấy camera/mic:', err);
    alert('Lỗi: Không thể truy cập camera hoặc microphone. Vui lòng cấp quyền để tiếp tục.');
  }
}