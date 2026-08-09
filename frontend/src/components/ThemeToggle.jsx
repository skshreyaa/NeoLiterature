import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex bg-paper border-2 border-ink/10 rounded-2xl p-1">
      {[
        { value: 'light', icon: '☀️', label: 'Light' },
        { value: 'dark', icon: '🌙', label: 'Dark' },
      ].map((option) => {
        const isActive = theme === option.value
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="relative px-4 py-2 rounded-xl font-body text-sm font-semibold transition-colors"
            style={{ color: isActive ? 'rgb(var(--color-paper))' : 'rgb(var(--color-ink) / 0.6)' }}
          >
            {isActive && (
              <motion.div
                layoutId="theme-toggle-bg"
                className="absolute inset-0 bg-ink rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.icon} {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}