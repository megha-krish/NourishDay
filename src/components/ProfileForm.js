import { useState } from 'react'
import { ACTIVITY_LEVELS, DIETARY_RESTRICTIONS, CUISINES } from '../utils/calories'

const DEFAULT_PROFILE = {
    name: '',
    age: '',
    sex: 'female',
    weightLbs: '',
    heightFt: '',
    heightIn: '',
    activityLevel: 'moderate',
    restrictions: [],
    cuisines: [],
}

export default function ProfileForm({ onSubmit, initialProfile }) {
    const [form, setForm] = useState(initialProfile || DEFAULT_PROFILE)
    const [errors, setErrors] = useState({})

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => ({ ...e, [field]: undefined }))
    }

    function toggleRestriction(val) {
        setForm(f => ({
            ...f,
            restrictions: f.restrictions.includes(val)
                ? f.restrictions.filter(r => r !== val)
                : [...f.restrictions, val],
        }))
    }

    function toggleCuisine(val) {
        setForm(f => {
            if (f.cuisines.includes(val)) {
                return { ...f, cuisines: f.cuisines.filter(c => c !== val) }
            }
            if (f.cuisines.length >= 3) return f
            return { ...f, cuisines: [...f.cuisines, val] }
        })
    }

    function validate() {
        const e = {}
        if (!form.name.trim()) e.name = 'Required'
        if (!form.age || form.age < 18 || form.age > 100) e.age = 'Enter an age between 18–100'
        if (!form.weightLbs || form.weightLbs < 50 || form.weightLbs > 700) e.weightLbs = 'Enter a valid weight'
        if (!form.heightFt || form.heightFt < 3 || form.heightFt > 8) e.heightFt = 'Enter feet (3–8)'
        if (form.heightIn === '' || form.heightIn === undefined || form.heightIn < 0 || form.heightIn > 11)
        return e
    }

    function handleSubmit() {
        const e = validate()
        if (Object.keys(e).length > 0) {
            setErrors(e)
            return
        }
        onSubmit(form)
    }

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 60px' }}>
            <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>🌿</span>
                    <h1 style={{ margin: 0, fontSize: 32, color: 'var(--charcoal)' }}>NourishDay</h1>
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
                    Tell us about yourself and we'll build a personalized daily meal plan,
                    calibrated to your body using USDA dietary guidelines.
                </p>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>About You</h3>

                <div style={{ marginBottom: 16 }}>
                    <label>First Name</label>
                    <input
                        placeholder="e.g. Jordan"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                    />
                    {errors.name && <span style={{ color: 'var(--accent)', fontSize: 12 }}>{errors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                        <label>Age</label>
                        <input
                            type="number" min="18" max="100"
                            placeholder="e.g. 28"
                            value={form.age}
                            onChange={e => set('age', Number(e.target.value))}
                        />
                        {errors.age && <span style={{ color: 'var(--accent)', fontSize: 12 }}>{errors.age}</span>}
                    </div>
                    <div>
                        <label>Biological Sex <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11, textTransform: 'none', letterSpacing: 0 }}>(for calorie calc)</span></label>
                        <select value={form.sex} onChange={e => set('sex', e.target.value)}>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label>Weight (lbs)</label>
                    <input
                        type="number" min="50" max="700"
                        placeholder="e.g. 155"
                        value={form.weightLbs}
                        onChange={e => set('weightLbs', Number(e.target.value))}
                    />
                    {errors.weightLbs && <span style={{ color: 'var(--accent)', fontSize: 12 }}>{errors.weightLbs}</span>}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label>Height</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <input
                                type="number" min="3" max="8"
                                placeholder="Feet (e.g. 5)"
                                value={form.heightFt}
                                onChange={e => set('heightFt', Number(e.target.value))}
                            />
                            {errors.heightFt && <span style={{ color: 'var(--accent)', fontSize: 12 }}>{errors.heightFt}</span>}
                        </div>
                        <div>
                            <input
                                type="number" min="0" max="11"
                                placeholder="Inches (e.g. 7)"
                                value={form.heightIn}
                                onChange={e => set('heightIn', Number(e.target.value))}
                            />
                            {errors.heightIn && <span style={{ color: 'var(--accent)', fontSize: 12 }}>{errors.heightIn}</span>}
                        </div>
                    </div>
                </div>

                <div>
                    <label>Activity Level</label>
                    <select value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                        {ACTIVITY_LEVELS.map(a => (
                            <option key={a.value} value={a.value}>{a.label} — {a.description}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Dietary Restrictions</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13 }}>Select all that apply</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {DIETARY_RESTRICTIONS.map(r => (
                        <span
                            key={r.value}
                            className={`tag ${form.restrictions.includes(r.value) ? 'selected' : ''}`}
                            onClick={() => toggleRestriction(r.value)}
                        >
              {r.emoji} {r.label}
            </span>
                    ))}
                </div>
                {form.restrictions.length === 0 && (
                    <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        None selected — all foods will be considered
                    </p>
                )}
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Favorite Cuisines</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13 }}>Pick up to 3</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CUISINES.map(c => (
                        <span
                            key={c.value}
                            className={`tag ${form.cuisines.includes(c.value) ? 'selected' : ''}`}
                            onClick={() => toggleCuisine(c.value)}
                        >
              {c.emoji} {c.label}
            </span>
                    ))}
                </div>
                {form.cuisines.length === 0 && (
                    <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        None selected — we'll mix it up for variety
                    </p>
                )}
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleSubmit}>
                Build My Meal Plan →
            </button>
        </div>
    )
}