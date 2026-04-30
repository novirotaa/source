const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Statik dosyalar
app.use(express.static(__dirname));

// Ana route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Tüm diğer route'lar index.html'e gitsin
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});