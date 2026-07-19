import React from 'react'

export const CATEGORIES = ['mains', 'desserts', 'sides', 'breads', 'drinks', 'snacks', 'breakfast']
export const DIFFICULTIES = ['easy', 'medium', 'hard']

export interface RecipeFormData {
  title: string
  category: string
  cuisine: string
  serves: string
  prep_time: string
  cook_time: string
  difficulty: string
  tags: string
  ingredients: string
  method: string
  notes: string
}

export const EMPTY_FORM: RecipeFormData = {
  title: '',
  category: 'mains',
  cuisine: '',
  serves: '',
  prep_time: '',
  cook_time: '',
  difficulty: 'medium',
  tags: '',
  ingredients: '',
  method: '',
  notes: '',
}

interface RecipeFormProps {
  form: RecipeFormData
  setForm: React.Dispatch<React.SetStateAction<RecipeFormData>>
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  error: string | null
  submitLabel: string
  titleEditable?: boolean
}

export default function RecipeForm({ form, setForm, onSubmit, submitting, error, submitLabel, titleEditable = true }: RecipeFormProps) {
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <>
      {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="title">Recipe Title</label>
          <input id="title" required value={form.title} onChange={update('title')} placeholder="Grandma's Biryani" disabled={!titleEditable} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={update('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={form.difficulty} onChange={update('difficulty')}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="cuisine">Cuisine</label>
            <input id="cuisine" value={form.cuisine} onChange={update('cuisine')} placeholder="Indian" />
          </div>
          <div className="field">
            <label htmlFor="serves">Serves</label>
            <input id="serves" value={form.serves} onChange={update('serves')} placeholder="4" />
          </div>
          <div className="field">
            <label htmlFor="prep_time">Prep Time</label>
            <input id="prep_time" value={form.prep_time} onChange={update('prep_time')} placeholder="20min" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="cook_time">Cook Time</label>
            <input id="cook_time" value={form.cook_time} onChange={update('cook_time')} placeholder="45min" />
          </div>
          <div className="field">
            <label htmlFor="tags">Tags</label>
            <input id="tags" value={form.tags} onChange={update('tags')} placeholder="chicken, curry, weeknight" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea id="ingredients" required value={form.ingredients} onChange={update('ingredients')} placeholder={"- 500g chicken thigh, cubed\n- 1 cup yoghurt\n- 2 tsp garam masala\n- ..."} style={{ minHeight: '150px' }} />
        </div>

        <div className="field">
          <label htmlFor="method">Method</label>
          <textarea id="method" required value={form.method} onChange={update('method')} placeholder={"1. Marinate chicken in yoghurt and spices for 2 hours\n2. Heat oil in a large pan\n3. ..."} style={{ minHeight: '200px' }} />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" value={form.notes} onChange={update('notes')} placeholder="Can substitute cream with coconut cream for dairy-free version" style={{ minHeight: '80px' }} />
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? <><span className="spinner" /> Saving...</> : submitLabel}
        </button>
      </form>
    </>
  )
}
