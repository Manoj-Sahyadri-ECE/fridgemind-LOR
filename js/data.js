// ═══════════════════════════════════════
//  FridgeMind — Static Data
//  All the content arrays live here
// ═══════════════════════════════════════

const MOODS = [
  { id: 'comfort',     icon: '🫕', name: 'Comfort',     hint: 'Warm & cozy' },
  { id: 'healthy',     icon: '🥗', name: 'Healthy',     hint: 'Light & fresh' },
  { id: 'quick',       icon: '⚡', name: 'Quick',       hint: 'Under 20 mins' },
  { id: 'adventurous', icon: '🌶️', name: 'Adventurous', hint: 'Bold flavours' },
  { id: 'festive',     icon: '🪔', name: 'Festive',     hint: 'Special occasion' },
  { id: 'lazy',        icon: '😴', name: 'Lazy',        hint: 'Minimal effort' },
];

const DIETS = [
  { id: 'none',        label: 'No restriction' },
  { id: 'vegetarian',  label: 'Vegetarian' },
  { id: 'vegan',       label: 'Vegan' },
  { id: 'jain',        label: 'Jain' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'halal',       label: 'Halal' },
  { id: 'keto',        label: 'Keto' },
];

const QUICK_INGREDIENTS = [
  'Eggs', 'Rice', 'Onion', 'Tomato', 'Paneer',
  'Potato', 'Dal', 'Roti', 'Chicken', 'Bread',
  'Curd', 'Spinach', 'Garlic', 'Ginger', 'Chilli',
];

// Loading messages that rotate while Claude is thinking
const LOADING_MESSAGES = [
  'Checking your fridge...',
  'Thinking like a chef...',
  'Finding the perfect Indian recipe...',
  'Adding the right masalas...',
  'Almost ready...',
];
