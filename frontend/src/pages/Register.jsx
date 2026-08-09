import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import InkReveal from '../components/InkReveal'
import Mascot from '../components/Mascot'

const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'kn', label: 'Kannada' }, { value: 'ta', label: 'Tamil' }]
const EDUCATION_LEVELS = [{ value: 'none', label: 'No formal education' }, { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'other', label: 'Other' }]
const GOAL_LABELS = { personal: 'Personal growth', professional: 'Career / work', travel: 'Travel', family: 'Family & community' }

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()
  const learningGoal = location.state?.learning_goal ?? null

  useEffect(() => { if (!learningGoal) navigate('/onboarding', { replace: true }) }, [learningGoal, navigate])

  const [form, setForm] = useState({ username: '', email: '', password: '', preferred_language: 'en', age: '', education_level: 'none' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSubmitting(true)
    try {
      await register({ ...form, age: form.age ? Number(form.age) : null, learning_goal: learningGoal })
      setShowReveal(true)
    } catch (err) {
      const data = err.response?.data
      const firstError = data ? Object.values(data)[0] : null
      setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Something went wrong. Try again.')
    } finally { setSubmitting(false) }
  }

  if (!learningGoal) return null

  return (
    <div className="min-h-[calc(100vh-73px)] grid md:grid-cols-2">
      {showReveal && <InkReveal name={form.username} onComplete={() => navigate('/profile')} />}
      <div className="notebook-page hidden md:flex flex-col items-center justify-center px-10 py-16 border-r-2 border-ink/10">
        <Mascot mood="encouraging" size={160} />
        <h2 className="font-display text-3xl text-ink mt-6 text-center">Let's get your page started!</h2>
        <p className="font-body text-ink/60 text-center mt-3 max-w-xs">Just a few details and you're ready to find out your level.</p>
      </div>
      <div className="bg-paper flex items-center justify-center px-6 sm:px-10 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-ink/10 rounded-full px-4 py-1.5 mb-6">
            <span className="font-body text-xs text-ink/50">Learning for:</span>
            <span className="font-body text-xs font-bold text-pencil">{GOAL_LABELS[learningGoal]}</span>
          </div>
          <h1 className="font-display text-4xl text-ink mb-8">Create your account</h1>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field label="Username" name="username" value={form.username} onChange={handleChange} required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} help="At least 8 characters." />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Preferred language" name="preferred_language" value={form.preferred_language} onChange={handleChange} options={LANGUAGES} />
              <Field label="Age" name="age" type="number" value={form.age} onChange={handleChange} min={1} />
            </div>
            <SelectField label="Education level" name="education_level" value={form.education_level} onChange={handleChange} options={EDUCATION_LEVELS} />
            {error && <p className="font-body text-sm text-pencil border-l-4 border-pencil pl-3 py-1">{error}</p>}
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }}
              className="w-full bg-pencil text-paper font-body font-bold text-lg px-6 py-4 rounded-2xl hover:bg-ink transition-colors focus-ring disabled:opacity-60 shadow-[0_4px_0_0_#8f342b]">
              {submitting ? 'Creating account…' : "Let's go!"}
            </motion.button>
          </form>
          <p className="font-body text-sm text-ink/70 mt-6">Already registered? <Link to="/login" className="text-pencil font-semibold hover:underline">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, required, minLength, min, help }) {
  return (
    <label className="block">
      <span className="font-body text-sm font-semibold text-ink">{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} required={required} minLength={minLength} min={min}
        className="mt-1 w-full bg-white border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink transition-colors" />
      {help && <span className="block text-xs text-ink/50 mt-1 font-body">{help}</span>}
    </label>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="font-body text-sm font-semibold text-ink">{label}</span>
      <select name={name} value={value} onChange={onChange}
        className="mt-1 w-full bg-white border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink transition-colors">
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  )
}