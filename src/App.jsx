import { useState } from 'react'
import ProfileForm from './components/ProfileForm'
import { calculateDailyCalories } from './utils/calories'
import { generateMealPlan } from './utils/api'
import './App.css'

export default function App() {
    const [profile, setProfile] = useState(null)
    const [mealPlan, setMealPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleProfileSubmit(formData) {
        setProfile(formData)
        setLoading(true)
        setError(null)
        try {
            const calorieTarget = calculateDailyCalories(formData)
            const plan = await generateMealPlan({
                calorieTarget,
                restrictions: formData.restrictions,
                cuisines: formData.cuisines,
            })
            setMealPlan({ ...plan, calorieTarget, profile: formData })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleRegenerate() {
        if (!profile) return
        setLoading(true)
        setError(null)
        try {
            const calorieTarget = calculateDailyCalories(profile)
            const plan = await generateMealPlan({
                calorieTarget,
                restrictions: profile.restrictions,
                cuisines: profile.cuisines,
            })
            setMealPlan({ ...plan, calorieTarget, profile })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleEditProfile() {
        setMealPlan(null)
        setError(null)
    }

    if (loading) return <LoadingScreen />
    if (error)   return <ErrorScreen message={error} onBack={() => setError(null)} />
    if (mealPlan) return (
        <MealPlanView
            plan={mealPlan}
            onRegenerate={handleRegenerate}
            onEdit={handleEditProfile}
        />
    )
    return <ProfileForm onSubmit={handleProfileSubmit} initialProfile={profile} />
}

// ── Loading ──────────────────────────────────────────────────────────────────

function LoadingScreen() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
            <span style={{ fontSize: 48 }}>🌿</span>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>Building your meal plan…</p>
        </div>
    )
}

// ── Error ────────────────────────────────────────────────────────────────────

function ErrorScreen({ message, onBack }) {
    return (
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 48 }}>⚠️</span>
            <h2 style={{ marginTop: 16 }}>Something went wrong</h2>
            <p style={{ color: 'var(--muted)' }}>{message}</p>
            <button className="btn-primary" onClick={onBack}>Try Again</button>
        </div>
    )
}

// ── Meal Plan View ───────────────────────────────────────────────────────────

function MealPlanView({ plan, onRegenerate, onEdit }) {
    const { meals, totalCalories, calorieTarget, nutritionNote, profile } = plan

    const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
    const totalCarbs   = meals.reduce((s, m) => s + m.carbs, 0)
    const totalFat     = meals.reduce((s, m) => s + m.fat, 0)

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🌿</span>
                    <h1 style={{ margin: 0, fontSize: 28, color: 'var(--charcoal)' }}>NourishDay</h1>
                </div>
                <button onClick={onEdit} style={{ background: 'none', border: 'none',
                    color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
                    ← Edit Profile
                </button>
            </div>

            <p style={{ margin: '0 0 28px', color: 'var(--muted)', fontSize: 14 }}>
                Here's {profile.name}'s personalized meal plan for today
            </p>

            {/* Calorie Summary */}
            <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', color: 'var(--muted)', fontSize: 13,
                    textTransform: 'uppercase', letterSpacing: 1 }}>Daily Target</p>
                <p style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 700, color: 'var(--charcoal)' }}>
                    {calorieTarget.toLocaleString()} <span style={{ fontSize: 18, fontWeight: 400 }}>kcal</span>
                </p>
                <p style={{ margin: 0, fontSize: 13,
                    color: totalCalories > calorieTarget * 1.1 ? '#e07' : 'var(--muted)' }}>
                    Plan total: {totalCalories.toLocaleString()} kcal
                </p>
            </div>

            <MacroChart protein={totalProtein} carbs={totalCarbs} fat={totalFat} />

            {/* Water Intake */}
            <div className="card" style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                    💧 Recommended Water Intake
                </p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#4a90e2' }}>
                    8 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>cups / day</span>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Per USDA Dietary Guidelines. Your meals contribute approximately {Math.round(meals.reduce((s, m) => s + m.water, 0) / 240)} cups.
                </p>
            </div>

            {meals.map(meal => (
                <MealCard key={meal.type} meal={meal} />
            ))}

            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: '16px 0 24px' }}>
                ℹ️ {nutritionNote}
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={onRegenerate}>
                    🔄 Regenerate Meals
                </button>
                <button onClick={onEdit} style={{ flex: 1, padding: '12px', borderRadius: 10,
                    border: '1.5px solid var(--border)', background: 'none',
                    cursor: 'pointer', fontSize: 14, color: 'var(--charcoal)' }}>
                    ✏️ Edit Profile
                </button>
            </div>
        </div>
    )
}

// ── Meal Card ────────────────────────────────────────────────────────────────

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙' }

function MealCard({ meal }) {
    return (
        <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
          <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: 1, fontWeight: 600 }}>
            {MEAL_ICONS[meal.type]} {meal.type}
          </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 17, color: 'var(--charcoal)' }}>
                        {meal.name}
                    </h3>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)',
                    whiteSpace: 'nowrap', marginLeft: 12 }}>
          {meal.calories} kcal
        </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {meal.description}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { label: 'Protein', val: meal.protein, color: '#4a90e2' },
                    { label: 'Carbs',   val: meal.carbs,   color: '#f5a623' },
                    { label: 'Fat',     val: meal.fat,      color: '#7ed321' },
                    { label: 'Fiber',   val: meal.fiber,    color: '#9b59b6' },
                ].map(({ label, val, color }) => (
                    <div key={label} style={{ flex: 1, background: 'var(--surface)',
                        borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color }}>{val}g</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>{label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Macro Chart ──────────────────────────────────────────────────────────────

function MacroChart({ protein, carbs, fat }) {
    const total = (protein * 4) + (carbs * 4) + (fat * 9)
    if (total === 0) return null

    const segments = [
        { label: 'Protein', cals: protein * 4, color: '#4a90e2' },
        { label: 'Carbs',   cals: carbs * 4,   color: '#f5a623' },
        { label: 'Fat',     cals: fat * 9,      color: '#7ed321' },
    ]

    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                Macro Breakdown
            </p>
            <div style={{ display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                {segments.map(s => (
                    <div key={s.label} style={{ width: `${(s.cals / total) * 100}%`, background: s.color }} />
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {segments.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                        <span style={{ color: 'var(--muted)' }}>
              {s.label} {Math.round((s.cals / total) * 100)}%
            </span>
                    </div>
                ))}
            </div>
        </div>
    )
}