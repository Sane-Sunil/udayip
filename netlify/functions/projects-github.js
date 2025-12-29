const https = require('https');

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'your-username/your-repo';
const PROJECTS_FILE = 'projects.json';
const GITHUB_API = 'https://api.github.com';

// Default projects if file doesn't exist
const DEFAULT_PROJECTS = [];

// Helper function to make GitHub API requests
function githubRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'UdayIP-Portfolio',
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Get projects from GitHub
async function getProjects() {
  try {
    if (!GITHUB_TOKEN) {
      // Fallback to default projects if no GitHub token
      return DEFAULT_PROJECTS;
    }

    const [owner, repo] = GITHUB_REPO.split('/');
    const path = `/repos/${owner}/${repo}/contents/${PROJECTS_FILE}`;
    
    const response = await githubRequest('GET', path);
    
    if (response.content) {
      const content = Buffer.from(response.content, 'base64').toString('utf8');
      return JSON.parse(content);
    }
    
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.error('Error getting projects:', error);
    return DEFAULT_PROJECTS;
  }
}

// Save projects to GitHub
async function saveProjects(projects) {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    const [owner, repo] = GITHUB_REPO.split('/');
    const path = `/repos/${owner}/${repo}/contents/${PROJECTS_FILE}`;
    
    // Get current file info (including SHA)
    let currentFile;
    try {
      currentFile = await githubRequest('GET', path);
    } catch (error) {
      // File doesn't exist, create it
      currentFile = null;
    }

    const content = Buffer.from(JSON.stringify(projects, null, 2)).toString('base64');
    const data = {
      message: `Update projects (${new Date().toISOString()})`,
      content: content
    };

    if (currentFile && currentFile.sha) {
      data.sha = currentFile.sha;
    }

    await githubRequest('PUT', path, data);
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
      },
      body: ''
    };
  }

  // Allow GET and PUT requests
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const projects = await getProjects();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
        },
        body: JSON.stringify(projects)
      };
    } else if (event.httpMethod === 'PUT') {
      const projects = JSON.parse(event.body);
      
      // Validate that it's an array
      if (!Array.isArray(projects)) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
          },
          body: JSON.stringify({ error: 'Projects must be an array' })
        };
      }
      
      await saveProjects(projects);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
        },
        body: JSON.stringify({ success: true })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};