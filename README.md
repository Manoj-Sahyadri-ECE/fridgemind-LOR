# 🍽 FridgeMind — Cook What You Have

> Tell it your leftover ingredients and your mood. Get a real Indian recipe instantly.

Live demo: [your-netlify-url-here]

---

## What it does

FridgeMind takes the ingredients left in your fridge and your current mood, and generates a real, named Indian recipe using Claude AI. No more wasting food or staring blankly at your pantry.

- Add your leftover ingredients as chips
- Pick your mood (Comfort, Healthy, Quick, Adventurous, Festive, Lazy)
- Set your dietary preference (Vegetarian, Vegan, Jain, Halal, Keto, etc.)
- Get a real Indian recipe with ingredients, steps, cook time, and a chef's tip

---

## Tech stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | HTML + CSS + Vanilla JS     |
| Styling   | Custom CSS + Google Fonts   |
| AI        | Claude API (Haiku model)    |
| Deploy    | Netlify (free)              |

No framework. No npm. No build step. Open `index.html` and it works.

---

## Project structure

```
fridgemind/
├── index.html        ← Main page (all UI)
├── css/
│   └── style.css     ← All styling
├── js/
│   ├── data.js       ← Static data (moods, diets, ingredients)
│   ├── api.js        ← Claude API integration
│   └── app.js        ← All app logic
└── README.md
```

---

## How to run locally

1. Clone this repo
```bash
git clone https://github.com/YOUR_USERNAME/fridgemind.git
cd fridgemind
```

2. Open `js/api.js` and replace `YOUR_API_KEY_HERE` with your Claude API key
   - Get one free at [console.anthropic.com](https://console.anthropic.com)

3. Open `index.html` in your browser — that's it. No server needed.

---

## How to deploy (Netlify — free)

1. Push your code to GitHub (without the API key — see below)
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Connect your GitHub repo
4. Add environment variable: `ANTHROPIC_API_KEY = your_key_here`
5. Deploy — you get a live URL in 30 seconds

---

## ⚠ Keeping your API key safe

**Never commit your API key to GitHub.**

Before pushing:
1. In `js/api.js`, make sure the key says `YOUR_API_KEY_HERE`
2. Store the real key in Netlify's environment variables (Settings → Environment)

---

## Roadmap

- [x] Phase 1 — Core recipe generation with mood + diet
- [ ] Phase 2 — Firebase login + save recipes
- [ ] Phase 3 — Weekly community challenge + public feed

---

## Built by

[Your Name] — ECE Student  
Built with Claude AI by Anthropic
