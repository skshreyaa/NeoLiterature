import Mascot from '../components/Mascot'

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'Your username, email, age, and preferred language when you register. Your assessment scores, lesson progress, streak, XP, and lab practice history as you use the app. If you use the AI Assistant, your chat messages are stored so the conversation has memory.',
  },
  {
    title: 'How we use it',
    body: 'To personalize your learning path, calculate your level and streak, show your own stats and progress, and power the AI-based lesson recommendations and Assistant replies.',
  },
  {
    title: 'What we share publicly',
    body: 'Your username and XP total appear on the Leaderboard. Milestone events (perfect scores, level-ups, streaks) may appear in the Community feed with your username attached. We never share your email, age, assessment answers, or chat history publicly.',
  },
  {
    title: 'Third parties',
    body: 'Lesson recommendations and the AI Assistant use an external AI provider to generate responses — your messages and basic learning context are sent to that provider to generate a reply. No payment information is collected, since there is currently no payment system.',
  },
  {
    title: 'Your control',
    body: 'You can update your account details and change your password anytime in Settings. You can clear your AI Assistant conversation history at any point from the Assistant page.',
  },
]

export default function Privacy() {
  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">privacy</p>
            <h1 className="font-display text-3xl text-ink">Your data, plainly explained</h1>
          </div>
        </div>
        <p className="font-body text-sm text-ink/50 mb-10">No legal jargon — just what actually happens with your information.</p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl text-ink mb-2">{section.title}</h2>
              <p className="font-body text-sm text-ink/70 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}