// Database configuration
const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database schema
async function initDatabase() {
  try {
    // Create projects table if it doesn't exist
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
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Get all projects
async function getProjects() {
  try {
    const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Update projects (replace all)
async function updateProjects(projects) {
  try {
    // Start transaction
    await sql`BEGIN`;
    
    // Clear existing projects
    await sql`DELETE FROM projects`;
    
    // Insert new projects
    if (projects.length > 0) {
      for (const project of projects) {
        await sql`
          INSERT INTO projects (id, name, url, description)
          VALUES (${project.id}, ${project.name}, ${project.url}, ${project.description})
        `;
      }
    }
    
    await sql`COMMIT`;
    return true;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error updating projects:', error);
    return false;
  }
}

module.exports = {
  initDatabase,
  getProjects,
  updateProjects,
  sql
};