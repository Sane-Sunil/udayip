const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection (moved inside handler to ensure env vars are loaded)

// Initialize database if needed
async function ensureDatabase(sql) {
  try {
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
  } catch (error) {
    console.error('Database setup error:', error);
  }
}

const handler = async (event) => {
  try {
    // Debug environment variables
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
    
    // Initialize Neon connection inside handler
    const sql = neon(process.env.DATABASE_URL);
    
    // Ensure database exists
    await ensureDatabase(sql);
    
    // Get projects from Neon database
    console.log('Fetching projects from database...');
    const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
    console.log('Fetched projects:', projects.length, 'items');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error('Error reading projects:', error);
    console.error('Error details:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Failed to read projects', details: error.message })
    };
  }
};

module.exports = { handler };