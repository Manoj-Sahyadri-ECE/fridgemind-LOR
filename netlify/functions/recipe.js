const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { ingredients, mood, diet } = JSON.parse(event.body);

    const prompt = `You are a professional Indian chef and recipe expert. A user in India has these leftover ingredients: ${ingredients.join(', ')}.

Their mood is: ${mood}
Their dietary preference is: ${diet === 'none' ? 'no restriction' : diet}

Generate ONE perfect recipe that:
1. Uses MOST of the listed ingredients as the main components
2. Matches the mood perfectly
3. Strictly follows the dietary preference: ${diet}
4. Is a REAL, named Indian dish — not a generic dish
5. Has a recipe name that EXACTLY matches what is being cooked

Respond ONLY with a valid JSON object, no extra text, no markdown:
{
  "name": "Exact dish name e.g. Paneer Bhurji, Aloo Palak",
  "tagline": "One line description",
  "cookTime": "e.g. 25 minutes",
  "servings": "e.g. 2",
  "difficulty": "Easy / Medium / Hard",
  "ingredients": ["200g paneer, cubed", "2 tomatoes, chopped"],
  "steps": ["Heat oil in kadhai...", "Add onions..."],
  "tip": "Chef tip or variation"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const recipe = JSON.parse(data.content[0].text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};