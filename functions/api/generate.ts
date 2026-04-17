import { GoogleGenerativeAI } from '@google/generative-ai';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const data = await request.json();
  const { contactName } = data;

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    Write a short, conversational, and personalized email inviting a music creator/producer named ${contactName} to sign up for songupai.com.
    The goal is to get them to buy a subscription.
    Be natural, friendly, and avoid sounding like a bot.
    Make the subject line unique, curious, and engaging.
    Return the response as a JSON object with 'subject' and 'body' fields.
  `;

  const result = await model.generateContent(prompt);
  const response = JSON.parse(result.response.text());

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
};
