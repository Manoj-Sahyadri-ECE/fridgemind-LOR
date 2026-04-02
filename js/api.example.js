// ═══════════════════════════════════════
//  FridgeMind — api.js TEMPLATE
//
//  This file is safe to commit to GitHub.
//  The real api.js (with your actual key) is in .gitignore.
//
//  TO USE:
//  1. Copy this file and rename it to api.js
//  2. Replace YOUR_API_KEY_HERE with your real Claude API key
//  3. Get a free key at console.anthropic.com
// ═══════════════════════════════════════

const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
const MODEL = 'claude-haiku-4-5-20251001';

async function getRecipeFromClaude(ingredients, mood, diet) {
  const prompt = `You are a professional Indian chef and recipe expert. A user in India has these leftover ingredients: ${ingredients.join(', ')}.

Their mood is: ${mood}
Their dietary preference is: ${diet === 'none' ? 'no restriction' : diet}

Generate ONE perfect recipe that:
1. Uses MOST of the listed ingredients as the main components
2. Matches the mood perfectly (${mood} = ${getMoodContext(mood)})
3. Strictly follows the dietary preference: ${diet}
4. Is a REAL, named Indian dish or an Indian-inspired dish — not a generic "stir fry" or "curry"
5. Has a recipe name that EXACTLY matches what is being cooked

Respond ONLY with a valid JSON object in this exact format — no extra text, no markdown:
{
  "name": "Exact name of the dish (e.g. Aloo Palak Sabzi, Paneer Bhurji, Egg Fried Rice)",
  "tagline": "One short sentence describing this dish",
  "cookTime": "e.g. 25 minutes",
  "servings": "e.g. 2",
  "difficulty": "Easy / Medium / Hard",
  "ingredients": [
    "200g paneer, cubed",
    "2 medium tomatoes, chopped"
  ],
  "steps": [
    "Heat oil in a kadhai over medium heat.",
    "Add onions and sauté until golden."
  ],
  "tip": "Chef's tip or variation idea"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API request failed');
  }

  const data = await response.json();
  const recipe = JSON.parse(data.content[0].text);
  return recipe;
}

function getMoodContext(mood) {
  const ctx = {
    comfort:     'hearty, warming, filling, like home food',
    healthy:     'light, nutritious, low oil, lots of vegetables',
    quick:       'very fast to make, simple steps, minimal cooking time',
    adventurous: 'bold spices, unusual combinations, exciting flavours',
    festive:     'rich, special, impressive, suitable for guests',
    lazy:        'barely any cooking, minimal chopping, one pan',
  };
  return ctx[mood] || 'balanced and tasty';
}
