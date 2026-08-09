import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Mascot from '../components/Mascot'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSubmitting(true)
    try { await login(username, password); navigate('/profile') }
    catch { setError('Username or password is incorrect.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] grid md:grid-cols-2">
      <div className="notebook-page hidden md:flex flex-col items-center justify-center px-10 py-16 border-r-2 border-ink/10">
        <Mascot mood="happy" size={160} />
        <h2 className="font-display text-3xl text-ink mt-6 text-center">Welcome back!</h2>
        <p className="font-body text-ink/60 text-center mt-3 max-w-xs">Pick up right where you left off.</p>
      </div>
      <div className="bg-paper flex items-center justify-center px-6 sm:px-10 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="font-display text-4xl text-ink mb-8">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <label className="block">
              <span className="font-body text-sm font-semibold text-ink">Username</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className="mt-1 w-full bg-white border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink transition-colors" />
            </label>
            <label className="block">
              <span className="font-body text-sm font-semibold text-ink">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="mt-1 w-full bg-white border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink transition-colors" />
            </label>
            {error && <p className="font-body text-sm text-pencil border-l-4 border-pencil pl-3 py-1">{error}</p>}
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }}
              className="w-full bg-pencil text-paper font-body font-bold text-lg px-6 py-4 rounded-2xl hover:bg-ink transition-colors focus-ring disabled:opacity-60 shadow-[0_4px_0_0_#8f342b]">
              {submitting ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>
          <p className="font-body text-sm text-ink/70 mt-6">New here? <Link to="/onboarding" className="text-pencil font-semibold hover:underline">Create an account</Link></p>
        </motion.div>
      </div>
    </div>
  )
}