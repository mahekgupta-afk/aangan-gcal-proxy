const { getAccessToken, checkAuth } = require('./_google');

// Expected JSON body:
// {
//   "timeMin": "2026-11-10T00:00:00+05:30",
//   "timeMax": "2026-11-11T00:00:00+05:30"
// }
// Returns the busy intervals on the calendar in that window; the agent
// reasons about free slots from what's NOT listed as busy.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!checkAuth(req, res)) return;

  const { timeMin, timeMax } = req.body || {};
  if (!timeMin || !timeMax) {
    return res.status(400).json({ success: false, error: 'timeMin and timeMax are required' });
  }

  try {
    const accessToken = await getAccessToken();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
    });

    const data = await fbRes.json();
    if (!fbRes.ok) {
      return res.status(fbRes.status).json({ success: false, error: data.error?.message || 'Calendar API error' });
    }

    const busy = data.calendars?.[calendarId]?.busy || [];
    return res.status(200).json({ success: true, busy });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
