export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const db = env.DB;
  const data = await request.json();

  try {
    if (data.isPaused !== undefined) {
      await db.prepare("UPDATE campaign_config SET isPaused = ? WHERE id = 'settings'")
        .bind(data.isPaused ? 1 : 0)
        .run();
    }
    if (data.dailyLimit !== undefined) {
      await db.prepare("UPDATE campaign_config SET dailyLimit = ? WHERE id = 'settings'")
        .bind(data.dailyLimit)
        .run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
