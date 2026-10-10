// Shared helper: exchanges the stored refresh token for a fresh access token.
// Google access tokens expire hourly; this runs on every request so the
// proxy never needs to persist or manually rotate a short-lived token.
async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${data.error_description || data.error || res.status}`);
  }
  return data.access_token;
}

function checkAuth(req, res) {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.PROXY_API_KEY) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

module.exports = { getAccessToken, checkAuth };
