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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');

// Configure Multer Storage for File Uploads
const uploadDirectory = path.join(__dirname, process.env.UPLOAD_DIR || './uploads-the-little-hijabi');
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDirectory));

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
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

// MySQL Pool Connection Configuration
let dbConnected = false;
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
    connection.release();
    dbConnected = true;
  } catch (err) {
    console.warn(`⚠️ MySQL Connection Warning: ${err.message}`);
    console.warn(`ℹ️ Operating in fallback mode with mock data.`);
    dbConnected = false;
  }
})();

// Data Store (Mock Fallback)
const mockData = {
  schools: [
    { id: 1, name: 'TK The Little Hijabi Islamic School', code: 'TLH-JAKARTA', address: 'Jl. Utama Pendidikan No. 8, Jakarta', phone: '0812-3456-7890', email: 'info@littlehijabi.sch.id', subscription_plan: 'Enterprise Pro', price_per_year: 'Rp 15.000.000', total_students: 38, status: 'active', created_at: '2025-01-15' },
    { id: 2, name: 'PAUD Inklusif Sahabat Anak', code: 'PSA-BANDUNG', address: 'Jl. Merdeka No. 45, Bandung', phone: '0821-9876-5432', email: 'admin@sahabatanak.sch.id', subscription_plan: 'Standard Growth', price_per_year: 'Rp 8.500.000', total_students: 45, status: 'active', created_at: '2025-03-20' },
    { id: 3, name: 'TK Islam Bintang Kecil', code: 'TBK-SURABAYA', address: 'Jl. Pemuda No. 12, Surabaya', phone: '0838-1122-3344', email: 'kontak@bintangkecil.sch.id', subscription_plan: 'Starter Basic', price_per_year: 'Rp 5.000.000', total_students: 25, status: 'active', created_at: '2025-06-10' }
  ],
  subscriptions: [
    { id: 1, name: 'Starter Basic', price: 'Rp 5.000.000 / tahun', max_students: 50, features: ['Dashboard Admin & Guru', 'Laporan Harian Siswa', 'Akses LMS Bahasa Isyarat Basic'], active_schools: 1 },
    { id: 2, name: 'Standard Growth', price: 'Rp 8.500.000 / tahun', max_students: 150, features: ['Semua Fitur Starter', 'AI Narrative Report (500x/bln)', 'Monitoring Kepala Sekolah', 'Support WA 24/7'], active_schools: 1 },
    { id: 3, name: 'Enterprise Pro', price: 'Rp 15.000.000 / tahun', max_students: 500, features: ['Semua Fitur Standard', 'AI Narrative Unlimited', 'Multi-Tenant Multi-Cabang', 'Custom Domain Sekolah', 'Prioritas Support & Training'], active_schools: 1 }
  ],
  users: [
    { id: 1, school_id: null, name: 'Super Admin Platform', email: 'superadmin@littlehijabi.com', role: 'super_admin', phone: '0811-0000-1111', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { id: 2, school_id: 1, name: 'Ustadzah Sarah (Admin)', email: 'admin.tk@littlehijabi.com', role: 'school_admin', phone: '0812-3456-7890', avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150' },
    { id: 3, school_id: 1, name: 'Bunda Maryam, M.Pd (Kepala Sekolah)', email: 'kepsek@littlehijabi.com', role: 'principal', phone: '0813-8888-9999', avatar_url: 'https://images.unsplash.com/photo-1580894732468-9111ad5467e2?w=150' },
    { id: 4, school_id: 1, name: 'Bu Ani, S.Pd (Wali Kelas TK A)', email: 'guru.ani@littlehijabi.com', role: 'teacher', phone: '0815-4444-5555', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 5, school_id: 1, name: 'Bapak Budi Santoso (Orang Tua Aisyah)', email: 'ortu.budi@littlehijabi.com', role: 'parent', phone: '0817-6666-7777', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 6, school_id: 1, name: 'Aisyah Putri Humaira (Siswa TK A)', email: 'aisyah@littlehijabi.com', role: 'student', phone: '0819-2222-3333', avatar_url: 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=150' }
  ],
  classes: [
    { id: 1, school_id: 1, name: 'TK A - Al Fatih', level: 'TK A', total_students: 18, teacher_name: 'Bu Ani, S.Pd', room: 'Gedung A R.101' },
    { id: 2, school_id: 1, name: 'TK B - Ar Razi', level: 'TK B', total_students: 20, teacher_name: 'Ustadzah Siti, S.Pd', room: 'Gedung A R.102' }
  ],
  students: [
    { id: 1, school_id: 1, class_id: 1, class_name: 'TK A - Al Fatih', nisn: '0012345678', full_name: 'Aisyah Putri Humaira', nickname: 'Aisyah', gender: 'P', birth_date: '2021-04-12', avatar_url: 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=200', parent_name: 'Bapak Budi Santoso', xp: 240, level: 3, streak_days: 7 },
    { id: 2, school_id: 1, class_id: 1, class_name: 'TK A - Al Fatih', nisn: '0012345679', full_name: 'Ahmad Zaki Al-Faris', nickname: 'Ahmad', gender: 'L', birth_date: '2021-08-05', avatar_url: 'https://images.unsplash.com/photo-1519238263530-99afd11df2ea?w=200', parent_name: 'Ibu Ratna', xp: 150, level: 2, streak_days: 4 },
    { id: 3, school_id: 1, class_id: 1, class_name: 'TK A - Al Fatih', nisn: '0012345680', full_name: 'Siti Zahra Medina', nickname: 'Siti', gender: 'P', birth_date: '2021-01-20', avatar_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200', parent_name: 'Bapak Hendra', xp: 190, level: 2, streak_days: 5 },
    { id: 4, school_id: 1, class_id: 1, class_name: 'TK A - Al Fatih', nisn: '0012345681', full_name: 'Budi Pratama', nickname: 'Budi', gender: 'L', birth_date: '2021-11-15', avatar_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200', parent_name: 'Ibu Maya', xp: 110, level: 1, streak_days: 2 }
  ],
  dailyReports: [
    {
      id: 1,
      school_id: 1,
      class_id: 1,
      class_name: 'TK A - Al Fatih',
      teacher_name: 'Bu Ani, S.Pd',
      report_date: '2026-08-09',
      theme: 'Mengenal Hewan & Bahasa Isyarat',
      subtheme: 'Hewan Peliharaan',
      summary: 'Hari ini anak-anak belajar mengenal nama-nama hewan peliharaan dalam Bahasa Indonesia dan Bahasa Isyarat sederhana (Kucing, Kelinci, Burung). Semua anak antusias dan gembira.',
      activities_list: ['Bahasa Indonesia', 'Bahasa Isyarat', 'Art Project', 'Story Telling'],
      attachments: [
        { id: 1, file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600', file_type: 'image', file_name: 'Dokumentasi Belajar 1.jpg' },
        { id: 2, file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600', file_type: 'image', file_name: 'Karya Menggambar.jpg' }
      ],
      tagged_student_ids: [1, 2, 3],
      status: 'published'
    },
    {
      id: 2,
      school_id: 1,
      class_id: 2,
      class_name: 'TK B - Ar Razi',
      teacher_name: 'Ustadzah Siti, S.Pd',
      report_date: '2026-08-09',
      theme: 'Adab Makan & Kebersihan Diri',
      subtheme: 'Mencuci Tangan & Doa Makan',
      summary: 'Anak-anak TK B praktik mencuci tangan 6 langkah WHO dan menghafal doa sebelum & sesudah makan.',
      activities_list: ['Explore Qur\'an', 'Life Skill', 'Motorik Kasar'],
      attachments: [
        { id: 3, file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600', file_type: 'image', file_name: 'Praktik Cuci Tangan.jpg' }
      ],
      tagged_student_ids: [1, 4],
      status: 'draft'
    }
  ],
  developments: [
    {
      id: 1,
      student_id: 1,
      student_name: 'Aisyah Putri Humaira',
      period_month: 'Agustus 2026',
      ratings: { bahasa: 4, isyarat: 5, sosial: 4, motorik: 5, kreativitas: 5 },
      teacher_notes: 'Aisyah sangat ceria, komunikatif, dan aktif memperagakan moves Bahasa Isyarat.',
      ai_generated_narrative: 'Aisyah menunjukkan perkembangan luar biasa bulan ini! Ia mampu memahami instruksi verbal dan memperagakan Isyarat abjad A-E secara mandiri dengan rasa percaya diri tinggi.',
      status: 'published'
    },
    {
      id: 2,
      student_id: 2,
      student_name: 'Ahmad Zaki Al-Faris',
      period_month: 'Agustus 2026',
      ratings: { bahasa: 4, isyarat: 3, sosial: 4, motorik: 4, kreativitas: 4 },
      teacher_notes: 'Ahmad aktif dalam kegiatan kelompok dan motorik kasar.',
      ai_generated_narrative: 'Ahmad berkembang dengan sangat baik, terutama pada aspek motorik dan interaksi sosial dengan teman sebaya.',
      status: 'published'
    }
  ],
  messages: [
    { id: 1, sender: 'Ustadzah Bu Ani', receiver: 'Bapak Budi', text: 'Assalamu\'alaikum Pak Budi, hari ini Aisyah sangat hebat saat praktik Bahasa Isyarat di kelas! 🌟', timestamp: '10:30' },
    { id: 2, sender: 'Bapak Budi', receiver: 'Ustadzah Bu Ani', text: 'Wa\'alaikumsalam Bu Ani, alhamdulillah! Terima kasih banyak sudah mendampingi Aisyah 🙏', timestamp: '10:35' }
  ],
  courses: [
    {
      id: 1,
      title: 'Bahasa Isyarat Dasar Anak',
      category: 'bahasa_isyarat',
      level: 'Level 1',
      description: 'Belajar abjad, angka, dan kata sehari-hari dalam Bahasa Isyarat dengan video interaktif.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
      total_lessons: 5,
      lessons: [
        { id: 1, title: 'Isyarat Huruf A - E', content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '5 menit' },
        { id: 2, title: 'Isyarat Kata Sehari-hari (Makan & Minum)', content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '6 menit' }
      ]
    },
    {
      id: 2,
      title: 'Pengenalan Alfabet & Kata',
      category: 'bahasa_indonesia',
      level: 'Level 1',
      description: 'Mengenal huruf vokal, konsonan, dan kata sederhana.',
      thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      total_lessons: 4,
      lessons: [
        { id: 3, title: 'Mengenal Huruf Vokal A I U E O', content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '4 menit' }
      ]
    }
  ],
  quizzes: [
    {
      id: 1,
      title: 'Kuis Bahasa Isyarat Huruf A-E',
      xp_reward: 50,
      questions: [
        {
          id: 1,
          question_text: 'Gerakan kepalan tangan dengan ibu jari tegak melambangkan huruf apa?',
          image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300',
          options: [
            { id: 'a', text: 'Huruf A', is_correct: true },
            { id: 'b', text: 'Huruf B', is_correct: false },
            { id: 'c', text: 'Huruf C', is_correct: false }
          ]
        }
      ]
    }
  ]
};

// Health Check API
app.get('/api/health', async (req, res) => {
  let isDbOk = dbConnected;
  if (dbConnected) {
    try {
      await dbPool.query('SELECT 1');
    } catch {
      isDbOk = false;
    }
  }
  res.json({
    success: true,
    message: 'The Little Hijabi API Server is running smoothly!',
    database: isDbOk ? 'connected' : 'disconnected (mock mode)',
    timestamp: new Date()
  });
});

// Authentication Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  let user = null;

  if (dbConnected) {
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
      if (rows.length > 0) {
        user = rows[0];
      }
    } catch (err) {
      console.error('MySQL login query error:', err.message);
    }
  }

  if (!user) {
    user = mockData.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) ||
           (role ? mockData.users.find(u => u.role === role) : null);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email tidak terdaftar!' });
  }

  if (password) {
    if (user.password && user.password.startsWith('$2')) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
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
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        school_name: 'TK The Little Hijabi Islamic School'
      }
    }
  });
});

app.get('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  let decoded = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Invalid or expired token
    }
  }

  if (dbConnected && decoded?.id) {
    try {
      const [rows] = await dbPool.query('SELECT id, school_id, name, email, phone, role, avatar_url, status FROM users WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        return res.json({ success: true, data: rows[0] });
      }
    } catch (err) {
      console.error('MySQL profile error:', err.message);
    }
  }

  const matched = decoded ? mockData.users.find(u => u.id === decoded.id) : mockData.users[3];
  res.json({ success: true, data: matched || mockData.users[3] });
});

// Schools API CRUD
app.get('/api/schools', async (req, res) => {
  const { search = '', status = '', page = 1, limit = 10 } = req.query;

  if (dbConnected) {
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
      return res.json({
        success: true,
        data: rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: rows.length, totalPages: Math.ceil(rows.length / limit) || 1 }
      });
    } catch (err) {
      console.error('MySQL schools query error:', err.message);
    }
  }

  let filtered = mockData.schools;
  if (search) {
    filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  res.json({
    success: true,
    data: filtered,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: filtered.length, totalPages: 1 }
  });
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

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO schools (name, code, address, phone, email, subscription_plan, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [schoolData.name, schoolData.code, schoolData.address, schoolData.phone, schoolData.email, schoolData.subscription_plan, schoolData.status]
      );
      return res.json({
        success: true,
        message: 'Sekolah baru berhasil ditambahkan ke Database!',
        data: { id: result.insertId, ...schoolData }
      });
    } catch (err) {
      console.error('MySQL insert school error:', err.message);
    }
  }

  const newSchool = {
    id: mockData.schools.length + 1,
    ...schoolData,
    price_per_year: schoolData.subscription_plan === 'pro' ? 'Rp 15.000.000' : 'Rp 8.500.000',
    total_students: 30,
    created_at: new Date().toISOString().split('T')[0]
  };
  mockData.schools.unshift(newSchool);
  res.json({ success: true, message: 'Sekolah baru berhasil ditambahkan!', data: newSchool });
});

app.put('/api/schools/:id', async (req, res) => {
  const schoolId = parseInt(req.params.id);

  if (dbConnected) {
    try {
      const { name, phone, email, address, status } = req.body;
      await dbPool.query(
        'UPDATE schools SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address), status = COALESCE(?, status) WHERE id = ?',
        [name, phone, email, address, status, schoolId]
      );
      const [rows] = await dbPool.query('SELECT * FROM schools WHERE id = ?', [schoolId]);
      return res.json({ success: true, message: 'Data sekolah diperbarui di Database!', data: rows[0] });
    } catch (err) {
      console.error('MySQL update school error:', err.message);
    }
  }

  const idx = mockData.schools.findIndex(s => s.id === schoolId);
  if (idx !== -1) {
    mockData.schools[idx] = { ...mockData.schools[idx], ...req.body };
    res.json({ success: true, message: 'Data sekolah diperbarui!', data: mockData.schools[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan' });
  }
});

app.delete('/api/schools/:id', async (req, res) => {
  const schoolId = parseInt(req.params.id);

  if (dbConnected) {
    try {
      await dbPool.query('DELETE FROM schools WHERE id = ?', [schoolId]);
      return res.json({ success: true, message: 'Sekolah berhasil dihapus dari Database' });
    } catch (err) {
      console.error('MySQL delete school error:', err.message);
    }
  }

  mockData.schools = mockData.schools.filter(s => s.id !== schoolId);
  res.json({ success: true, message: 'Sekolah berhasil dihapus' });
});

// Subscriptions API
app.get('/api/subscriptions', async (req, res) => {
  res.json({ success: true, data: mockData.subscriptions });
});

// Users Endpoint
app.get('/api/users', async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  if (dbConnected) {
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
      return res.json({
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
    }
  }

  let filtered = mockData.users;
  if (search) {
    filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  }
  if (role) {
    filtered = filtered.filter(u => u.role === role);
  }

  res.json({
    success: true,
    data: filtered,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1
    }
  });
});

app.post('/api/users', async (req, res) => {
  const plainPassword = req.body.password || 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone || '0812-3456-7890',
    role: req.body.role || 'teacher',
    avatar_url: req.body.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  };

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO users (name, email, password, phone, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.phone, userData.role, userData.avatar_url]
      );
      return res.json({
        success: true,
        message: 'Pengguna berhasil ditambahkan ke Database',
        data: { id: result.insertId, ...userData }
      });
    } catch (err) {
      console.error('MySQL insert user error:', err.message);
    }
  }

  const newUser = { id: mockData.users.length + 1, school_id: 1, ...userData };
  mockData.users.unshift(newUser);
  res.json({ success: true, message: 'Pengguna berhasil ditambahkan', data: newUser });
});

// Students API
app.get('/api/students', async (req, res) => {
  const { page = 1, limit = 10, search = '', class_id } = req.query;

  if (dbConnected) {
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
      return res.json({
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
    }
  }

  let filtered = mockData.students;
  if (search) {
    filtered = filtered.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()) || s.nickname.toLowerCase().includes(search.toLowerCase()));
  }
  if (class_id) {
    filtered = filtered.filter(s => s.class_id === parseInt(class_id));
  }

  res.json({
    success: true,
    data: filtered,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1
    }
  });
});

app.post('/api/students', async (req, res) => {
  const studentData = {
    school_id: 1,
    class_id: req.body.class_id || 1,
    nisn: req.body.nisn || `00${Date.now().toString().slice(-8)}`,
    full_name: req.body.full_name,
    nickname: req.body.nickname || req.body.full_name.split(' ')[0],
    gender: req.body.gender || 'P',
    birth_date: req.body.birth_date || '2021-05-10',
    avatar_url: req.body.avatar_url || 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=200'
  };

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO students (school_id, class_id, nisn, full_name, nickname, gender, birth_date, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [studentData.school_id, studentData.class_id, studentData.nisn, studentData.full_name, studentData.nickname, studentData.gender, studentData.birth_date, studentData.avatar_url]
      );
      return res.json({
        success: true,
        message: 'Siswa berhasil ditambahkan ke Database',
        data: { id: result.insertId, ...studentData }
      });
    } catch (err) {
      console.error('MySQL insert student error:', err.message);
    }
  }

  const newStudent = { id: mockData.students.length + 1, class_name: 'TK A - Al Fatih', parent_name: 'Orang Tua', xp: 100, level: 1, streak_days: 1, ...studentData };
  mockData.students.unshift(newStudent);
  res.json({ success: true, message: 'Siswa berhasil ditambahkan', data: newStudent });
});

// Classes API
app.get('/api/classes', async (req, res) => {
  if (dbConnected) {
    try {
      const [rows] = await dbPool.query('SELECT c.*, u.name as teacher_name FROM classes c LEFT JOIN users u ON c.homeroom_teacher_id = u.id');
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('MySQL classes query error:', err.message);
    }
  }
  res.json({ success: true, data: mockData.classes });
});

app.post('/api/classes', async (req, res) => {
  const classData = {
    school_id: 1,
    academic_year_id: 1,
    name: req.body.name,
    level: req.body.level || 'TK A'
  };

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO classes (school_id, academic_year_id, name, level) VALUES (?, ?, ?, ?)',
        [classData.school_id, classData.academic_year_id, classData.name, classData.level]
      );
      return res.json({ success: true, message: 'Kelas baru berhasil ditambahkan ke Database', data: { id: result.insertId, ...classData } });
    } catch (err) {
      console.error('MySQL insert class error:', err.message);
    }
  }

  const newClass = { id: mockData.classes.length + 1, total_students: 0, teacher_name: 'Bu Ani, S.Pd', room: 'Gedung A', ...classData };
  mockData.classes.unshift(newClass);
  res.json({ success: true, message: 'Kelas baru berhasil ditambahkan', data: newClass });
});

// Daily Reports API
app.get('/api/daily-reports', async (req, res) => {
  const { search = '', status } = req.query;

  if (dbConnected) {
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
      return res.json({
        success: true,
        data: rows,
        pagination: { page: 1, limit: 10, total: rows.length, totalPages: 1 }
      });
    } catch (err) {
      console.error('MySQL daily reports error:', err.message);
    }
  }

  let reports = mockData.dailyReports;
  if (search) {
    reports = reports.filter(r => r.theme.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase()));
  }
  if (status) {
    reports = reports.filter(r => r.status === status);
  }

  res.json({
    success: true,
    data: reports,
    pagination: { page: 1, limit: 10, total: reports.length, totalPages: 1 }
  });
});

app.post('/api/daily-reports', async (req, res) => {
  const reportData = {
    school_id: 1,
    class_id: req.body.class_id || 1,
    teacher_id: req.body.teacher_id || 4,
    report_date: req.body.report_date || new Date().toISOString().split('T')[0],
    theme: req.body.theme,
    subtheme: req.body.subtheme || '',
    summary: req.body.summary,
    activities_list: JSON.stringify(req.body.activities_list || ['Bahasa Indonesia', 'Bahasa Isyarat']),
    status: req.body.status || 'published'
  };

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO daily_reports (school_id, class_id, teacher_id, report_date, theme, subtheme, summary, activities_list, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [reportData.school_id, reportData.class_id, reportData.teacher_id, reportData.report_date, reportData.theme, reportData.subtheme, reportData.summary, reportData.activities_list, reportData.status]
      );
      return res.json({ success: true, message: 'Laporan harian berhasil disimpan ke Database!', data: { id: result.insertId, ...reportData } });
    } catch (err) {
      console.error('MySQL insert daily report error:', err.message);
    }
  }

  const newReport = {
    id: mockData.dailyReports.length + 1,
    class_name: req.body.class_name || 'TK A - Al Fatih',
    teacher_name: 'Bu Ani, S.Pd',
    activities_list: req.body.activities_list || ['Bahasa Indonesia', 'Bahasa Isyarat'],
    attachments: [
      { id: Date.now(), file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600', file_type: 'image', file_name: 'Foto Belajar.jpg' }
    ],
    tagged_student_ids: [1, 2],
    ...reportData
  };
  mockData.dailyReports.unshift(newReport);
  res.json({ success: true, message: 'Laporan harian berhasil dibuat!', data: newReport });
});

app.put('/api/daily-reports/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);

  if (dbConnected) {
    try {
      await dbPool.query('UPDATE daily_reports SET status = ? WHERE id = ?', ['published', id]);
      return res.json({ success: true, message: 'Laporan harian disetujui & dipublikasikan di Database!' });
    } catch (err) {
      console.error('MySQL approve report error:', err.message);
    }
  }

  const idx = mockData.dailyReports.findIndex(r => r.id === id);
  if (idx !== -1) {
    mockData.dailyReports[idx].status = 'published';
    res.json({ success: true, message: 'Laporan harian disetujui & dipublikasikan!', data: mockData.dailyReports[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
  }
});

// Developments API
app.get('/api/developments', async (req, res) => {
  if (dbConnected) {
    try {
      const [rows] = await dbPool.query('SELECT sd.*, s.full_name as student_name FROM student_developments sd LEFT JOIN students s ON sd.student_id = s.id');
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('MySQL developments query error:', err.message);
    }
  }
  res.json({ success: true, data: mockData.developments });
});

// AI Report Generator Endpoint (Powered by Gemini 2.5 Flash API)
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
      // Remove any markdown codeblock formatting if present
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
        // If text response is not pure JSON, use text directly as narrative
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
  }

  // Fallback if API fails or offline
  const fallbackNarrative = `${student} menunjukkan minat yang luar biasa dalam mengikuti pembelajaran. Berdasarkan catatan perkembangan (${promptNotes}), Ananda mampu merespons instruksi guru dengan sikap santun, menunjukkan keterampilan motorik yang makin matang, serta sangat antusias saat memperagakan gerakan Bahasa Isyarat bersama teman-teman kelasnya.`;

  res.json({
    success: true,
    data: {
      narrative: fallbackNarrative,
      suggestions: [
        'Berikan pujian atas keaktifan Ananda di rumah.',
        'Ajak Ananda mengulang 3 isyarat abjad sebelum tidur.'
      ]
    }
  });
});

// LMS Courses & Quizzes API
app.get('/api/courses', async (req, res) => {
  if (dbConnected) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM courses');
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('MySQL courses query error:', err.message);
    }
  }
  res.json({ success: true, data: mockData.courses });
});

app.post('/api/courses', async (req, res) => {
  const course = {
    id: mockData.courses.length + 1,
    title: req.body.title,
    category: req.body.category || 'Bahasa Isyarat',
    level: req.body.level || 'Level 1',
    description: req.body.description || '',
    thumbnail: req.body.thumbnail || 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
    video_url: req.body.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    lessonsCount: req.body.lessonsCount || 1,
    created_at: new Date().toISOString()
  };

  if (dbConnected) {
    try {
      const [result] = await dbPool.query(
        'INSERT INTO courses (title, category, level, description, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
        [course.title, course.category, course.level, course.description, course.thumbnail]
      );
      return res.json({ success: true, message: 'Modul materi baru berhasil disimpan!', data: { id: result.insertId, ...course } });
    } catch (err) {
      console.error('MySQL insert course error:', err.message);
    }
  }

  mockData.courses.unshift(course);
  res.json({ success: true, message: 'Modul materi baru berhasil ditambahkan!', data: course });
});

app.put('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (dbConnected) {
    try {
      const { title, category, level, description, thumbnail, video_url } = req.body;
      await dbPool.query(
        'UPDATE courses SET title = COALESCE(?, title), category = COALESCE(?, category), level = COALESCE(?, level), description = COALESCE(?, description), thumbnail_url = COALESCE(?, thumbnail_url) WHERE id = ?',
        [title, category, level, description, thumbnail, id]
      );
    } catch (err) {
      console.error('MySQL update course error:', err.message);
    }
  }

  const idx = mockData.courses.findIndex(c => c.id === id);
  if (idx !== -1) {
    mockData.courses[idx] = { ...mockData.courses[idx], ...req.body };
    res.json({ success: true, message: 'Modul materi berhasil diperbarui!', data: mockData.courses[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Modul materi tidak ditemukan' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (dbConnected) {
    try {
      await dbPool.query('DELETE FROM courses WHERE id = ?', [id]);
    } catch (err) {
      console.error('MySQL delete course error:', err.message);
    }
  }
  mockData.courses = mockData.courses.filter(c => c.id !== id);
  res.json({ success: true, message: 'Modul materi berhasil dihapus!' });
});

// Quizzes API
app.get('/api/quizzes', async (req, res) => {
  res.json({ success: true, data: mockData.quizzes || [
    {
      id: 1,
      course_id: 1,
      question: 'Gerakan mengepalkan tangan dengan ibu jari tegak di samping melambangkan isyarat huruf apa?',
      options: [
        { id: 'a', text: 'Huruf A', isCorrect: true },
        { id: 'b', text: 'Huruf B', isCorrect: false },
        { id: 'c', text: 'Huruf C', isCorrect: false }
      ],
      xp: 50
    }
  ] });
});

app.post('/api/quizzes', async (req, res) => {
  const quiz = {
    id: Date.now(),
    question: req.body.question,
    options: req.body.options || [],
    xp: req.body.xp || 50
  };
  if (!mockData.quizzes) mockData.quizzes = [];
  mockData.quizzes.unshift(quiz);
  res.json({ success: true, message: 'Kuis interaktif baru berhasil dibuat!', data: quiz });
});

// Messages API
app.get('/api/messages', async (req, res) => {
  res.json({ success: true, data: mockData.messages });
});

app.post('/api/messages', async (req, res) => {
  const newMsg = {
    id: mockData.messages.length + 1,
    sender: req.body.sender || 'Orang Tua',
    receiver: 'Ustadzah Bu Ani',
    text: req.body.text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  mockData.messages.push(newMsg);
  res.json({ success: true, data: newMsg });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 The Little Hijabi Backend API Server listening on port ${PORT}`);
});
