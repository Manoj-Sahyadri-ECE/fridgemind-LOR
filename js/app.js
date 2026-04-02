// ═══════════════════════════════════════
//  FridgeMind — App Logic
//
//  This file runs the whole UI:
//  - Renders moods, diets, quick pills
//  - Handles ingredient add/remove
//  - Calls the Claude API
//  - Displays the recipe
// ═══════════════════════════════════════


// ── App State ──
// These three variables hold everything the app needs
let ingredients  = [];   // ['paneer', 'tomato', 'onion']
let selectedMood = '';   // 'comfort'
let selectedDiet = '';   // 'vegetarian'


// ═══════════════════════════════════════
//  INIT — runs when the page loads
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderMoods();
  renderDiets();
  renderQuickPills();
  setupIngredientInput();
});


// ═══════════════════════════════════════
//  RENDER FUNCTIONS
//  These build the UI from the data in data.js
// ═══════════════════════════════════════

function renderMoods() {
  const grid = document.getElementById('mood-grid');
  grid.innerHTML = MOODS.map(m => `
    <div class="mood-card" data-mood="${m.id}" onclick="selectMood('${m.id}', this)">
      <div class="mood-icon">${m.icon}</div>
      <div class="mood-name">${m.name}</div>
      <div class="mood-hint">${m.hint}</div>
    </div>
  `).join('');
}

function renderDiets() {
  const row = document.getElementById('diet-row');
  row.innerHTML = DIETS.map(d => `
    <div class="diet-chip" data-diet="${d.id}" onclick="selectDiet('${d.id}', this)">
      ${d.label}
    </div>
  `).join('');
}

function renderQuickPills() {
  const container = document.getElementById('quick-pills');
  container.innerHTML = QUICK_INGREDIENTS.map(name => `
    <span class="quick-pill" data-name="${name}" onclick="quickAdd('${name}')">
      ${name}
    </span>
  `).join('');
}


// ═══════════════════════════════════════
//  INGREDIENT FUNCTIONS
// ═══════════════════════════════════════

function setupIngredientInput() {
  const input = document.getElementById('ingredient-input');
  const addBtn = document.getElementById('add-btn');

  // Press Enter to add
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addIngredient();
  });

  // Click Add button
  addBtn.addEventListener('click', addIngredient);
}

function addIngredient() {
  const input = document.getElementById('ingredient-input');
  const raw   = input.value.trim();
  if (!raw) return;

  const name = raw.toLowerCase();

  // Don't add duplicates
  if (ingredients.includes(name)) {
    input.value = '';
    input.focus();
    return;
  }

  ingredients.push(name);
  input.value = '';
  input.focus();

  renderChips();
  updateQuickPillState(capitalize(raw));
}

function quickAdd(name) {
  const lower = name.toLowerCase();
  if (ingredients.includes(lower)) return;

  ingredients.push(lower);
  renderChips();
  updateQuickPillState(name);
}

function removeIngredient(name) {
  ingredients = ingredients.filter(i => i !== name);
  renderChips();

  // Re-enable the quick pill if it exists
  const pill = document.querySelector(`.quick-pill[data-name="${capitalize(name)}"]`);
  if (pill) pill.classList.remove('used');
}

function renderChips() {
  const container = document.getElementById('chip-container');
  if (ingredients.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = ingredients.map(name => `
    <div class="chip">
      ${name}
      <button class="chip-remove" onclick="removeIngredient('${name}')" title="Remove">&#215;</button>
    </div>
  `).join('');
}

function updateQuickPillState(name) {
  const pill = document.querySelector(`.quick-pill[data-name="${name}"]`);
  if (pill) pill.classList.add('used');
}


// ═══════════════════════════════════════
//  MOOD & DIET SELECTION
// ═══════════════════════════════════════

function selectMood(mood, el) {
  selectedMood = mood;
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function selectDiet(diet, el) {
  selectedDiet = diet;
  document.querySelectorAll('.diet-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}


// ═══════════════════════════════════════
//  MAIN ACTION — Find Recipe
// ═══════════════════════════════════════

async function findRecipe() {
  const validationMsg = document.getElementById('validation-msg');

  // Validate inputs
  if (ingredients.length === 0 || !selectedMood) {
    validationMsg.classList.remove('hidden');
    return;
  }
  validationMsg.classList.add('hidden');

  // Hide old recipe + errors
  document.getElementById('recipe-section').classList.add('hidden');
  document.getElementById('error-box').classList.add('hidden');

  // Show loading spinner
  showLoading(true);

  try {
    const diet = selectedDiet || 'none';
    const recipe = await getRecipeFromClaude(ingredients, selectedMood, diet);
    displayRecipe(recipe);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please check your API key and try again.');
  } finally {
    showLoading(false);
  }
}


// ═══════════════════════════════════════
//  DISPLAY RECIPE
// ═══════════════════════════════════════

function displayRecipe(recipe) {
  // Name & tagline
  document.getElementById('recipe-name').textContent     = recipe.name    || 'Your Recipe';
  document.getElementById('recipe-tagline').textContent  = recipe.tagline || '';

  // Meta info (time, servings, difficulty)
  document.getElementById('recipe-meta').innerHTML = `
    <div class="meta-item">⏱ ${recipe.cookTime || '—'}</div>
    <div class="meta-item">🍽 ${recipe.servings || '—'} serving(s)</div>
    <div class="meta-item">📊 ${recipe.difficulty || '—'}</div>
  `;

  // Ingredients list
  const ingList = document.getElementById('recipe-ingredients');
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) {
    ingList.innerHTML = recipe.ingredients.map(ing => `
      <li>
        <span class="ing-dot"></span>
        ${ing}
      </li>
    `).join('');
  } else {
    ingList.innerHTML = '<li><span class="ing-dot"></span>See steps for ingredients</li>';
  }

  // Steps
  const stepsList = document.getElementById('recipe-steps');
  if (Array.isArray(recipe.steps) && recipe.steps.length) {
    stepsList.innerHTML = recipe.steps.map((step, i) => `
      <li>
        <span class="step-num">${i + 1}</span>
        <span>${step}</span>
      </li>
    `).join('');
  } else {
    stepsList.innerHTML = '<li><span class="step-num">1</span><span>Follow the recipe instructions.</span></li>';
  }

  // Chef tip (optional)
  const tipBox = document.getElementById('recipe-tip-box');
  if (recipe.tip) {
    tipBox.innerHTML = `<div class="tip-label">💡 Chef's Tip</div>${recipe.tip}`;
    tipBox.classList.add('visible');
  } else {
    tipBox.classList.remove('visible');
  }

  // Show the recipe card
  const section = document.getElementById('recipe-section');
  section.classList.remove('hidden');

  // Smooth scroll to it
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}


// ═══════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════

function showLoading(visible) {
  const el   = document.getElementById('loading-section');
  const btn  = document.getElementById('find-btn');

  if (visible) {
    el.classList.remove('hidden');
    btn.disabled = true;
    btn.textContent = 'Finding recipe...';
    startLoadingMessages();
  } else {
    el.classList.add('hidden');
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🍽</span> Find My Recipe';
    stopLoadingMessages();
  }
}

let loadingInterval = null;

function startLoadingMessages() {
  let i = 0;
  const el = document.getElementById('loader-text');
  el.textContent = LOADING_MESSAGES[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    el.textContent = LOADING_MESSAGES[i];
  }, 1800);
}

function stopLoadingMessages() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

function showError(message) {
  const box = document.getElementById('error-box');
  const msg = document.getElementById('error-msg');
  msg.textContent = '⚠ ' + message;
  box.classList.remove('hidden');
}

function dismissError() {
  document.getElementById('error-box').classList.add('hidden');
}

function tryAgain() {
  document.getElementById('recipe-section').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveRecipe() {
  // Phase 2 will connect this to Firebase
  alert('💾 Saved! (Firebase login coming in Phase 2)');
}

// Simple capitalize helper
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Expose findRecipe globally (called from HTML button)
window.findRecipe = findRecipe;
window.tryAgain   = tryAgain;
window.saveRecipe = saveRecipe;
window.dismissError = dismissError;
