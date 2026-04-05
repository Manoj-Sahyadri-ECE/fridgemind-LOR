export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { ingredients, mood, diet } = req.body;

    const prompt = `You are a professional Indian chef from India. A user has these leftover ingredients: ${ingredients.join(', ')}.
Mood: ${mood}
Diet: ${diet === 'none' ? 'no restriction' : diet}

Create ONE specific, named Indian recipe. The name must be the EXACT traditional name of the dish.

For example:
- eggs + onion + tomato = "Anda Bhurji"
- paneer + spinach = "Palak Paneer"
- potato + cauliflower = "Aloo Gobi"
- bread + vegetables = "Bread Upma"
- maggi + paneer + cheese = "Cheesy Paneer Maggi"

Reply ONLY with this JSON, no extra text, no markdown, no backticks:
{
  "name": "Exact traditional Indian dish name",
  "tagline": "One mouth-watering line about this dish",
  "cookTime": "X minutes",
  "servings": "2",
  "difficulty": "Easy",
  "ingredients": ["quantity + ingredient + preparation"],
  "steps": ["Clear step starting with action verb"],
  "tip": "One genuine chef tip specific to this dish"
}`;

    const https = require('https');
    const apiKey = process.env.GROQ_API_KEY;

    const bodyStr = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const rawResponse = await new Promise((resolve, reject) => {
      const req2 = https.request({
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      }, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => resolve(data));
      });
      req2.on('error', reject);
      req2.write(bodyStr);
      req2.end();
    });

    const groqResponse = JSON.parse(rawResponse);

    if (groqResponse.error) {
      throw new Error(groqResponse.error.message || 'Groq API error');
    }

    const text = groqResponse.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const recipe = JSON.parse(cleaned);

    return res.status(200).json(recipe);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}