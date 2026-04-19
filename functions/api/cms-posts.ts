export const onRequestGet = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const { results } = await db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  return new Response(JSON.stringify({ posts: results }), { headers: { 'Content-Type': 'application/json' }});
};

export const onRequestDelete = async (context: any) => {
  const { request, env } = context;
  const db = env.DB;
  const { id } = await request.json();
  await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ success: true }));
};
