/* file: backend/server.js */
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Thư viện 'File System' để làm việc với thư mục
const path = require('path'); // Thư viện 'Path' để xử lý đường dẫn

const app = express();
const PORT = 3000;

// --- Setup ---
app.use(cors()); // Cho phép frontend gọi
app.use(express.json()); // Cho phép server đọc JSON

// --- Tạo thư mục 'uploads' nếu nó chưa tồn tại ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// === API ENDPOINTS ===

// 1. POST /api/verify-token [cite: 39]
// Giả lập: Token hợp lệ là "12345"
app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  console.log('Đã nhận token:', token);

  if (token === '12345') {
    res.status(200).json({ ok: true, message: 'Token hợp lệ' });
  } else {
    res.status(401).json({ ok: false, message: 'Token không hợp lệ' });
  }
});

// 2. POST /api/session/start [cite: 40]
app.post('/api/session/start', (req, res) => {
  try {
    const { token, userName } = req.body;

    // (Thực tế nên kiểm tra lại token ở đây)

    // Tạo tên thư mục theo yêu cầu [cite: 10]
    // (Chúng ta sẽ bỏ qua timezone Asia/Bangkok cho đơn giản ở bước này)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_'); // Format đơn giản: YYYY-MM-DD_HH-mm-ss
    
    // Sanitize userName (làm sạch tên) [cite: 28]
    const safeUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const folderName = `${dateStr}_${safeUserName}`;
    const sessionPath = path.join(uploadsDir, folderName);

    // Tạo thư mục
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath);
      console.log('Đã tạo thư mục:', sessionPath);
    }

    // Trả về tên thư mục cho client [cite: 41]
    res.status(200).json({ ok: true, folder: folderName });

  } catch (error) {
    console.error('Lỗi khi bắt đầu session:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// 3. POST /api/upload-one (sẽ làm ở bước sau)
app.post('/api/upload-one', (req, res) => {
  res.status(501).json({ message: 'Chưa làm' });
});

// 4. POST /api/session/finish (sẽ làm ở bước sau)
app.post('/api/session/finish', (req, res) => {
  res.status(501).json({ message: 'Chưa làm' });
});

// --- Khởi động server ---
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});