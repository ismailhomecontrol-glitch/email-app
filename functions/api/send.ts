export const onRequestPost = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const geminiKey = env.GEMINI_API_KEY;
  const resendKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL || "support@prostack.store";

  if (!resendKey) return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: {'Content-Type': 'application/json'} });

  try {
    const config = await db.prepare("SELECT * FROM campaign_config WHERE id = 'settings'").first();
    if (config?.isPaused) return new Response(JSON.stringify({ error: "Campaign is paused" }), { status: 400, headers: {'Content-Type': 'application/json'} });

    const nextContact = await db.prepare("SELECT * FROM contacts WHERE status = 'pending' ORDER BY added_at ASC LIMIT 1").first();
    if (!nextContact) return new Response(JSON.stringify({ error: "No more pending contacts" }), { status: 200, headers: {'Content-Type': 'application/json'} });

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const prompt = `Write a short, personalized email for ${nextContact.name} about SongUpAI. Return JSON: {"subject": "...", "body": "..."}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const content = JSON.parse(cleanText);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: nextContact.email,
        subject: content.subject,
        html: content.body
      })
    });

    if (!resendResponse.ok) throw new Error(await resendResponse.text());

    await db.prepare("UPDATE contacts SET status = 'sent' WHERE email = ?").bind(nextContact.email).run();
    return new Response(JSON.stringify({ success: true, contact: nextContact.email }), { headers: {'Content-Type': 'application/json'} });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
};
