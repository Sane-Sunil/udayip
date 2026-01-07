require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Trim quotes from env vars if present
if (process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD.replace(/^["']|["']$/g, '');
}

// Check if we're in production (Neon DB) or local (JSON)
const isProduction = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';
const useDatabase = !!process.env.DATABASE_URL;
let db;

if (useDatabase) {
  db = require('./database');
  // Initialize database
  db.initDatabase();
}

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Projects endpoints
app.get('/projects', async (req, res) => {
  try {
    if (useDatabase) {
      const projects = await db.getProjects();
      res.json(projects);
    } else {
      // Local: use JSON file
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      res.json(pkg.projects || []);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

app.put('/projects', async (req, res) => {
  try {
    if (useDatabase) {
      const success = await db.updateProjects(req.body);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to update projects' });
      }
    } else {
      // Local: use JSON file
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.projects = req.body;
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error updating projects:', error);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${useDatabase ? 'Database (Neon DB)' : 'Local (JSON)'}`);
});