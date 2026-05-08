# 🌿 NourishDay

## Overview
NourishDay is a personalized daily meal suggestion app that recommends three meals per day consisting of breakfast, lunch, and dinner. These all have a total calorie count tailored to the individual user, following current U.S. Dietary Guidelines (HHS/USDA).

Users enter their age, biological sex, weight, height, and activity level. NourishDay calculates their daily calorie target using the Mifflin-St Jeor equation (the basis for USDA DRI recommendations), then generates a personalized meal plan from the Kaggle Daily Food & Nutrition Dataset. Users can filter by dietary restrictions, select cuisine preferences, save favorite meals, and prioritize saved meals in future plans.

**Live demo:** [nourish-day.vercel.app](https://nourish-day.vercel.app/)

---

## How to Run

### Prerequisites
- Node.js 18+

### Local setup
```bash
git clone https://github.com/megha-krish/NourishDay.git
cd NourishDay
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React (Vite) |
| Styling | Tailwind CSS + CSS custom properties |
| Data | Kaggle Daily Food & Nutrition Dataset |
| Persistence | localStorage (favorites + profile) |
| Deployment | Vercel |
| IDE | IntelliJ IDEA |

No paid external APIs. All meal generation runs locally in the browser from the bundled dataset.

---

## Architecture
```bash
src/

components/
ProfileForm.jsx     # Multi-section user profile form with validation
FavoritesPage.jsx   # Saved meals view grouped by meal type

utils/
calories.js         # Mifflin-St Jeor USDA calorie calculator
api.js              # Dataset loading, filtering, and meal selection logic
App.jsx             # App state, screen routing, MealCard, MacroChart
index.css           # Design tokens, global styles, animations

public/
nutrition.csv       # Kaggle Daily Food & Nutrition Dataset

```

**Data flow:**
1. User submits profile → `calculateDailyCalories()` computes target using USDA formula
2. `generateMealPlan()` fetches and parses `nutrition.csv`
3. Meals are filtered by dietary restrictions, then by cuisine keywords
4. One main + one compatible side dish is selected per meal slot
5. Results displayed with macro breakdown and calorie summary

---

## AI Tools Used

**Tools:** Claude (claude.ai), ChatGPT, IntelliJ IDEA (IDE)

**How I used them:**

- **Scaffolding:** Used Claude to set up the Vite + React + Tailwind project structure and initial component layout
- **Calorie logic:** Claude helped implement the Mifflin-St Jeor equation. I verified the formula independently against the USDA DRI Calculator before committing
- **Debugging:** Used Claude and ChatGPT to diagnose issues like the cuisine fallback bug, the calorie gap detection not triggering, and meals missing description fields in the saved meals flow
- **Dataset decisions:** AI helped me explore the Kaggle dataset structure and decide which categories to use as complete meals vs. sides
- **UI feedback:** Used Claude to think through empty states, disclaimers, and edge case messaging

**Prompts that worked well:**
- *"Look at this dataset: what categories should I filter to get only complete meals, not sides or snacks?"* --- automated thinking process, and led to decision about adding sides with complete meal
- *"The Indian + Vegetarian combination returns no meals — is this a dataset problem or a filtering problem, and what's the right fix?"* — led to the decision to expand keywords and add a fallback warning instead of just patching the filter
- *"My calorie warning isn't showing even when the plan is 600 calories short — walk me through why the condition might not be triggering"* — led to finding the duplicate `totalCalories` variable bug

**Where AI fell short:**
- AI couldn't tell me what was actually in the dataset, so I had to explore it myself and make judgment calls about which pairings made culinary sense
- AI suggested fixes for the hummus + hummus wrap pairing but I had to trace through the logic myself to understand why it wasn't being blocked
- Design decisions were mine. AI gave options but I decided what felt right visually. AI tends to make multiple mistakes, so it is important to be aware of their code choices.

---

## Key Design Decisions

**Dietary restrictions and cuisine selection:**
Users can select from common dietary restrictions (Vegetarian, Vegan, Gluten-Free, Nut-Free, Dairy-Free, Egg-Free, No Shellfish, Soy-Free) and up to 3 favorite cuisines. These are applied as hard filters on the dataset. Restrictions are never violated, and cuisine preferences are prioritized where the data allows. A disclaimer on the form sets expectations upfront that preferences aren't always guaranteed.

**Cuisine-aware side dish pairing:**
Instead of randomly pairing a main and a side based on the dataset, the app detects the cuisine of the main meal and selects a culturally compatible side from a curated keyword list. This prevents pairings like Paella + Hummus that are nutritionally fine but confusing based on cuisine.

**Fallback warnings over silent failures:**
When a cuisine + dietary restriction combination can't be fully satisfied by the dataset, the app shows an explicit warning rather than silently returning unrelated meals. Users need to know when their preferences couldn't be satisfied.

**Favorites and saved meal prioritization:**
Users can heart any meal to save it to a favorites list stored in localStorage. Once at least one meal is saved, a toggle appears on the meal plan page to prioritize saved meals in future plans. This makes the app feel like it learns from you over time as the more you use it, the more personalized it gets.

**localStorage for persistence:**
Profile data and saved meals are stored in localStorage, so no backend needed. This keeps the app stateless and deployable as a pure static site. The profile persists between sessions so users don't have to re-enter their information every time.


---

## Challenges & How I Solved Them

**Meal pairing quality:**
The hardest part was getting meal pairings to make culinary sense. The dataset categorizes food by nutrition type, not cuisine, so I built a cuisine detection layer using keyword matching. I also added overlap detection to prevent a meal from being paired with a side that shares a key ingredient (e.g. Hummus Wrap + Hummus).

**Limited dataset coverage:**
The Kaggle dataset has strong coverage for American and Mediterranean meals but limited Indian and Asian vegetarian options. When a combination yields fewer than 3 unique meals, the app falls back to the full filtered pool and notifies the user. I documented this as a known limitation.

**Calorie gap:**
Individual meals in the dataset are often lower calorie than the per-slot targets. I widened the selection tolerance to 70% and added a warning note when the plan total falls more than 15% below the user's target, suggesting they add snacks to compensate.

**Missing descriptions in saved meals flow:**
Meals returned through the saved meals fallback path were skipping `combineMeal`, which meant they had no `type` or `description` field. Fixed by routing all meal objects through `combineMeal` regardless of which path they came from.

---

## What I'd Improve With More Time

- **Larger dataset** — more meals, especially for Indian, Asian, and vegan/vegetarian combinations
- **Single meal regeneration** — swap just one meal slot instead of regenerating the full plan
- **Daily history** — store the last 7 days of meal plans in localStorage
- **User Login** - have users make multiple accounts and log-in to see their account history
- **Allergy support** — free-text allergy input beyond the preset restriction tags
- **Better calorie matching** — combine multiple smaller items to hit calorie targets more precisely
- **Unheart from meal card** — currently you remove saved meals from the Saved Meals page; ideally the heart button would toggle directly from the meal card
