const MEAT_CATEGORIES = ['Meal/Meat', 'Protein/Meat', 'Protein/Processed']
const FISH_CATEGORIES = ['Meal/Fish', 'Meal/Seafood', 'Protein/Fish', 'Protein/Seafood']
const DAIRY_CATEGORIES = ['Dairy', 'Dairy/Dessert', 'Condiment/Dairy', 'Protein/Dairy', 'Beverage/Dairy']
const GLUTEN_KEYWORDS = [
    'toast', 'bread', 'sandwich', 'wrap', 'tortilla', 'pasta', 'spaghetti',
    'noodle', 'croissant', 'bagel', 'biscuit', 'waffle', 'pancake', 'muffin',
    'donut', 'danish', 'cereal', 'granola', 'cracker', 'sub', 'lasagna',
    'macaroni', 'pita', 'roti', 'naan', 'couscous', 'barley', 'rye'
]

const EXCLUDED_CATEGORIES = [
    'Dessert', 'Snack', 'Condiment', 'Beverage', 'Snack/Processed',
    'Grain/Dessert', 'Beverage/Dairy', 'Beverage/Meal', 'Beverage/Dairy-Alt'
]

const COMPLETE_MEAL_CATEGORIES = [
    'Protein/Meat', 'Protein/Fish', 'Protein/Seafood', 'Protein/Vegetarian',
]

// What counts as a valid side for each meal slot
const SIDE_CATEGORIES = {
    Breakfast: ['Fruit'],
    Lunch:     ['Vegetable', 'Legume'],
    Dinner:    ['Vegetable', 'Legume'],
}

const CUISINE_KEYWORDS = {
    italian:       ['pasta', 'risotto', 'gnocchi', 'polenta', 'osso buco',
        'saltimbocca', 'ribollita', 'caponata', 'cacio e pepe',
        'spaghetti', 'lasagna', 'pizza', 'angel hair'],
    mexican:       ['taco', 'burrito', 'enchilada', 'quesadilla', 'tamale',
        'fajita', 'carnitas'],
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
        'paneer', 'masala', 'tandoori', 'dosa', 'korma', 'vindaloo'],
}

function parseCSV(text) {
    const lines = text.trim().split('\n')
    return lines.slice(1).map(line => {
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
            water:    parseFloat(values[11]) || 0,
        }
    }).filter(item => item.name && item.calories > 0)
}

function passesRestrictions(item, restrictions) {
    const cat = item.category || ''
    const nameLower = item.name.toLowerCase()

    if (restrictions.includes('vegetarian') || restrictions.includes('vegan')) {
        if (MEAT_CATEGORIES.includes(cat)) return false
        if (['beef', 'chicken', 'pork', 'bacon', 'ham', 'turkey',
            'sausage', 'pepperoni', 'bolognese', 'meat', 'lamb',
            'salami', 'prosciutto', 'chorizo', 'tuna', 'shrimp', 'fish', 'cheesesteak', 'steak'].some(w => nameLower.includes(w))) return false
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

    if (restrictions.includes('nut_free')) {
        if (['peanut', 'almond', 'cashew', 'walnut', 'pecan',
            'pistachio', 'hazelnut', 'macadamia', 'pine nut',
            'nut'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('dairy_free')) {
        if (DAIRY_CATEGORIES.includes(cat)) return false
        if (['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ghee',
            'whey', 'lactose', 'mozzarella', 'cheddar', 'parmesan',
            'ricotta', 'brie', 'gouda', 'feta', 'labneh',
            'gorgonzola', 'pecorino'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('egg_free')) {
        if (['egg', 'eggs benedict', 'omelette', 'frittata',
            'quiche', 'meringue'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('shellfish_free')) {
        if (FISH_CATEGORIES.includes(cat)) return false
        if (['shrimp', 'lobster', 'crab', 'scallop', 'clam',
            'mussel', 'oyster', 'crawfish', 'prawn',
            'calamari'].some(w => nameLower.includes(w))) return false
    }

    if (restrictions.includes('soy_free')) {
        if (['tofu', 'tempeh', 'edamame', 'miso', 'soy',
            'soyrizo', 'seitan'].some(w => nameLower.includes(w))) return false
    }

    return true
}

function applyCuisineFilter(meals, cuisines) {
    if (!cuisines || cuisines.length === 0) return meals
    const keywords = cuisines.flatMap(c => CUISINE_KEYWORDS[c] || [])
    if (keywords.length === 0) return meals
    const filtered = meals.filter(m =>
        keywords.some(kw => m.name.toLowerCase().includes(kw))
    )
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
        return [...meals].sort((a, b) =>
            Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories)
        )[0]
    }
    return pickRandom(inRange)
}

function pickMealBalanced(meals, cuisines, targetCalories, tolerancePct = 0.5) {
    if (!cuisines || cuisines.length === 0) {
        return pickMealNearTarget(meals, targetCalories, tolerancePct)
    }
    const shuffledCuisines = [...cuisines].sort(() => Math.random() - 0.5)
    for (const cuisine of shuffledCuisines) {
        const keywords = CUISINE_KEYWORDS[cuisine] || []
        const cuisineMeals = meals.filter(m =>
            keywords.some(kw => m.name.toLowerCase().includes(kw))
        )
        if (cuisineMeals.length > 0) {
            const result = pickMealNearTarget(cuisineMeals, targetCalories, tolerancePct)
            if (result) return result
        }
    }
    return pickMealNearTarget(meals, targetCalories, tolerancePct)
}

/**
 * Pick an optional side dish for a meal slot.
 * Returns null if no good side exists or side would push calories too high.
 */
const CUISINE_SIDES = {
    italian: ['broccoli', 'spinach', 'asparagus', 'zucchini',
        'cannellini', 'white beans', 'green beans'],
    mexican:       ['black beans', 'refried beans', 'corn', 'guacamole',
        'salsa', 'rice', 'pinto'],
    asian:         ['bok choy', 'edamame', 'rice', 'kimchi', 'bean sprouts',
        'seaweed', 'miso', 'green onion'],
    mediterranean: ['hummus', 'pita', 'tabbouleh', 'cucumber', 'olives',
        'lentil', 'chickpea', 'feta'],
    american:      ['coleslaw', 'corn', 'mac and cheese', 'potato',
        'green beans', 'biscuit', 'cornbread'],
    indian:        ['lentil', 'chickpea', 'spinach', 'cauliflower',
        'cucumber', 'rice', 'dal'],
}

function detectCuisine(foodName) {
    const nameLower = foodName.toLowerCase()
    for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
        if (keywords.some(kw => nameLower.includes(kw))) return cuisine
    }
    return null
}

function pickSide(allFoods, mealType, mainName, mainCalories, targetCalories, restrictions, usedNames) {
    const sideCategories = SIDE_CATEGORIES[mealType] || []
    const remainingCalories = targetCalories - mainCalories

    if (remainingCalories < 50) return null

    const detectedCuisine = detectCuisine(mainName)
    const compatibleKeywords = detectedCuisine ? CUISINE_SIDES[detectedCuisine] : null

    const sides = allFoods.filter(item => {
        if (usedNames.includes(item.name)) return false
        if (!sideCategories.includes(item.category)) return false
        if (!passesRestrictions(item, restrictions)) return false
        if (EXCLUDED_CATEGORIES.includes(item.category)) return false
        const min = remainingCalories * 0.3
        const max = remainingCalories * 1.2
        return item.calories >= min && item.calories <= max
    })

    if (sides.length === 0) return null

    if (compatibleKeywords) {
        const compatibleSides = sides.filter(s =>
            compatibleKeywords.some(kw => s.name.toLowerCase().includes(kw))
        )
        if (compatibleSides.length > 0) return pickRandom(compatibleSides)
        return null
    }
    return null
}
/**
 * Combine a main and optional side into one meal object
 */
function combineMeal(type, main, side) {
    const name = side ? `${main.name} + ${side.name}` : main.name
    return {
        type,
        name,
        mainName: main.name,
        sideName: side?.name || null,
        calories: Math.round(main.calories + (side?.calories || 0)),
        protein:  Math.round(main.protein  + (side?.protein  || 0)),
        carbs:    Math.round(main.carbs    + (side?.carbs    || 0)),
        fat:      Math.round(main.fat      + (side?.fat      || 0)),
        fiber:    Math.round(main.fiber    + (side?.fiber    || 0)),
        water:    Math.round(main.water    + (side?.water    || 0)),
        description: generateDescription({
            protein: main.protein + (side?.protein || 0),
            carbs:   main.carbs   + (side?.carbs   || 0),
            fat:     main.fat     + (side?.fat     || 0),
            fiber:   main.fiber   + (side?.fiber   || 0),
        }),
    }
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

    // Only complete meals — Meal/ categories or known protein sources
    const mains = allFoods.filter(item => {
        const cat = item.category || ''
        const isCompleteMeal = cat.startsWith('Meal/') || COMPLETE_MEAL_CATEGORIES.includes(cat)
        const isRealMealType = ['Breakfast', 'Lunch', 'Dinner'].includes(item.mealType)
        return isCompleteMeal && isRealMealType && passesRestrictions(item, restrictions)
    })

    if (mains.length < 3) {
        throw new Error('Not enough meals match your dietary restrictions. Try adjusting your filters.')
    }

    const cuisineFiltered = applyCuisineFilter(mains, cuisines)

    const breakfastPool = cuisineFiltered.filter(m => m.mealType === 'Breakfast')
    const lunchPool     = cuisineFiltered.filter(m => m.mealType === 'Lunch' || m.mealType === 'Dinner')
    const dinnerPool    = cuisineFiltered.filter(m => m.mealType === 'Dinner' || m.mealType === 'Lunch')

    const breakfastTarget = Math.round(calorieTarget * 0.25)
    const lunchTarget     = Math.round(calorieTarget * 0.35)
    const dinnerTarget    = Math.round(calorieTarget * 0.40)

    // Pick mains
    const breakfastMain = pickMealBalanced(
        breakfastPool.length > 0 ? breakfastPool : mains.filter(m => m.mealType === 'Breakfast'),
        breakfastPool.length > 0 ? cuisines : [],
        breakfastTarget
    )

    const lunchPoolFiltered = lunchPool.filter(m => m.name !== breakfastMain.name)
    const lunchMain = pickMealBalanced(
        lunchPoolFiltered.length > 0 ? lunchPoolFiltered : mains.filter(m =>
            (m.mealType === 'Lunch' || m.mealType === 'Dinner') && m.name !== breakfastMain.name
        ),
        lunchPoolFiltered.length > 0 ? cuisines : [],
        lunchTarget
    )

    const dinnerPoolFiltered = dinnerPool.filter(m =>
        m.name !== breakfastMain.name &&
        m.name !== lunchMain.name &&
        m.category !== lunchMain.category  // avoid same category as lunch
    )
    const dinnerMain = pickMealBalanced(
        dinnerPoolFiltered.length > 0 ? dinnerPoolFiltered : mains.filter(m =>
            (m.mealType === 'Dinner' || m.mealType === 'Lunch') &&
            m.name !== breakfastMain.name && m.name !== lunchMain.name
        ),
        dinnerPoolFiltered.length > 0 ? cuisines : [],
        dinnerTarget
    )

    // Pick optional sides
    const usedNames = [breakfastMain.name, lunchMain.name, dinnerMain.name]

    const breakfastSide = pickSide(allFoods, 'Breakfast', breakfastMain.name, breakfastMain.calories, breakfastTarget, restrictions, usedNames)

    const lunchSide = pickSide(allFoods, 'Lunch', lunchMain.name, lunchMain.calories, lunchTarget, restrictions, usedNames)

    const dinnerSide = pickSide(allFoods, 'Dinner', dinnerMain.name, dinnerMain.calories, dinnerTarget, restrictions, usedNames)

    // Combine mains + sides
    const breakfast = combineMeal('Breakfast', breakfastMain, breakfastSide)
    const lunch     = combineMeal('Lunch',     lunchMain,     lunchSide)
    const dinner    = combineMeal('Dinner',    dinnerMain,    dinnerSide)

    const totalCalories = breakfast.calories + lunch.calories + dinner.calories

    return {
        meals: [breakfast, lunch, dinner],
        totalCalories: Math.round(totalCalories),
        nutritionNote: `This plan provides approximately ${Math.round(totalCalories)} calories, following USDA guidelines with a 25/35/40 breakfast-lunch-dinner split.`,
    }
}