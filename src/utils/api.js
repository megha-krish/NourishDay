/**
 * Meal generation from the Kaggle Daily Food & Nutrition Dataset.
 * Source: https://www.kaggle.com/datasets/adilshamim8/daily-food-and-nutrition-dataset
 *
 * Strategy:
 * 1. Load and parse the CSV (bundled in /public/nutrition.csv)
 * 2. Filter to complete meals only (Category starts with "Meal/")
 * 3. Apply dietary restriction filters
 * 4. Apply cuisine preference filters (keyword-based, with fallback)
 * 5. For each meal type (Breakfast/Lunch/Dinner), pick a random meal
 *    whose calories fit within the target distribution
 * 6. Return in the same shape the rest of the app expects
 */

const MEAT_CATEGORIES = ['Meal/Meat', 'Protein/Meat', 'Protein/Processed']
const FISH_CATEGORIES = ['Meal/Fish', 'Meal/Seafood', 'Protein/Fish', 'Protein/Seafood']
const DAIRY_CATEGORIES = ['Dairy', 'Dairy/Dessert', 'Condiment/Dairy', 'Protein/Dairy', 'Beverage/Dairy']
const GLUTEN_KEYWORDS = [
    'toast', 'bread', 'sandwich', 'wrap', 'tortilla', 'pasta', 'spaghetti',
    'noodle', 'croissant', 'bagel', 'biscuit', 'waffle', 'pancake', 'muffin',
    'donut', 'danish', 'cereal', 'granola', 'cracker', 'sub', 'lasagna',
    'macaroni', 'pita', 'roti', 'naan', 'couscous', 'barley', 'rye'
]

// Keyword map for cuisine filtering — matched against food name (lowercase)
const CUISINE_KEYWORDS = {
    italian:       ['pasta', 'risotto', 'gnocchi', 'polenta', 'osso buco',
        'saltimbocca', 'ribollita', 'caponata', 'cacio e pepe',
        'spaghetti', 'lasagna', 'pizza', 'angel hair'],
    mexican:       ['taco', 'burrito', 'enchilada', 'quesadilla', 'tamale',
        'guacamole', 'salsa', 'fajita', 'carnitas', 'churro'],
    asian:         ['stir-fry', 'stir fry', 'sushi', 'ramen', 'fried rice',
        'tofu', 'miso', 'teriyaki', 'pad thai', 'dumpling',
        'tempura', 'pho', 'bibimbap', 'kimchi', 'udon'],
    mediterranean: ['hummus', 'falafel', 'shawarma', 'tabouli', 'fattoush',
        'kibbeh', 'manakeesh', 'labneh', 'tawook', 'lentil soup',
        'baba ganoush', 'grape leaves', "za'atar"],
    american:      ['burger', 'sandwich', 'bbq', 'mac and cheese', 'hot dog',
        'pancake', 'waffle', 'meatloaf', 'pot roast', 'cornbread',
        'biscuits and gravy', 'pulled pork', 'reuben', 'club'],
    indian:        ['curry', 'dal', 'biryani', 'tikka', 'naan', 'samosa',
        'paneer', 'chutney', 'masala', 'tandoori', 'dosa',
        'raita', 'korma', 'vindaloo'],
}

function parseCSV(text) {
    const lines = text.trim().split('\n')

    return lines.slice(1).map(line => {
        // Handle quoted fields with commas inside (e.g. "Milk (2%, 1 cup)")
        const values = []
        let current = ''
        let inQuotes = false
        for (const char of line) {
            if (char === '"') { inQuotes = !inQuotes }
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
            else { current += char }
        }
        values.push(current.trim())

        return {
            name:     values[0],
            category: values[1],
            calories: parseFloat(values[2]) || 0,
            protein:  parseFloat(values[3]) || 0,
            carbs:    parseFloat(values[4]) || 0,
            fat:      parseFloat(values[5]) || 0,
            fiber:    parseFloat(values[6]) || 0,
            mealType: values[10],
        }
    }).filter(item => item.name && item.calories > 0)
}

function passesRestrictions(item, restrictions) {
    const cat = item.category || ''
    const nameLower = item.name.toLowerCase()

    if (restrictions.includes('vegetarian') || restrictions.includes('vegan')) {
        if (MEAT_CATEGORIES.includes(cat)) return false
        if (['beef', 'chicken', 'pork', 'bacon', 'ham', 'turkey',
            'sausage', 'pepperoni'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('vegan')) {
        if (FISH_CATEGORIES.includes(cat)) return false
        if (DAIRY_CATEGORIES.includes(cat)) return false
        if (['egg', 'cheese', 'milk', 'yogurt', 'butter', 'cream',
            'honey', 'tuna', 'salmon', 'shrimp'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('gluten_free')) {
        if (GLUTEN_KEYWORDS.some(kw => nameLower.includes(kw))) return false
    }

    return true
}

/**
 * Filter meals by cuisine preferences.
 * If cuisines selected, keep meals that match ANY selected cuisine.
 * Falls back to full pool if nothing matches (prevents empty results).
 */
function applyCuisineFilter(meals, cuisines) {
    if (!cuisines || cuisines.length === 0) return meals

    const keywords = cuisines.flatMap(c => CUISINE_KEYWORDS[c] || [])
    if (keywords.length === 0) return meals

    const filtered = meals.filter(m =>
        keywords.some(kw => m.name.toLowerCase().includes(kw))
    )

    // Fallback: if cuisine filter is too restrictive, use full pool
    return filtered.length >= 3 ? filtered : meals
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function pickMealNearTarget(meals, targetCalories, tolerancePct = 0.5) {
    const min = targetCalories * (1 - tolerancePct)
    const max = targetCalories * (1 + tolerancePct)
    const inRange = meals.filter(m => m.calories >= min && m.calories <= max)

    if (inRange.length === 0) {
        const sorted = [...meals].sort((a, b) =>
            Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories)
        )
        return sorted[0]
    }
    return pickRandom(inRange)
}

function generateDescription(item) {
    const highlights = []
    if (item.protein >= 20) highlights.push('high in protein')
    if (item.fiber >= 5)    highlights.push('rich in fiber')
    if (item.fat <= 10)     highlights.push('low in fat')
    if (item.carbs >= 40)   highlights.push('great energy source')

    const base = highlights.length > 0
        ? `A nutritious meal that is ${highlights.join(' and ')}.`
        : 'A balanced, wholesome meal.'

    return `${base} Provides ${item.protein}g protein, ${item.carbs}g carbs, and ${item.fat}g fat.`
}

export async function generateMealPlan({ calorieTarget, restrictions, cuisines }) {
    const response = await fetch('/nutrition.csv')
    if (!response.ok) throw new Error('Could not load nutrition dataset.')
    const text = await response.text()

    const allFoods = parseCSV(text)

    // Keep complete meals + items with a mealType (fixes sparse breakfast pool issue)
    const meals = allFoods.filter(item =>
        (item.category?.startsWith('Meal/') || item.mealType) &&
        passesRestrictions(item, restrictions)
    )

    if (meals.length < 3) {
        throw new Error('Not enough meals match your dietary restrictions. Try adjusting your filters.')
    }

    // Apply cuisine filter to the full pool first
    const cuisineFiltered = applyCuisineFilter(meals, cuisines)

    // Split by meal type from cuisine-filtered pool
    const breakfastPool = cuisineFiltered.filter(m => m.mealType === 'Breakfast')
    const lunchPool     = cuisineFiltered.filter(m => m.mealType === 'Lunch' || m.mealType === 'Dinner')
    const dinnerPool    = cuisineFiltered.filter(m => m.mealType === 'Dinner' || m.mealType === 'Lunch')

    // USDA distribution: 25% breakfast, 35% lunch, 40% dinner
    const breakfastTarget = Math.round(calorieTarget * 0.25)
    const lunchTarget     = Math.round(calorieTarget * 0.35)
    const dinnerTarget    = Math.round(calorieTarget * 0.40)

    const breakfast = pickMealNearTarget(breakfastPool.length > 0 ? breakfastPool : cuisineFiltered, breakfastTarget)
    const lunch     = pickMealNearTarget(lunchPool.length > 0 ? lunchPool : cuisineFiltered, lunchTarget)
    const dinner    = pickMealNearTarget(dinnerPool.length > 0 ? dinnerPool : cuisineFiltered, dinnerTarget)

    const totalCalories = breakfast.calories + lunch.calories + dinner.calories

    return {
        meals: [
            {
                type: 'Breakfast', name: breakfast.name,
                description: generateDescription(breakfast),
                calories: Math.round(breakfast.calories),
                protein:  Math.round(breakfast.protein),
                carbs:    Math.round(breakfast.carbs),
                fat:      Math.round(breakfast.fat),
            },
            {
                type: 'Lunch', name: lunch.name,
                description: generateDescription(lunch),
                calories: Math.round(lunch.calories),
                protein:  Math.round(lunch.protein),
                carbs:    Math.round(lunch.carbs),
                fat:      Math.round(lunch.fat),
            },
            {
                type: 'Dinner', name: dinner.name,
                description: generateDescription(dinner),
                calories: Math.round(dinner.calories),
                protein:  Math.round(dinner.protein),
                carbs:    Math.round(dinner.carbs),
                fat:      Math.round(dinner.fat),
            },
        ],
        totalCalories: Math.round(totalCalories),
        nutritionNote: `This plan provides approximately ${Math.round(totalCalories)} calories, following USDA guidelines with a 25/35/40 breakfast-lunch-dinner split.`,
    }
}