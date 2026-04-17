export const onRequestGet = async (context: any) => {
  const { env } = context;
  const db = env.DB;

  try {
    const { results: contacts } = await db.prepare("SELECT * FROM contacts").all();
    const { results: config } = await db.prepare("SELECT * FROM campaign_config WHERE id = 'settings'").all();
    
    const stats = {
      total: contacts.length,
      sent: contacts.filter((c: any) => c.status === 'sent').length,
      pending: contacts.filter((c: any) => c.status === 'pending').length,
    };

    return new Response(JSON.stringify({ contacts, stats, config: config[0] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const db = env.DB;
  const { emails } = await request.json();

  try {
    const stmt = db.prepare("INSERT OR IGNORE INTO contacts (email, name, status) VALUES (?, ?, ?)");
    const batch = emails.map((email: string) => stmt.bind(email, email.split('@')[0], 'pending'));
    await db.batch(batch);

    return new Response(JSON.stringify({ success: true, count: emails.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
