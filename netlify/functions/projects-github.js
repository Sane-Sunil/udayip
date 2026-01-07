const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database if needed
async function ensureDatabase() {
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
    // Ensure database exists
    await ensureDatabase();
    
    // Handle different HTTP methods
    if (event.httpMethod === 'GET') {
      // GET: Return all projects
      const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(projects)
      };
    } else if (event.httpMethod === 'PUT') {
      // PUT: Update projects
      const projects = JSON.parse(event.body);
      
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
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error in projects-github function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

module.exports = { handler };