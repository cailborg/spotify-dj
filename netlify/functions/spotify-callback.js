const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  const { code, state } = event.queryStringParameters || {};
  
  if (!code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No authorization code provided' })
    };
  }

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Redirect back to app with token (in production, use more secure method)
    const redirectUrl = `${process.env.URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
    
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': redirectUrl
      }
    };
  } catch (error) {
    console.error('Token exchange failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Token exchange failed' })
    };
  }
};