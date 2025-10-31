// server.js - simple Node/Express server with SQLite for Lunalé
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/lib/sync');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

// ensure dirs
fs.mkdirSync(path.join(__dirname, 'public/images'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

// sqlite setup
const DBPATH = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DBPATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    image TEXT
  )`);
});

// multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// API: list products
app.get('/api/products', (req, res) => {
  const { q, category } = req.query;
  let sql = 'SELECT * FROM products';
  const params = [];
  if (q || category) {
    const clauses = [];
    if (q) { clauses.push('(name LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (category) { clauses.push('category = ?'); params.push(category); }
    sql += ' WHERE ' + clauses.join(' AND ');
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Admin add product
app.post('/api/admin/add', upload.single('image'), (req, res) => {
  const { name, description, price, category } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : '/images/placeholder.svg';
  db.run(`INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)`,
    [name, description, price || 0, category || '', image],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

// Admin CSV upload
app.post('/api/admin/upload-csv', upload.single('csvfile'), (req, res) => {
  try {
    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    const records = csv(csvContent, { columns: true, skip_empty_lines: true });
    const stmt = db.prepare('INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)');
    db.serialize(() => {
      records.forEach(r => {
        const img = r.image ? `/images/${r.image}` : '/images/placeholder.svg';
        stmt.run(r.name || '', r.description || '', parseFloat(r.price || 0), r.category || '', img);
      });
      stmt.finalize();
      fs.unlinkSync(req.file.path);
      res.json({ success: true, inserted: records.length });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// simple health
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`Lunalé server running on port ${PORT}`));
