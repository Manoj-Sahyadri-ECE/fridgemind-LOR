exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { ingredients, mood, diet } = JSON.parse(event.body);

    const prompt = `You are a professional Indian chef. A user in India has these leftover ingredients: ${ingredients.join(', ')}.
Mood: ${mood}
Diet: ${diet === 'none' ? 'no restriction' : diet}

Generate ONE real named Indian recipe using most of these ingredients.

Reply ONLY with this JSON, no extra text, no markdown, no backticks:
{
  "name": "Dish name e.g. Paneer Bhurji",
  "tagline": "One line description",
  "cookTime": "25 minutes",
  "servings": "2",
  "difficulty": "Easy",
  "ingredients": ["200g paneer", "2 tomatoes chopped"],
  "steps": ["Heat oil in kadhai", "Add onions and saute"],
  "tip": "A useful cooking tip"
}`;

    const https = require('https');
    const apiKey = process.env.GEMINI_API_KEY;

    const bodyStr = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
    });

    const rawResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(bodyStr);
      req.end();
    });

    const geminiResponse = JSON.parse(rawResponse);

    if (geminiResponse.error) {
      throw new Error(geminiResponse.error.message || 'Gemini API error');
    }

    const text = geminiResponse.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const recipe = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};