/**
 * Calculates estimated daily calorie needs using the Mifflin-St Jeor equation,
 * which is the standard for USDA/HHS Dietary Guidelines recommendations.
 *
 * Main source: https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator
 *
 * BMR formula:
 *   Male:  (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 *   Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 *
 * After that, multiply by activity factor (PAL - Physical Activity Level)
 */

export const ACTIVITY_LEVELS = [
    { value: 'sedentary',    label: 'Sedentary',          description: 'Little or no exercise',              factor: 1.2   },
    { value: 'light',        label: 'Lightly Active',      description: '1–3 days/week exercise',             factor: 1.375 },
    { value: 'moderate',     label: 'Moderately Active',   description: '3–5 days/week exercise',             factor: 1.55  },
    { value: 'active',       label: 'Very Active',         description: '6–7 days/week hard exercise',        factor: 1.725 },
    { value: 'extra_active', label: 'Extra Active',        description: 'Physical job or twice/day training', factor: 1.9   },
]

export const DIETARY_RESTRICTIONS = [
    { value: 'vegetarian',  label: 'Vegetarian',   emoji: '🥦' },
    { value: 'vegan',       label: 'Vegan',        emoji: '🌱' },
    { value: 'gluten_free', label: 'Gluten-Free',  emoji: '🌾' },
    { value: 'nut_free',    label: 'Nut-Free',     emoji: '🥜' },
    { value: 'dairy_free',  label: 'Dairy-Free',   emoji: '🥛' },
    { value: 'egg_free',    label: 'Egg-Free',     emoji: '🥚' },
    { value: 'shellfish_free', label: 'No Shellfish', emoji: '🦐' },
    { value: 'soy_free',    label: 'Soy-Free',     emoji: '🫘' },
]

export const CUISINES = [
    { value: 'italian',       label: 'Italian',       emoji: '🍝' },
    { value: 'mexican',       label: 'Mexican',       emoji: '🌮' },
    { value: 'asian',         label: 'Asian',         emoji: '🍜' },
    { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
    { value: 'american',      label: 'American',      emoji: '🍔' },
    { value: 'indian',        label: 'Indian',        emoji: '🍛' },
]

/**
 * @param {Object} profile
 * @param {number} profile.age
 * @param {'male'|'female'} profile.sex
 * @param {number} profile.weightLbs
 * @param {number} profile.heightFt
 * @param {number} profile.heightIn
 * @param {string} profile.activityLevel
 * @returns {number} daily calorie target (rounded to nearest 50)
 */
export function calculateDailyCalories(profile) {
    const { age, sex, weightLbs, heightFt, heightIn, activityLevel } = profile

    // convert to metric
    const weightKg = weightLbs * 0.453592
    const heightCm = ((Number(heightFt) * 12) + Number(heightIn)) * 2.54

    // Mifflin-St Jeor BMR
    let bmr
    if (sex === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
    }
    const activity = ACTIVITY_LEVELS.find(a => a.value === activityLevel)
    const factor = activity ? activity.factor : 1.2

    const tdee = bmr * factor

    // round to nearest 50 (consistent with USDA outputs)
    return Math.round(tdee / 50) * 50
}