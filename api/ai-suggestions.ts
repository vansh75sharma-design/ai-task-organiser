
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const tasks = req.body?.tasks || [];

    const response = await fetch(
'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as an intelligent task organiser. Analyse these tasks and give 3 practical productivity suggestions: ${JSON.stringify(tasks)}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.4
          }
        }),
    signal: AbortSignal.timeout(45000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', response.status, data);
      return res.status(502).json({
        error: 'Gemini API error. Check Vercel logs.'
      });
    }

    const suggestions = data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || '')
      .join('\n');

    return res.status(200).json({
      suggestions: suggestions || 'Gemini returned no suggestions.'
    });

  } catch (error: any) {
    console.error('Gemini request failed:', error);

    return res.status(504).json({
      error: error.name === 'TimeoutError'
        ? 'Gemini request timed out. Please try again.'
        : 'Unable to connect to Gemini.'
    });
  }
}
