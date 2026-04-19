import { GoogleGenerativeAI } from '@google/generative-ai';

export const onRequestPost = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const geminiKey = env.GEMINI_API_KEY;

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const prompt = `Write a professional blog post about SongUpAI.com. Return JSON: {"title": "...", "summary": "...", "body": "..."}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const post = JSON.parse(cleanText);

    const imageUrl = `https://source.unsplash.com/800x400/?music,ai,production&t=${Date.now()}`;

    await db.prepare("INSERT INTO posts (title, summary, body, image_url, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(post.title, post.summary, post.body, imageUrl)
      .run();

    return new Response(JSON.stringify({ success: true, title: post.title }), { headers: {'Content-Type': 'application/json'} });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
};
