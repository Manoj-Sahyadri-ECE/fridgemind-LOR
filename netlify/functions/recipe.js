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