exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod === 'GET') {
    // Start OAuth flow
    const state = Math.random().toString(36).substring(2);
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
      `scope=${encodeURIComponent('user-read-email user-read-private playlist-read-private playlist-read-collaborative user-modify-playback-state streaming app-remote-control user-read-playback-state')}&` +
      `redirect_uri=https://admirable-snickerdoodle-78efb0.netlify.app/` +
      `state=${state}`;

    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': authUrl,
        'Set-Cookie': `spotify_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax`
      }
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};