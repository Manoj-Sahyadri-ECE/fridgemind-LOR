exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { ingredients, mood, diet } = JSON.parse(event.body);

    const prompt = `You are a professional Indian chef from India. A user has these leftover ingredients: ${ingredients.join(', ')}.
Mood: ${mood}
Diet: ${diet === 'none' ? 'no restriction' : diet}

Create ONE specific, named Indian recipe. The name must be the EXACT traditional name of the dish you are making with those ingredients - not a generic description.

For example:
- eggs + onion + tomato = "Anda Bhurji" NOT "Egg scramble"
- paneer + spinach = "Palak Paneer" NOT "Paneer spinach curry"  
- potato + cauliflower = "Aloo Gobi" NOT "Mixed vegetable sabzi"
- bread + vegetables = "Bread Upma" or "Masala Toast"
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
      const req = https.request({
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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

    const groqResponse = JSON.parse(rawResponse);

    if (groqResponse.error) {
      throw new Error(groqResponse.error.message || 'Groq API error');
    }

    const text = groqResponse.choices[0].message.content;
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