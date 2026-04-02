async function getRecipeFromClaude(ingredients, mood, diet) {
  const response = await fetch('/.netlify/functions/recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, mood, diet }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Something went wrong');
  }

  const recipe = await response.json();
  return recipe;
}