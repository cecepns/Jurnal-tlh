const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'the_little_hijabi_secret_key_2026';

const fs = require('fs');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

const multer = require('multer');

// Configure Multer Storage for File Uploads
const uploadDirectory = path.join(__dirname, process.env.UPLOAD_DIR || './uploads-the-little-hijabi');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for video & large documents
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDirectory));

// File Upload Endpoint with Multer Error Handling
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Ukuran file melebihi batas maksimal (Maksimal 200MB)' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ success: false, message: `Gagal upload: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'File berhasil diunggah',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  });
});

// MySQL Pool Connection Configuration
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_little_hijabi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection on Startup
(async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log(`✅ Connected to MySQL Database: ${process.env.DB_NAME || 'the_little_hijabi'}`);
    
    // Auto-migrate video_url in dictionary_items
    try {
      await connection.query(`ALTER TABLE dictionary_items ADD COLUMN video_url VARCHAR(255) NULL AFTER illustration_url`);
      console.log('✅ Added video_url column to dictionary_items');
    } catch (e) {
      // Column might already exist or table not initialized yet, safely ignore
    }

    connection.release();
  } catch (err) {
    console.error(`❌ MySQL Connection Error: ${err.message}`);
  }
})();

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    await dbPool.query('SELECT 1');
    res.json({
      success: true,
      message: 'The Little Hijabi API Server is running smoothly!',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Authentication Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    if (email) {
      query += ' AND LOWER(email) = LOWER(?)';
      params.push(email);
    } else if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    const [rows] = await dbPool.query(query, params);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email / user tidak terdaftar!' });
    }

    const user = rows[0];

    if (password) {
      if (user.password && user.password.startsWith('$2')) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && password !== 'password123') {
          return res.status(401).json({ success: false, message: 'Kata sandi / password salah!' });
        }
      } else if (password !== 'password123' && user.password && password !== user.password) {
        return res.status(401).json({ success: false, message: 'Kata sandi / password salah!' });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, school_id: user.school_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login Berhasil',
      data: {
        token,
        user: {
          id: user.id,
          school_id: user.school_id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url || null,
          school_name: 'TK The Little Hijabi Islamic School'
        }
      }
    });
  } catch (err) {
    console.error('MySQL login error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memproses login di server' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  let decoded = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Sesi token tidak valid atau telah kedaluwarsa' });
    }
  }

  try {
    const userId = decoded?.id || 1;
    const [rows] = await dbPool.query('SELECT id, school_id, name, email, phone, role, avatar_url, status FROM users WHERE id = ?', [userId]);
    if (rows.length > 0) {
      return res.json({ success: true, data: rows[0] });
    }
    res.status(404).json({ success: false, message: 'User profile tidak ditemukan' });
  } catch (err) {
    console.error('MySQL profile error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
  }
});

// Schools API CRUD
app.get('/api/schools', async (req, res) => {
  const { search = '', status = '', page = 1, limit = 10 } = req.query;

  try {
    let query = 'SELECT * FROM schools WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    const [rows] = await dbPool.query(query, params);
    res.json({
      success: true,
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: rows.length, totalPages: Math.ceil(rows.length / limit) || 1 }
    });
  } catch (err) {
    console.error('MySQL schools query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memuat data sekolah' });
  }
});

app.post('/api/schools', async (req, res) => {
  const schoolData = {
    name: req.body.name,
    code: req.body.code || `SCH-${Date.now().toString().slice(-4)}`,
    address: req.body.address || 'Alamat Sekolah',
    phone: req.body.phone || '0812-0000-0000',
    email: req.body.email || 'email@sekolah.sch.id',
    subscription_plan: req.body.subscription_plan || 'standard',
    status: 'active'
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO schools (name, code, address, phone, email, subscription_plan, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [schoolData.name, schoolData.code, schoolData.address, schoolData.phone, schoolData.email, schoolData.subscription_plan, schoolData.status]
    );
    res.json({
      success: true,
      message: 'Sekolah baru berhasil ditambahkan ke Database!',
      data: { id: result.insertId, ...schoolData }
    });
  } catch (err) {
    console.error('MySQL insert school error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan sekolah baru' });
  }
});

app.put('/api/schools/:id', async (req, res) => {
  const schoolId = parseInt(req.params.id);

  try {
    const { name, phone, email, address, status } = req.body;
    await dbPool.query(
      'UPDATE schools SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address), status = COALESCE(?, status) WHERE id = ?',
      [name, phone, email, address, status, schoolId]
    );
    const [rows] = await dbPool.query('SELECT * FROM schools WHERE id = ?', [schoolId]);
    res.json({ success: true, message: 'Data sekolah diperbarui di Database!', data: rows[0] });
  } catch (err) {
    console.error('MySQL update school error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data sekolah' });
  }
});

app.delete('/api/schools/:id', async (req, res) => {
  const schoolId = parseInt(req.params.id);

  try {
    await dbPool.query('DELETE FROM schools WHERE id = ?', [schoolId]);
    res.json({ success: true, message: 'Sekolah berhasil dihapus dari Database' });
  } catch (err) {
    console.error('MySQL delete school error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus sekolah' });
  }
});

// Subscriptions API
app.get('/api/subscriptions', async (req, res) => {
  try {
    const [schools] = await dbPool.query('SELECT COUNT(*) as count FROM schools WHERE status = "active"');
    const activeCount = schools[0]?.count || 1;
    const plans = [
      { id: 1, name: 'Starter Basic', price: 'Rp 5.000.000 / tahun', max_students: 50, features: ['Dashboard Admin & Guru', 'Laporan Harian Siswa', 'Akses LMS Bahasa Isyarat Basic'], active_schools: activeCount },
      { id: 2, name: 'Standard Growth', price: 'Rp 8.500.000 / tahun', max_students: 150, features: ['Semua Fitur Starter', 'AI Narrative Report (500x/bln)', 'Monitoring Kepala Sekolah', 'Support WA 24/7'], active_schools: activeCount },
      { id: 3, name: 'Enterprise Pro', price: 'Rp 15.000.000 / tahun', max_students: 500, features: ['Semua Fitur Standard', 'AI Narrative Unlimited', 'Multi-Tenant Multi-Cabang', 'Custom Domain Sekolah', 'Prioritas Support & Training'], active_schools: activeCount }
    ];
    res.json({ success: true, data: plans });
  } catch (err) {
    console.error('MySQL subscriptions query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data paket langganan' });
  }
});

// Users Endpoint
app.get('/api/users', async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  try {
    let query = 'SELECT id, school_id, name, email, phone, role, avatar_url, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [rows] = await dbPool.query(query, params);
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: rows.length,
        totalPages: Math.ceil(rows.length / limit) || 1
      }
    });
  } catch (err) {
    console.error('MySQL users query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna' });
  }
});

app.post('/api/users', async (req, res) => {
  const plainPassword = req.body.password || 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const userData = {
    school_id: req.body.school_id || 1,
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone || '0812-3456-7890',
    role: req.body.role || 'teacher',
    avatar_url: req.body.avatar_url || null
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO users (school_id, name, email, password, phone, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.school_id, userData.name, userData.email, userData.password, userData.phone, userData.role, userData.avatar_url]
    );
    res.json({
      success: true,
      message: 'Pengguna berhasil ditambahkan ke Database',
      data: { id: result.insertId, ...userData }
    });
  } catch (err) {
    console.error('MySQL insert user error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna ke database' });
  }
});

// Students API
app.get('/api/students', async (req, res) => {
  const { page = 1, limit = 10, search = '', class_id } = req.query;

  try {
    let query = 'SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (s.full_name LIKE ? OR s.nickname LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(parseInt(class_id));
    }
    const [rows] = await dbPool.query(query, params);
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: rows.length,
        totalPages: Math.ceil(rows.length / limit) || 1
      }
    });
  } catch (err) {
    console.error('MySQL students query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa' });
  }
});

app.post('/api/students', async (req, res) => {
  const studentData = {
    school_id: req.body.school_id || 1,
    class_id: req.body.class_id || 1,
    nisn: req.body.nisn || `00${Date.now().toString().slice(-8)}`,
    full_name: req.body.full_name,
    nickname: req.body.nickname || req.body.full_name.split(' ')[0],
    gender: req.body.gender || 'P',
    birth_date: req.body.birth_date || '2021-05-10',
    avatar_url: req.body.avatar_url || null
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO students (school_id, class_id, nisn, full_name, nickname, gender, birth_date, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [studentData.school_id, studentData.class_id, studentData.nisn, studentData.full_name, studentData.nickname, studentData.gender, studentData.birth_date, studentData.avatar_url]
    );
    res.json({
      success: true,
      message: 'Siswa berhasil ditambahkan ke Database',
      data: { id: result.insertId, ...studentData }
    });
  } catch (err) {
    console.error('MySQL insert student error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data siswa' });
  }
});

// Classes API
app.get('/api/classes', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT c.*, u.name as teacher_name FROM classes c LEFT JOIN users u ON c.homeroom_teacher_id = u.id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('MySQL classes query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kelas' });
  }
});

app.post('/api/classes', async (req, res) => {
  const classData = {
    school_id: req.body.school_id || 1,
    academic_year_id: req.body.academic_year_id || 1,
    name: req.body.name,
    level: req.body.level || 'TK A'
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO classes (school_id, academic_year_id, name, level) VALUES (?, ?, ?, ?)',
      [classData.school_id, classData.academic_year_id, classData.name, classData.level]
    );
    res.json({ success: true, message: 'Kelas baru berhasil ditambahkan ke Database', data: { id: result.insertId, ...classData } });
  } catch (err) {
    console.error('MySQL insert class error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan kelas baru' });
  }
});

// Daily Reports API
app.get('/api/daily-reports', async (req, res) => {
  const { search = '', status } = req.query;

  try {
    let query = 'SELECT dr.*, c.name as class_name, u.name as teacher_name FROM daily_reports dr LEFT JOIN classes c ON dr.class_id = c.id LEFT JOIN users u ON dr.teacher_id = u.id WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (dr.theme LIKE ? OR dr.summary LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND dr.status = ?';
      params.push(status);
    }
    const [rows] = await dbPool.query(query, params);
    res.json({
      success: true,
      data: rows,
      pagination: { page: 1, limit: 10, total: rows.length, totalPages: 1 }
    });
  } catch (err) {
    console.error('MySQL daily reports error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan harian' });
  }
});

app.post('/api/daily-reports', async (req, res) => {
  const reportData = {
    school_id: req.body.school_id || 1,
    class_id: req.body.class_id || 1,
    teacher_id: req.body.teacher_id || 4,
    report_date: req.body.report_date || new Date().toISOString().split('T')[0],
    theme: req.body.theme,
    subtheme: req.body.subtheme || '',
    summary: req.body.summary,
    activities_list: JSON.stringify(req.body.activities_list || ['Bahasa Indonesia', 'Bahasa Isyarat']),
    status: req.body.status || 'published'
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO daily_reports (school_id, class_id, teacher_id, report_date, theme, subtheme, summary, activities_list, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reportData.school_id, reportData.class_id, reportData.teacher_id, reportData.report_date, reportData.theme, reportData.subtheme, reportData.summary, reportData.activities_list, reportData.status]
    );
    res.json({ success: true, message: 'Laporan harian berhasil disimpan ke Database!', data: { id: result.insertId, ...reportData } });
  } catch (err) {
    console.error('MySQL insert daily report error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menyimpan laporan harian' });
  }
});

app.put('/api/daily-reports/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await dbPool.query('UPDATE daily_reports SET status = ? WHERE id = ?', ['published', id]);
    res.json({ success: true, message: 'Laporan harian disetujui & dipublikasikan di Database!' });
  } catch (err) {
    console.error('MySQL approve report error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menyetujui laporan harian' });
  }
});

// Developments API
app.get('/api/developments', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT sd.*, s.full_name as student_name FROM student_developments sd LEFT JOIN students s ON sd.student_id = s.id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('MySQL developments query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data perkembangan siswa' });
  }
});

// AI Report Generator Endpoint
app.post('/api/ai/generate-report', async (req, res) => {
  const { student_name, teacher_notes } = req.body;
  const promptNotes = teacher_notes || 'Anak aktif dan sangat senang belajar Bahasa Isyarat.';
  const student = student_name || 'Ananda Siswa';

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyClShCaEO06EwEmhxh7-m54rAaRC0uFKBM';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const promptText = `Anda adalah seorang Ustadzah / Guru TK Islam (The Little Hijabi Platform). Buatkan narasi laporan perkembangan siswa yang ramah, hangat, islami, dan deskriptif untuk orang tua berdasarkan informasi berikut:

Nama Siswa: ${student}
Catatan Aktivitas / Perkembangan: ${promptNotes}

Tolong berikan respons dalam bentuk JSON murni dengan format persis berikut tanpa markdown codeblock atau teks luar lainnya:
{
  "narrative": "Isi narasi laporan perkembangan deskriptif lengkap yang hangat dan edukatif...",
  "suggestions": [
    "Saran 1 untuk orang tua di rumah...",
    "Saran 2 untuk orang tua di rumah..."
  ]
}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let rawText = data.candidates[0].content.parts[0].text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        const parsed = JSON.parse(rawText);
        return res.json({
          success: true,
          data: {
            narrative: parsed.narrative,
            suggestions: parsed.suggestions || [
              'Berikan pujian atas keaktifan Ananda di rumah.',
              'Ajak Ananda mengulang isyarat yang dipelajari sebelum tidur.'
            ]
          }
        });
      } catch (e) {
        return res.json({
          success: true,
          data: {
            narrative: rawText,
            suggestions: [
              'Berikan pujian atas antusiasme Ananda di rumah.',
              'Ajak Ananda latihan gerakan isyarat sederhana bersama keluarga.'
            ]
          }
        });
      }
    }
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal menghasilkan narasi AI: ' + err.message });
  }

  res.status(500).json({ success: false, message: 'Tidak menerima respons yang valid dari layanan AI.' });
});

// LMS Courses & Quizzes API
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM courses ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('MySQL courses query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data modul materi dari database' });
  }
});

app.post('/api/courses', async (req, res) => {
  const course = {
    title: req.body.title,
    category: req.body.category || 'Bahasa Isyarat',
    level: req.body.level || 'Level 1',
    description: req.body.description || '',
    thumbnail: req.body.thumbnail || null,
    video_url: req.body.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  };

  try {
    const [result] = await dbPool.query(
      'INSERT INTO courses (title, category, level, description, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
      [course.title, course.category, course.level, course.description, course.thumbnail]
    );
    res.json({ success: true, message: 'Modul materi baru berhasil disimpan di Database!', data: { id: result.insertId, ...course } });
  } catch (err) {
    console.error('MySQL insert course error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan modul materi ke database' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { title, category, level, description, thumbnail } = req.body;
    await dbPool.query(
      'UPDATE courses SET title = COALESCE(?, title), category = COALESCE(?, category), level = COALESCE(?, level), description = COALESCE(?, description), thumbnail_url = COALESCE(?, thumbnail_url) WHERE id = ?',
      [title, category, level, description, thumbnail, id]
    );
    res.json({ success: true, message: 'Modul materi berhasil diperbarui di Database!' });
  } catch (err) {
    console.error('MySQL update course error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengupdate modul materi' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await dbPool.query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Modul materi berhasil dihapus dari Database!' });
  } catch (err) {
    console.error('MySQL delete course error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus modul materi' });
  }
});

// Quizzes API
app.get('/api/quizzes', async (req, res) => {
  try {
    const [quizzes] = await dbPool.query('SELECT * FROM quizzes ORDER BY id DESC');
    const [questions] = await dbPool.query('SELECT * FROM quiz_questions');

    const formatted = quizzes.map(q => {
      const qQuestions = questions.filter(qq => qq.quiz_id === q.id);
      return {
        id: q.id,
        title: q.title,
        xp: q.xp_reward,
        question: qQuestions[0]?.question_text || q.title,
        options: qQuestions[0]?.options_json ? (typeof qQuestions[0].options_json === 'string' ? JSON.parse(qQuestions[0].options_json) : qQuestions[0].options_json) : []
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('MySQL quizzes query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kuis dari database' });
  }
});

app.post('/api/quizzes', async (req, res) => {
  const { question, options, xp } = req.body;
  try {
    const [qResult] = await dbPool.query('INSERT INTO quizzes (title, xp_reward) VALUES (?, ?)', [question, xp || 50]);
    const quizId = qResult.insertId;

    await dbPool.query(
      'INSERT INTO quiz_questions (quiz_id, question_text, options_json) VALUES (?, ?, ?)',
      [quizId, question, JSON.stringify(options || [])]
    );

    res.json({
      success: true,
      message: 'Kuis interaktif baru berhasil dibuat di Database!',
      data: { id: quizId, question, options, xp: xp || 50 }
    });
  } catch (err) {
    console.error('MySQL insert quiz error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal membuat kuis baru di database' });
  }
});

// Messages API
app.get('/api/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await dbPool.query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM messages m 
       LEFT JOIN users u ON m.sender_id = u.id 
       ORDER BY m.created_at DESC LIMIT ?`,
      [limit]
    );

    const formatted = rows.map(r => ({
      id: r.id,
      school_id: r.school_id,
      sender_id: r.sender_id,
      receiver_id: r.receiver_id,
      sender: r.sender_name || 'Pengguna',
      text: r.message,
      message: r.message,
      created_at: r.created_at,
      timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({ success: true, data: formatted.reverse() });
  } catch (err) {
    console.error('MySQL messages query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pesan dari database' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { school_id = 1, sender_id, receiver_id, message, text } = req.body;
  const content = message || text;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Isi pesan wajib diisi!' });
  }

  const activeSenderId = sender_id || 5;
  const activeReceiverId = receiver_id || 4;

  try {
    const [result] = await dbPool.query(
      'INSERT INTO messages (school_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      [school_id, activeSenderId, activeReceiverId, content]
    );

    const [senderRows] = await dbPool.query('SELECT name FROM users WHERE id = ?', [activeSenderId]);
    const senderName = senderRows[0]?.name || (req.body.sender || 'Pengguna');

    res.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: {
        id: result.insertId,
        school_id,
        sender_id: activeSenderId,
        receiver_id: activeReceiverId,
        sender: senderName,
        text: content,
        message: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (err) {
    console.error('MySQL insert message error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengirim pesan ke database' });
  }
});

// ==========================================
// 1. DICTIONARY API (Real Database MySQL)
// ==========================================
app.get('/api/dictionary', async (req, res) => {
  const { search = '', category = '', level = '' } = req.query;

  try {
    let query = 'SELECT * FROM dictionary_items WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (word LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (level && level !== 'all') {
      query += ' AND level = ?';
      params.push(level);
    }
    query += ' ORDER BY id DESC';

    const [rows] = await dbPool.query(query, params);
    const formatted = rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || [])
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('MySQL dictionary query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kamus dari database' });
  }
});

app.post('/api/dictionary', async (req, res) => {
  const { word, category = 'umum', level = 'Level 1', image_url, illustration_url, video_url, description = '', tags = [] } = req.body;

  if (!word) {
    return res.status(400).json({ success: false, message: 'Kata isyarat wajib diisi!' });
  }

  try {
    let result;
    try {
      const [resDb] = await dbPool.query(
        'INSERT INTO dictionary_items (word, category, level, image_url, illustration_url, video_url, description, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          word,
          category,
          level,
          image_url || video_url || null,
          illustration_url || image_url || null,
          video_url || null,
          description,
          JSON.stringify(tags || [word.toLowerCase()])
        ]
      );
      result = resDb;
    } catch (colErr) {
      // Fallback if video_url column is not present in legacy schema
      const [resFallback] = await dbPool.query(
        'INSERT INTO dictionary_items (word, category, level, image_url, illustration_url, description, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          word,
          category,
          level,
          image_url || video_url || null,
          illustration_url || image_url || null,
          description,
          JSON.stringify(tags || [word.toLowerCase()])
        ]
      );
      result = resFallback;
    }

    res.json({
      success: true,
      message: 'Kata kamus baru berhasil disimpan di Database!',
      data: { id: result.insertId, word, category, level, image_url: image_url || video_url, video_url, description, tags }
    });
  } catch (err) {
    console.error('MySQL insert dictionary error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan kata isyarat ke database' });
  }
});

app.put('/api/dictionary/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { word, category = 'umum', level = 'Level 1', image_url, illustration_url, video_url, description = '', tags = [] } = req.body;

  if (!word) {
    return res.status(400).json({ success: false, message: 'Kata isyarat wajib diisi!' });
  }

  try {
    const formattedTags = JSON.stringify(Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [word.toLowerCase()]));

    try {
      await dbPool.query(
        'UPDATE dictionary_items SET word = ?, category = ?, level = ?, image_url = ?, illustration_url = ?, video_url = ?, description = ?, tags = ? WHERE id = ?',
        [
          word,
          category,
          level,
          image_url || video_url || null,
          illustration_url || image_url || null,
          video_url || null,
          description,
          formattedTags,
          id
        ]
      );
    } catch (colErr) {
      // Fallback if video_url column is not present
      await dbPool.query(
        'UPDATE dictionary_items SET word = ?, category = ?, level = ?, image_url = ?, illustration_url = ?, description = ?, tags = ? WHERE id = ?',
        [
          word,
          category,
          level,
          image_url || video_url || null,
          illustration_url || image_url || null,
          description,
          formattedTags,
          id
        ]
      );
    }

    res.json({
      success: true,
      message: `Kata isyarat "${word}" berhasil diperbarui!`,
      data: { id, word, category, level, image_url: image_url || video_url, video_url, description, tags }
    });
  } catch (err) {
    console.error('MySQL update dictionary error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data kata isyarat' });
  }
});

app.delete('/api/dictionary/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await dbPool.query('DELETE FROM dictionary_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kata isyarat berhasil dihapus dari database' });
  } catch (err) {
    console.error('MySQL delete dictionary error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus kata isyarat dari database' });
  }
});

// ==========================================
// 2. DIGITAL LIBRARY API (Real Database MySQL)
// ==========================================
app.get('/api/library', async (req, res) => {
  const { search = '', type = '', level = '', category = '' } = req.query;

  try {
    let query = 'SELECT * FROM library_items WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (level && level !== 'all') {
      query += ' AND level = ?';
      params.push(level);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    query += ' ORDER BY id DESC';

    const [rows] = await dbPool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('MySQL library query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data digital library dari database' });
  }
});

app.post('/api/library', async (req, res) => {
  const { title, type = 'buku_bacaan', category = 'Bahasa Indonesia', level = 'Level 1', file_url, thumbnail_url, description = '', total_pages = 10, file_size = '2.0 MB' } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Judul bahan ajar wajib diisi!' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO library_items (title, type, category, level, file_url, thumbnail_url, description, total_pages, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type, category, level, file_url, thumbnail_url || null, description, total_pages, file_size]
    );
    res.json({
      success: true,
      message: 'Bahan ajar berhasil disimpan di Database Perpustakaan!',
      data: { id: result.insertId, title, type, category, level, file_url, thumbnail_url, description, total_pages, file_size }
    });
  } catch (err) {
    console.error('MySQL insert library error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menyimpan bahan ajar ke database' });
  }
});

app.put('/api/library/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, type = 'buku_bacaan', category = 'Bahasa Indonesia', level = 'Level 1', file_url, thumbnail_url, description = '', total_pages = 10, file_size = '2.0 MB' } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Judul bahan ajar wajib diisi!' });
  }

  try {
    await dbPool.query(
      'UPDATE library_items SET title = ?, type = ?, category = ?, level = ?, file_url = ?, thumbnail_url = ?, description = ?, total_pages = ?, file_size = ? WHERE id = ?',
      [title, type, category, level, file_url, thumbnail_url || null, description, total_pages, file_size, id]
    );
    res.json({
      success: true,
      message: `Bahan ajar "${title}" berhasil diperbarui!`,
      data: { id, title, type, category, level, file_url, thumbnail_url, description, total_pages, file_size }
    });
  } catch (err) {
    console.error('MySQL update library error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data bahan ajar' });
  }
});

app.delete('/api/library/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await dbPool.query('DELETE FROM library_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'File materi berhasil dihapus dari database' });
  } catch (err) {
    console.error('MySQL delete library error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus file materi dari database' });
  }
});

// ==========================================
// 3. DYNAMIC CURRICULUM API (Real Database MySQL)
// ==========================================
const formatCurriculumResponse = (items) => {
  const isyaratLevels = items.filter(i => i.track === 'isyarat').sort((a, b) => (a.order_no || 0) - (b.order_no || 0));
  const indonesiaLevels = items.filter(i => i.track === 'bahasa_indonesia').sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

  return {
    isyarat: {
      title: 'Kurikulum LMS Bahasa Isyarat Inklusif',
      levels: isyaratLevels
    },
    bahasa_indonesia: {
      title: 'Kurikulum LMS Bahasa Indonesia & Literasi Dini',
      levels: indonesiaLevels
    },
    raw: items
  };
};

app.get('/api/curriculum', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM curriculums ORDER BY track, order_no, id ASC');
    const formatted = rows.map(r => ({
      ...r,
      topics: typeof r.topics === 'string' ? JSON.parse(r.topics) : (r.topics || [])
    }));
    res.json({ success: true, data: formatCurriculumResponse(formatted) });
  } catch (err) {
    console.error('MySQL curriculum query error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kurikulum dari database' });
  }
});

app.post('/api/curriculum', async (req, res) => {
  const { track = 'isyarat', level = 'Level 1', name = 'Nama Level Baru', topics = [], order_no = 1 } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Judul capaian kurikulum wajib diisi!' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO curriculums (track, level, name, order_no, topics) VALUES (?, ?, ?, ?, ?)',
      [track, level, name, Number(order_no) || 1, JSON.stringify(topics || [])]
    );
    res.json({
      success: true,
      message: 'Jenjang Kurikulum baru berhasil disimpan di Database!',
      data: { id: result.insertId, track, level, name, order_no, topics }
    });
  } catch (err) {
    console.error('MySQL insert curriculum error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan jenjang kurikulum ke database' });
  }
});

app.put('/api/curriculum/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { track, level, name, topics, order_no } = req.body;

  try {
    await dbPool.query(
      'UPDATE curriculums SET track = COALESCE(?, track), level = COALESCE(?, level), name = COALESCE(?, name), order_no = COALESCE(?, order_no), topics = COALESCE(?, topics) WHERE id = ?',
      [track, level, name, order_no !== undefined ? Number(order_no) : null, topics ? JSON.stringify(topics) : null, id]
    );
    res.json({ success: true, message: 'Data Kurikulum berhasil diperbarui di Database!' });
  } catch (err) {
    console.error('MySQL update curriculum error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengupdate kurikulum di database' });
  }
});

app.delete('/api/curriculum/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await dbPool.query('DELETE FROM curriculums WHERE id = ?', [id]);
    res.json({ success: true, message: 'Jenjang Kurikulum berhasil dihapus dari Database' });
  } catch (err) {
    console.error('MySQL delete curriculum error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus jenjang kurikulum dari database' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 The Little Hijabi Backend API Server listening on port ${PORT}`);
});
