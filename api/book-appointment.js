const { getAccessToken, checkAuth } = require('./_google');

// Expected JSON body from the Vaani custom tool:
// {
//   "summary": "Consultation with Trisha",
//   "description": "3BHK renovation enquiry, Hinjewadi, budget TBD",
//   "startDateTime": "2026-11-10T11:00:00",
//   "endDateTime": "2026-11-10T11:45:00",
//   "timeZone": "Asia/Kolkata",
//   "attendeeEmail": "trisha@example.com",
//   "attendeeName": "Trisha"
// }
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!checkAuth(req, res)) return;

  const {
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendeeEmail,
    attendeeName,
  } = req.body || {};

  if (!summary || !startDateTime || !endDateTime) {
    return res.status(400).json({
      success: false,
      error: 'summary, startDateTime, and endDateTime are required',
    });
  }

  try {
    const accessToken = await getAccessToken();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const event = {
      summary,
      description: description || '',
      start: { dateTime: startDateTime, timeZone: timeZone || 'Asia/Kolkata' },
      end: { dateTime: endDateTime, timeZone: timeZone || 'Asia/Kolkata' },
    };
    if (attendeeEmail) {
      event.attendees = [{ email: attendeeEmail, displayName: attendeeName || undefined }];
    }

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await calRes.json();
    if (!calRes.ok) {
      return res.status(calRes.status).json({ success: false, error: data.error?.message || 'Calendar API error' });
    }

    return res.status(200).json({
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
      start: data.start,
      end: data.end,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
