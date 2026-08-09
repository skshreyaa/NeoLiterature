import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LABS = [
  { to: '/voice-lab', icon: '🎙️', name: 'Voice Lab', desc: 'Practice speaking, get scored' },
  { to: '/picture-lab', icon: '🖼️', name: 'Picture Lab', desc: 'Rapid picture recognition drills' },
  { to: '/listening-lab', icon: '🔊', name: 'Listening Lab', desc: 'Hear a word, pick the match' },
]

export default function LabsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover:text-pencil transition-colors focus-ring rounded px-1 flex items-center gap-1"
      >
        Labs
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-xs">▾</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-ink/10 rounded-2xl shadow-lg overflow-hidden z-50"
          >
            {LABS.map((lab) => (
              <Link
                key={lab.to}
                to={lab.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors"
              >
                <span className="text-xl">{lab.icon}</span>
                <div>
                  <p className="font-body text-sm font-semibold text-ink">{lab.name}</p>
                  <p className="font-body text-xs text-ink/50">{lab.desc}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}