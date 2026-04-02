async function getRecipeFromClaude(ingredients, mood, diet) {
  const response = await fetch('/.netlify/functions/recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, mood, diet }),
  });

  const raw = await response.text();
  console.log('Raw response:', raw);

  if (!response.ok) {
    throw new Error('Server error: ' + raw);
  }

  try {
    const recipe = JSON.parse(raw);
    return recipe;
  } catch(e) {
    throw new Error('Could not parse recipe: ' + raw);
  }
}