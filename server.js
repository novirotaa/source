const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// CRITICAL: Force HTML content type
app.use((req, res, next) => {
  res.type('html');
  next();
});

// Statik dosyalar
app.use(express.static(__dirname));

// Ana route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});