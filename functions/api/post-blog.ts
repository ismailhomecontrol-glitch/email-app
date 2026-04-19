export const onRequestPost = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const geminiKey = env.GEMINI_API_KEY;

  try {
    // 1. Generate Blog Post
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Write a modern, engaging blog post about AI in music production for songupai.com.
      Include a catchy title, a short summary, and the main post body.
      Return the response as a JSON object with 'title', 'summary', and 'body' fields.
    `;
    const result = await model.generateContent(prompt);
    const post = JSON.parse(result.response.text());

    // 2. Store in D1
    await db.prepare("INSERT INTO posts (title, summary, body, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(post.title, post.summary, post.body)
      .run();

    return new Response(JSON.stringify({ success: true, title: post.title }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
