import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Mascot from '../components/Mascot'

const journey = [
  { icon: '📝', label: 'Register', note: 'Tell us your name and the language you want to learn in.' },
  { icon: '🎯', label: 'Take the assessment', note: 'Short reading, writing, and comprehension checks — no pressure.' },
  { icon: '📊', label: 'Get your level', note: 'Beginner, intermediate, or advanced — set from your own results.' },
  { icon: '🗺️', label: 'Follow your path', note: 'A day-by-day learning path built around where you actually are.' },
  { icon: '🎙️', label: 'Practice in the Labs', note: 'Speaking, listening, and picture recognition — not just reading.' },
  { icon: '🏆', label: 'Level up', note: 'Earn XP, keep your streak, and move up when you\'re ready.' },
]

const features = [
  { icon: '🎙️', title: 'Voice Lab', desc: 'Practice speaking phrases aloud and get real pronunciation feedback.' },
  { icon: '🖼️', title: 'Picture Lab', desc: 'Rapid-fire picture recognition drills using real photos, not flashcards.' },
  { icon: '🔊', title: 'Listening Lab', desc: 'Hear a word spoken, then pick the matching text — trains your ear.' },
  { icon: '🤖', title: 'AI-Powered Path', desc: 'A recommendation engine plans your next lessons based on your weakest skill.' },
  { icon: '📈', title: 'Progress Predictions', desc: 'A machine learning model forecasts your score, based on your own pace.' },
  { icon: '🔥', title: 'Streaks & XP', desc: 'Earn XP, keep a streak, climb the leaderboard, unlock achievements.' },
]

const stats = [
  { value: '100+', label: 'lessons across 3 levels' },
  { value: '4', label: 'languages supported' },
  { value: '3', label: 'practice labs' },
  { value: '8', label: 'unlockable achievements' },
]

export default function Landing() {
  const { user } = useAuth()
  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10">
      <div className="max-w-4xl mx-auto pt-16 pb-24">
        {/* Hero */}
        <div className="flex items-start gap-6 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="shrink-0">
            <Mascot mood="happy" size={90} />
          </motion.div>
          <div className="pt-3">
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-3">reading · writing · speaking · listening</p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.1] text-ink">
              Learn to read and write<br /><span className="text-pencil">at your pace.</span>
            </h1>
          </div>
        </div>
        <p className="font-body text-lg text-ink/80 max-w-xl mb-8">
          Neo is a literacy platform built for first-time learners. It finds your current level with a short assessment, then teaches in the language you're most comfortable in — English, Hindi, Kannada, or Tamil.
        </p>
        <div className="flex flex-wrap gap-4 mb-14">
          {user ? (
            <Link to="/dashboard" className="bg-pencil text-paper font-body font-semibold px-6 py-3 rounded-sm hover:bg-ink transition-colors focus-ring">Go to my dashboard →</Link>
          ) : (
            <>
              <Link to="/onboarding" className="bg-pencil text-paper font-body font-semibold px-6 py-3 rounded-sm hover:bg-ink transition-colors focus-ring">Create my free account</Link>
              <Link to="/login" className="border-2 border-ink/20 text-ink font-body font-semibold px-6 py-3 rounded-sm hover:border-ink transition-colors focus-ring">I already have one</Link>
            </>
          )}
        </div>

        {/* Real stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 border-y-2 border-ink/10 py-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl text-pencil">{stat.value}</p>
              <p className="font-body text-xs text-ink/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* What we do - short, scannable points instead of a paragraph */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-ink mb-1">What we do</h2>
          <p className="font-body text-ink/50 text-sm mb-8">Learn at your own pace, while celebrating your achievements.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'We find your level', note: "We don't guess. A quick check tells us exactly where to start." },
              { icon: '🗣️', title: 'You don\'t just read', note: 'Speak it, hear it, see it — four ways to learn, not one.' },
              { icon: '🎮', title: 'It feels like a game', note: 'XP, streaks, and levels — built to keep you coming back.' },
            ].map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center sm:text-left"
              >
                <span className="text-3xl mb-2 block">{point.icon}</span>
                <p className="font-display text-lg text-ink mb-1">{point.title}</p>
                <p className="font-body text-sm text-ink/60">{point.note}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-ink mb-8">Everything you need to actually learn</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white border-2 border-ink/10 rounded-2xl p-5"
              >
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <p className="font-display text-lg text-ink mb-1">{feature.title}</p>
                <p className="font-body text-sm text-ink/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your journey / path */}
        <div className="border-t-2 border-ink/10 pt-10 mb-16">
          <h2 className="font-display text-2xl text-ink mb-2">Your journey with Neo</h2>
          <p className="font-body text-sm text-ink/60 mb-8">From your first day to leveling up — here's the whole path.</p>
          <div className="relative">
            <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-ink/10 hidden sm:block" />
            <ol className="space-y-6">
              {journey.map((step, i) => (
                <motion.li
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 relative"
                >
                  <span className="w-14 h-14 rounded-full bg-white border-2 border-ink/10 flex items-center justify-center text-2xl shrink-0 z-10">
                    {step.icon}
                  </span>
                  <div className="pt-2">
                    <p className="font-body font-bold text-ink">{step.label}</p>
                    <p className="font-body text-ink/70 text-sm">{step.note}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        {/* Premium banner */}
        <div className="border-t-2 border-ink/10 pt-10 mb-14">
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
            style={{ background: 'linear-gradient(135deg, #232323 0%, #3B3530 100%)' }}
          >
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #E0A94C 0%, transparent 70%)' }}
            />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-marigold text-ink font-body font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-full mb-4">
                  ✨ Coming soon
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-paper mb-3">Neo Premium</h2>
                <p className="font-body text-paper/70 mb-6 max-w-md">
                  Unlimited AI conversations, downloadable progress reports, and early access to new lessons —
                  for learners who want to go even further.
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-4xl text-marigold">Free</span>
                  <span className="font-body text-sm text-paper/50">to start · everything above works today</span>
                </div>
                <button
                  disabled
                  className="bg-paper/10 text-paper/50 font-body font-bold px-6 py-3 rounded-2xl cursor-not-allowed border border-paper/20"
                >
                  Notify me when it launches
                </button>
              </div>
              <div className="bg-paper/5 border border-paper/10 rounded-2xl p-6">
                <p className="font-body text-xs uppercase tracking-wide text-paper/40 mb-4">What's included</p>
                <ul className="space-y-3">
                  {['Everything in Free', 'Unlimited AI Assistant chats', 'Downloadable progress reports', 'Priority access to new content', 'No ads — we never had any anyway'].map((f) => (
                    <li key={f} className="font-body text-sm text-paper/80 flex items-start gap-2.5">
                      <span className="text-marigold shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        {!user && (
          <div className="bg-ink rounded-3xl p-10 text-center">
            <h2 className="font-display text-3xl text-paper mb-3">Ready to start?</h2>
            <p className="font-body text-paper/70 mb-6">It takes less than five minutes to find your level and begin — completely free.</p>
            <Link to="/onboarding" className="inline-block bg-marigold text-ink font-body font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity">
              Create my free account
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}