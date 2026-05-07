# NourishDay — Core Requirements Document

## Challenge Requirements

| Requirement | Status | How It's Met |
|-------------|--------|--------------|
| Recommend 3 meals per day (breakfast, lunch, dinner) | ✅ | App generates exactly one breakfast, lunch, and dinner per plan |
| Total calorie count tailored to individual user | ✅ | Mifflin-St Jeor equation calculates personalized daily target based on age, sex, weight, height, activity level |
| Follow USDA/HHS Dietary Guidelines | ✅ | Calorie targets use USDA DRI formula; meal distribution follows 25/35/40 breakfast-lunch-dinner split per HHS guidelines |
| No paid external APIs | ✅ | All meal generation runs locally from the bundled Kaggle dataset — no API calls, no API keys |
| Working deployed app | ✅ | Live at [nourish-day.vercel.app](https://nourish-day.vercel.app/) |
| GitHub repo with meaningful commits | ✅ | Public repo at [github.com/megha-krish/NourishDay](https://github.com/megha-krish/NourishDay) |
| Complete README with AI usage documentation | ✅ | See README.md |

## Additional Features Built

| Feature | Description |
|---------|-------------|
| Dietary restrictions | Supports Vegetarian, Vegan, Gluten-Free, Nut-Free, Dairy-Free, Egg-Free, No Shellfish, Soy-Free |
| Cuisine preferences | Users pick up to 3 cuisines; meals are filtered and paired accordingly |
| Cuisine-aware side dish pairing | Sides are matched to the cuisine of the main meal to avoid mismatched pairings |
| Fallback warnings | Explicit message shown when cuisine + restriction combo can't be fully satisfied |
| Saved meals / Favorites | Users can heart meals and save them to a favorites list |
| Prioritize saved meals | Toggle to generate plans using previously saved meals |
| Macro breakdown chart | Visual bar showing protein/carbs/fat distribution across the day |
| Water intake recommendation | Per USDA guidelines, 8 cups/day shown with meal contribution estimate |
| Calorie gap warning | Note shown when plan total is more than 15% below target |
| Profile persistence | Profile saved to localStorage so users don't re-enter data |

## Data Source
**Kaggle Daily Food & Nutrition Dataset**
https://www.kaggle.com/datasets/adilshamim8/daily-food-and-nutrition-dataset

## Calorie Calculation Method
**Mifflin-St Jeor Equation** (USDA DRI basis)
- Male BMR: (10 × kg) + (6.25 × cm) - (5 × age) + 5
- Female BMR: (10 × kg) + (6.25 × cm) - (5 × age) - 161
- Multiplied by Physical Activity Level (PAL) factor (1.2–1.9)
- Rounded to nearest 50 calories

Reference: https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator

## Known Limitations
- The Kaggle dataset has limited Indian and Asian vegetarian meal options, so users selecting these combinations may see repeated meals or fallback to general options
- Individual meal calorie counts in the dataset are sometimes lower than per-slot targets; the app warns users and suggests adding snacks when the gap exceeds 15%