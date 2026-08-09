import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'kn', label: 'Kannada' }, { value: 'ta', label: 'Tamil' }]

export default function Settings() {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({ email: '', preferred_language: 'en', age: '' })
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsMessage, setDetailsMessage] = useState(null)
  const [detailsError, setDetailsError] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    if (user) setForm({ email: user.email || '', preferred_language: user.preferred_language || 'en', age: user.age ?? '' })
  }, [user])

  const handleDetailsSubmit = async (e) => {
    e.preventDefault(); setDetailsError(null); setDetailsMessage(null); setSavingDetails(true)
    try {
      await api.put('/users/settings/', { ...form, age: form.age ? Number(form.age) : null })
      await refreshProfile(); setDetailsMessage('Saved.')
    } catch { setDetailsError('Could not save changes.') }
    finally { setSavingDetails(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); setPasswordError(null); setPasswordMessage(null); setSavingPassword(true)
    try {
      await api.put('/users/change-password/', passwordForm)
      setPasswordMessage('Password updated.'); setPasswordForm({ current_password: '', new_password: '' })
    } catch (err) {
      const data = err.response?.data
      setPasswordError(data?.current_password?.[0] || data?.new_password?.[0] || 'Could not update password.')
    } finally { setSavingPassword(false) }
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-xl mx-auto">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2">settings</p>
        <h1 className="font-display text-4xl text-ink mb-10">Your settings</h1>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-ink/10 rounded-3xl p-6 mb-6">
          <h2 className="font-display text-xl text-ink mb-1">Appearance</h2>
          <p className="font-body text-xs text-ink/50 mb-4">Choose how Neo looks on this device.</p>
          <ThemeToggle />
        </motion.div>

        {/* Account details */}
        <motion.form onSubmit={handleDetailsSubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-ink/10 rounded-3xl p-6 mb-6 space-y-4">
          <h2 className="font-display text-xl text-ink mb-2">Account details</h2>
          <label className="block"><span className="font-body text-sm font-semibold text-ink">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink" /></label>
          <label className="block"><span className="font-body text-sm font-semibold text-ink">Preferred language</span>
            <select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
              className="mt-1 w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink">
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select></label>
          <label className="block"><span className="font-body text-sm font-semibold text-ink">Age</span>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="mt-1 w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink" /></label>
          {detailsError && <p className="font-body text-sm text-pencil">{detailsError}</p>}
          {detailsMessage && <p className="font-body text-sm text-sage">{detailsMessage}</p>}
          <button type="submit" disabled={savingDetails} className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors disabled:opacity-50 shadow-[0_4px_0_0_#8f342b]">
            {savingDetails ? 'Saving…' : 'Save changes'}</button>
        </motion.form>

        {/* Change password */}
        <motion.form onSubmit={handlePasswordSubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border-2 border-ink/10 rounded-3xl p-6 mb-6 space-y-4">
          <h2 className="font-display text-xl text-ink mb-2">Change password</h2>
          <label className="block"><span className="font-body text-sm font-semibold text-ink">Current password</span>
            <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="mt-1 w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink" /></label>
          <label className="block"><span className="font-body text-sm font-semibold text-ink">New password</span>
            <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} minLength={8}
              className="mt-1 w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl outline-none py-3 px-4 font-body text-ink" /></label>
          {passwordError && <p className="font-body text-sm text-pencil">{passwordError}</p>}
          {passwordMessage && <p className="font-body text-sm text-sage">{passwordMessage}</p>}
          <button type="submit" disabled={savingPassword} className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors disabled:opacity-50 shadow-[0_4px_0_0_#8f342b]">
            {savingPassword ? 'Updating…' : 'Update password'}</button>
        </motion.form>

        {/* Support & legal */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border-2 border-ink/10 rounded-3xl p-6">
          <h2 className="font-display text-xl text-ink mb-4">Support</h2>
          <div className="flex flex-col gap-3">
            <Link to="/help" className="font-body text-sm text-ink flex items-center justify-between hover:text-pencil transition-colors">
              <span>❓ Help Centre</span> <span className="text-ink/30">→</span>
            </Link>
            <Link to="/privacy" className="font-body text-sm text-ink flex items-center justify-between hover:text-pencil transition-colors">
              <span>🔒 Privacy</span> <span className="text-ink/30">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}