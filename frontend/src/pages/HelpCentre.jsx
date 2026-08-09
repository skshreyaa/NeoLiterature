import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Mascot from '../components/Mascot'

const FAQS = [
  {
    q: 'How does Neo figure out my level?',
    a: 'When you first register, you take a short assessment with reading, writing, and comprehension questions. Your scores set your starting level — Beginner, Intermediate, or Advanced.',
  },
  {
    q: 'Can I change my level later?',
    a: 'Yes. Retaking the assessment recalculates your level from your new scores. You can also "level up" from the Learning Path page once you\'ve completed every lesson in your current level.',
  },
  {
    q: 'What are the Labs for?',
    a: 'Voice Lab is for speaking practice, Picture Lab is for quick visual recognition, and Listening Lab trains you to recognize spoken words. They\'re separate from lessons and can be replayed as often as you like.',
  },
  {
    q: 'Why didn\'t my streak count today?',
    a: 'Streaks update once per day based on any real activity — completing a lesson, a lab round, or an assessment. If it\'s midnight in your timezone and you haven\'t done anything yet today, it just hasn\'t counted yet.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your learning progress, scores, and account details are stored to power your personalized experience. See our Privacy page for the full picture.',
  },
  {
    q: 'Is Neo really free?',
    a: 'Yes — everything currently available (lessons, all 3 Labs, XP, streaks, leaderboard, AI-powered recommendations) is free to use.',
  },
  {
    q: 'Which browser should I use?',
    a: 'Chrome or Edge give you the full experience, including Voice Lab and Listening Lab, which need speech recognition and text-to-speech support built into the browser.',
  },
]

export default function HelpCentre() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">help centre</p>
            <h1 className="font-display text-3xl text-ink">How can we help?</h1>
          </div>
        </div>

        <div className="space-y-3 mb-12">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={faq.q} className="bg-white border-2 border-ink/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <span className="font-body font-semibold text-ink">{faq.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-xl text-rule shrink-0">+</motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="font-body text-sm text-ink/70 px-5 pb-4 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div className="bg-ink rounded-3xl p-8 text-center">
          <p className="font-display text-xl text-paper mb-2">Still stuck?</p>
          <p className="font-body text-sm text-paper/70 mb-5">Reach out and a real person will get back to you.</p>
          <a
            href="mailto:support@neolingo.app"
            className="inline-block bg-marigold text-ink font-body font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
            support@neolingo.app
          </a>
        </div>
      </div>
    </div>
  )
}