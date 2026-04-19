import { GoogleGenerativeAI } from '@google/generative-ai';

export const onRequestPost = async (context: any) => {
  const { env } = context;
  const db = env.DB;
  const geminiKey = env.GEMINI_API_KEY;

  try {
    // 1. Generate Blog Post
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `
      Write a professional, comprehensive, and engaging blog post (at least 600 words) about SongUpAI.com, an AI-powered music promotion engine.
      Include sections: 
      - Introduction to SongUpAI.
      - How our AI helps music creators get discovered.
      - Detailed features: AI-powered email personalization, campaign management, automated workflows, and CRM tools.
      - Why it is essential for modern music producers.
      - A strong Call to Action.
      Return the response as a JSON object with 'title', 'summary', 'body', and a 'topic_tag' field.
    `;
    const result = await model.generateContent(prompt);
    const post = JSON.parse(result.response.text());

    // 2. Generate a thematic image URL (using Unsplash source for thematic placeholders)
    const imageUrl = `https://source.unsplash.com/800x400/?music,ai,production&t=${Date.now()}`;

    // 3. Store in D1
    await db.prepare("INSERT INTO posts (title, summary, body, image_url, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(post.title, post.summary, post.body, imageUrl)
      .run();

    return new Response(JSON.stringify({ success: true, title: post.title }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
