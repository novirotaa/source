const express = require('express');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Form endpoint - Database'e kaydet
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, email, phone, service, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, email, phone, service, message]
    );
    
    console.log('✓ Form saved:', result.rows[0]);
    res.json({ 
      success: true, 
      message: 'Mesajınız alındı! En kısa sürede dönüş yapacağız.' 
    });
  } catch (error) {
    console.error('✗ Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.' 
    });
  }
});

// Admin panel - Başvuruları listele (basit)
app.get('/admin', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 100'
    );
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Panel - Başvurular</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #FF5F3D; color: white; }
          tr:hover { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>📋 Form Başvuruları (${result.rows.length})</h1>
        <table>
          <tr>
            <th>Tarih</th>
            <th>Ad Soyad</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Hizmet</th>
            <th>Mesaj</th>
          </tr>
    `;
    
    result.rows.forEach(row => {
      const date = new Date(row.created_at).toLocaleString('tr-TR');
      html += `
        <tr>
          <td>${date}</td>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.phone || '-'}</td>
          <td>${row.service || '-'}</td>
          <td>${row.message.substring(0, 100)}...</td>
        </tr>
      `;
    });
    
    html += `
        </table>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Database error');
  }
});

// Database bağlantı testi
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});