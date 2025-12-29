require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Trim quotes from env vars if present
if (process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD.replace(/^["']|["']$/g, '');
}

app.use(cors());
app.use(express.json());

// Serve static files but exclude .env
app.use(express.static('.', {
  dotfiles: 'deny'  // This should prevent serving dotfiles like .env
}));

// Projects endpoints
app.get('/projects', (req, res) => {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    res.json(pkg.projects || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

app.put('/projects', (req, res) => {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.projects = req.body;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update projects' });
  }
});

// Authentication endpoint
app.post('/auth', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});