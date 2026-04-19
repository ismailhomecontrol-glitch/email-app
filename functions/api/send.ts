import { GoogleGenerativeAI } from '@google/generative-ai';

export const onRequestPost = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const geminiKey = env.GEMINI_API_KEY;
  const resendKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL || "onboarding@resend.dev";

  if (!resendKey) return new Response("RESEND_API_KEY not configured", { status: 500 });

  try {
    // 1. Check if campaign is paused
    const { results: config } = await db.prepare("SELECT * FROM campaign_config WHERE id = 'settings'").all();
    if (config[0]?.isPaused) return new Response("Campaign is paused", { status: 400 });

    // 2. Get the next pending contact (oldest first)
    const nextContact = await db.prepare("SELECT * FROM contacts WHERE status = 'pending' ORDER BY added_at ASC LIMIT 1").first();
    if (!nextContact) return new Response("No more pending contacts", { status: 200 });

    // 3. Generate Email with Gemini
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Write a short, conversational, and personalized email inviting a music creator named ${nextContact.name} to sign up for songupai.com.
      The goal is to get them to buy a subscription.
      Be natural, friendly, and avoid sounding like a bot.
      Return the response as JSON with 'subject' and 'body' fields.
    `;
    const result = await model.generateContent(prompt);
    const content = JSON.parse(result.response.text());

    // 4. Send via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: nextContact.email,
        subject: content.subject,
        html: content.body.replace(/\n/g, '<br>')
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend Error: ${error}`);
    }

    // 5. Update Status in D1
    await db.prepare("UPDATE contacts SET status = 'sent' WHERE email = ?").bind(nextContact.email).run();

    return new Response(JSON.stringify({ success: true, contact: nextContact.email }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
