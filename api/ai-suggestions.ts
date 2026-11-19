
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const tasks = req.body?.tasks || [];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as an intelligent task organiser. Analyse these tasks and provide 3 practical suggestions to improve productivity. Tasks: ${JSON.stringify(tasks)}`
    });

    return res.status(200).json({
      suggestions: response.text
    });

  } catch (error) {
    console.error('AI error:', error);
    return res.status(500).json({ error: 'AI request failed' });
  }
}
