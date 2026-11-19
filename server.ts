
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

app.post('/api/ai-suggestions', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `You are an AI task assistant. Analyse these tasks and suggest three useful improvements: ${JSON.stringify(req.body.tasks || [])}`
    });

    res.json({ suggestions: response.text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'AI request failed' });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
