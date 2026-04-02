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

Reply ONLY with this JSON, no extra text:
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

    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const recipeText = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    const parsed = JSON.parse(recipeText);
    const recipe = JSON.parse(parsed.content[0].text);

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