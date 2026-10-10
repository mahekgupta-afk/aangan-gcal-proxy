const { checkAuth } = require('./_google');

// Expected JSON body from the Vaani custom tool, called once near the end
// of every call:
// {
//   "callerName": "Trisha",
//   "phone": "9988223344",
//   "projectType": "Residential full home",
//   "location": "Hinjewadi",
//   "sizeSqft": "1100",
//   "timeline": "January 2027",
//   "budgetMentioned": "not mentioned",
//   "qualifiedStatus": "Qualified" | "Needs Review" | "Declined",
//   "consultationBooked": true,
//   "consultationDatetime": "2026-11-10T11:00:00+05:30",
//   "notes": "..."
// }
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!checkAuth(req, res)) return;

  const {
    callerName,
    phone,
    projectType,
    location,
    sizeSqft,
    timeline,
    budgetMentioned,
    qualifiedStatus,
    consultationBooked,
    consultationDatetime,
    notes,
    createdAt, // optional override for backfilling test/demo rows; the agent never sets this
  } = req.body || {};

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ success: false, error: 'Supabase not configured' });
  }

  try {
    const sbRes = await fetch(`${supabaseUrl}/rest/v1/calls`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        caller_name: callerName || null,
        phone: phone || null,
        project_type: projectType || null,
        location: location || null,
        size_sqft: sizeSqft || null,
        timeline: timeline || null,
        budget_mentioned: budgetMentioned || null,
        qualified_status: qualifiedStatus || null,
        consultation_booked: !!consultationBooked,
        consultation_datetime: consultationDatetime || null,
        notes: notes || null,
        ...(createdAt ? { created_at: createdAt } : {}),
      }),
    });

    const data = await sbRes.json();
    if (!sbRes.ok) {
      return res.status(sbRes.status).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true, row: data[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
