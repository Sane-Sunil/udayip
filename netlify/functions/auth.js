const handler = async (event) => {
  try {
    const { password } = JSON.parse(event.body);
    const correctPassword = process.env.ADMIN_PASSWORD;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: password === correctPassword 
      })
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Authentication failed' })
    };
  }
};

module.exports = { handler };