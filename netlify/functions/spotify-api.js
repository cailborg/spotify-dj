const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No valid token provided' })
    };
  }

  const token = authHeader.split(' ')[1];
  const { path } = event.queryStringParameters || {};

  if (!path) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No API path specified' })
    };
  }

  try {
    let spotifyResponse;
    
    if (event.httpMethod === 'GET') {
      spotifyResponse = await axios.get(`https://api.spotify.com/v1/${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      spotifyResponse = await axios.post(`https://api.spotify.com/v1/${path}`, body, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(spotifyResponse.data)
    };
  } catch (error) {
    console.error('Spotify API error:', error.response?.data);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.response?.data || 'API request failed' 
      })
    };
  }
};