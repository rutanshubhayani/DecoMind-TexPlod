import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({
  // origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://decomind.vercel.app'],
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization']
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.options('*', cors());
app.use(express.json());
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'texplods',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get('/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, price, category, badge, image FROM products ORDER BY id ASC');
    res.json(rows);
  } catch (e) {
    console.error('GET /api/products error:', e);
    if (e && e.code === 'ER_NO_SUCH_TABLE') {
      // Table not yet created; respond gracefully with empty list
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/seed', async (_req, res) => {
  const seedItems = [
    ['Aria Linen Throw', 49, 'textiles', 'Cozy', 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1600&auto=format&fit=crop'],
    ['Nordic Floor Lamp', 129, 'lighting', 'New', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop'],
    ['Terra Cotta Vase', 39, 'decor', 'Bestseller', 'https://images.unsplash.com/photo-1582582429416-c3d06d1b9d8a?q=80&w=1600&auto=format&fit=crop'],
    ['Framed Abstract Art', 89, 'wall-art', 'Curated', 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1600&auto=format&fit=crop'],
    ['Monstera Plant', 35, 'plants', 'Fresh', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1600&auto=format&fit=crop']
  ];
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS products (\n      id INT UNSIGNED NOT NULL AUTO_INCREMENT,\n      name VARCHAR(160) NOT NULL,\n      price DECIMAL(10,2) NOT NULL,\n      category VARCHAR(40) NOT NULL,\n      badge VARCHAR(60) NULL,\n      image VARCHAR(500) NOT NULL,\n      PRIMARY KEY (id),\n      KEY idx_category (category)\n    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    const [countRows] = await pool.query('SELECT COUNT(*) AS c FROM products');
    if (countRows[0].c > 0) return res.json({ seeded: false, message: 'Already has data' });
    await pool.query('INSERT INTO products (name, price, category, badge, image) VALUES ?', [seedItems]);
    res.json({ seeded: true, inserted: seedItems.length });
  } catch (e) {
    console.error('POST /api/seed error:', e);
    res.status(500).json({ error: 'Failed to seed' });
  }
});

app.post('/api/products', upload.single('imageFile'), async (req, res) => {
  const { name, price, category, badge, image } = req.body || {};
  const uploadedPath = req.file ? `/uploads/${req.file.filename}` : null;
  const finalImage = uploadedPath || image;
  if (!name || typeof name !== 'string' || !price || isNaN(Number(price)) || !category || !finalImage) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, category, badge, image) VALUES (?, ?, ?, ?, ?)',
      [name, Number(price), category, badge || null, finalImage]
    );
    const [rows] = await pool.query('SELECT id, name, price, category, badge, image FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', upload.single('imageFile'), async (req, res) => {
  const { id } = req.params;
  const { name, price, category, badge, image } = req.body || {};
  const uploadedPath = req.file ? `/uploads/${req.file.filename}` : null;
  const finalImage = uploadedPath || image;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  if (!name || typeof name !== 'string' || !price || isNaN(Number(price)) || !category || !finalImage) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    await pool.query(
      'UPDATE products SET name=?, price=?, category=?, badge=?, image=? WHERE id=?',
      [name, Number(price), category, badge || null, finalImage, Number(id)]
    );
    const [rows] = await pool.query('SELECT id, name, price, category, badge, image FROM products WHERE id = ?', [Number(id)]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [Number(id)]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  try {
    await pool.query('INSERT IGNORE INTO newsletter (email) VALUES (?)', [email]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Import and use auth routes
import authRoutes from './routes/auth.js';
app.use('/auth', authRoutes);

// Protected routes middleware
app.use(['/api/products', '/api/orders'], authenticateToken);

const port = Number(process.env.PORT || 8000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));


