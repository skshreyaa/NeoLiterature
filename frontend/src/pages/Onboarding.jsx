import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Mascot from '../components/Mascot'

const GOALS = [
  { value: 'personal', label: 'Personal growth', blurb: 'I want to read and write more confidently.' },
  { value: 'professional', label: 'Career / work', blurb: 'I need this for my job or to find work.' },
  { value: 'travel', label: 'Travel', blurb: "I'm learning to get around when I travel." },
  { value: 'family', label: 'Family & community', blurb: 'I want to connect better with people around me.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const handleContinue = () => { if (selected) navigate('/register', { state: { learning_goal: selected } }) }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center">
        <Mascot mood="thinking" size={110} />
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mt-4 mb-2">before we begin</p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-8">Why are you learning?</h1>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {GOALS.map((goal) => {
            const isSelected = selected === goal.value
            return (
              <motion.button key={goal.value} onClick={() => setSelected(goal.value)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                animate={isSelected ? { borderColor: '#C1483D', backgroundColor: '#FBF3EC' } : { borderColor: 'rgba(35,35,35,0.15)', backgroundColor: '#FFFFFF' }}
                className="text-left border-2 rounded-2xl p-5 transition-colors focus-ring">
                <p className="font-display text-xl text-ink mb-1">{goal.label}</p>
                <p className="font-body text-sm text-ink/60">{goal.blurb}</p>
              </motion.button>
            )
          })}
        </div>
        <motion.button onClick={handleContinue} disabled={!selected} whileTap={{ scale: 0.98 }}
          className="bg-pencil text-paper font-body font-bold text-lg px-10 py-4 rounded-2xl hover:bg-ink transition-colors focus-ring disabled:opacity-40 shadow-[0_4px_0_0_#8f342b]">
          Continue
        </motion.button>
      </motion.div>
    </div>
  )
}