const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙' }

export default function FavoritesPage({ favorites, onRemove, onBack }) {
    const grouped = {
        Breakfast: favorites.filter(m => m.type === 'Breakfast'),
        Lunch:     favorites.filter(m => m.type === 'Lunch'),
        Dinner:    favorites.filter(m => m.type === 'Dinner'),
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🌿</span>
                    <h1 style={{ margin: 0, fontSize: 28, color: 'var(--charcoal)' }}>NourishDay</h1>
                </div>
                <button onClick={onBack} style={{ background: 'none', border: 'none',
                    color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
                    ← Back
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 20 }}>❤️</span>
                <h2 style={{ margin: 0, fontSize: 20, color: 'var(--charcoal)' }}>
                    Saved Meals {favorites.length > 0 ? `(${favorites.length})` : ''}
                </h2>
            </div>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                    <span style={{ fontSize: 48 }}>🍽️</span>
                    <p style={{ marginTop: 16, fontSize: 15 }}>No saved meals yet.</p>
                    <p style={{ fontSize: 13 }}>Tap 🤍 on any meal to save it here.</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                        Save at least 1 meal to unlock "Use my saved meals" on the plan page.
                    </p>
                </div>
            ) : (
                Object.entries(grouped).map(([type, meals]) =>
                    meals.length === 0 ? null : (
                        <div key={type} style={{ marginBottom: 24 }}>
                            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600,
                                color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {MEAL_ICONS[type]} {type}
                            </p>
                            {meals.map(meal => (
                                <div key={meal.id} className="card" style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'flex-start', marginBottom: 8 }}>
                                        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--charcoal)', flex: 1 }}>
                                            {meal.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 12 }}>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)',
                                                whiteSpace: 'nowrap' }}>
                                                {meal.calories} kcal
                                            </span>
                                            <button onClick={() => onRemove(meal.id)}
                                                    style={{ background: 'none', border: 'none',
                                                        cursor: 'pointer', fontSize: 18, padding: 0 }}
                                                    title="Remove from saved">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {[
                                            { label: 'Protein', val: meal.protein, color: '#4a90e2' },
                                            { label: 'Carbs',   val: meal.carbs,   color: '#f5a623' },
                                            { label: 'Fat',     val: meal.fat,      color: '#7ed321' },
                                            { label: 'Fiber',   val: meal.fiber,    color: '#9b59b6' },
                                        ].map(({ label, val, color }) => (
                                            <div key={label} style={{ flex: 1, background: 'var(--surface)',
                                                borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color }}>{val}g</p>
                                                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    )
}