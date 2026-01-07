#!/usr/bin/env node

// Database setup script
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Setting up database...');
    
    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Projects table created');
    
    // Check if data exists
    const existingProjects = await sql`SELECT COUNT(*) as count FROM projects`;
    
    if (existingProjects[0].count === 0) {
      // Insert sample data
      await sql`
        INSERT INTO projects (id, name, url, description) VALUES 
        ('1767767384873', 'rehfh', 'ff://esf.fesf', 'ds')
      `;
      console.log('✅ Sample data inserted');
    } else {
      console.log(`✅ Database already has ${existingProjects[0].count} projects`);
    }
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();