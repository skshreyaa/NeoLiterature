import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ScoreMark from '../components/ScoreMark'

const LANGUAGE_LABELS = { en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil' }
const EDUCATION_LABELS = { none: 'No formal education', primary: 'Primary', secondary: 'Secondary', other: 'Other' }
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export default function Profile() {
  const { user } = useAuth()
  const profile = user?.profile
  const hasAnyScore = profile?.reading_score != null || profile?.writing_score != null || profile?.comprehension_score != null

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2">my page</p>
        <h1 className="font-display text-4xl text-ink mb-1">Hi, {user?.username}</h1>
        <p className="font-body text-ink/70 mb-8">Learning in <span className="font-semibold">{LANGUAGE_LABELS[user?.preferred_language] ?? '—'}</span></p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link to="/dashboard" className="font-body text-sm bg-white border-2 border-ink/10 rounded-full px-4 py-2 hover:border-rule transition-colors">📊 My dashboard</Link>
          <Link to="/curriculum" className="font-body text-sm bg-white border-2 border-ink/10 rounded-full px-4 py-2 hover:border-rule transition-colors">Browse lessons</Link>
          <Link to="/learning-path" className="font-body text-sm bg-white border-2 border-ink/10 rounded-full px-4 py-2 hover:border-rule transition-colors">My learning path</Link>
          <Link to="/test-results" className="font-body text-sm bg-white border-2 border-ink/10 rounded-full px-4 py-2 hover:border-rule transition-colors">Test results</Link>
          <Link to="/settings" className="font-body text-sm bg-white border-2 border-ink/10 rounded-full px-4 py-2 hover:border-rule transition-colors">Settings</Link>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-xl text-ink mb-4 border-b-2 border-ink/10 pb-2">Account details</h2>
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 font-body text-sm">
            <dt className="text-ink/50">Email</dt><dd className="text-ink">{user?.email}</dd>
            <dt className="text-ink/50">Preferred language</dt><dd className="text-ink">{LANGUAGE_LABELS[user?.preferred_language] ?? '—'}</dd>
            <dt className="text-ink/50">Age</dt><dd className="text-ink">{user?.age ?? '—'}</dd>
            <dt className="text-ink/50">Education level</dt><dd className="text-ink">{EDUCATION_LABELS[user?.education_level] ?? '—'}</dd>
          </dl>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-1 border-b-2 border-ink/10 pb-2">Your assessment</h2>
          {!hasAnyScore ? (
            <div className="mt-6 border-2 border-dashed border-ink/20 rounded-sm p-6 text-center">
              <p className="font-body text-ink/70 mb-1">You haven't taken your reading, writing, and comprehension assessment yet.</p>
              <p className="font-body text-sm text-ink/50 mb-4">Finish it and your level will show up here.</p>
              <Link to="/assessment" className="inline-block bg-pencil text-paper font-body font-semibold px-6 py-3 rounded-sm hover:bg-ink transition-colors focus-ring">Take the assessment</Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 mt-6 mb-6">
                <ScoreMark label="Reading" score={profile.reading_score} />
                <ScoreMark label="Writing" score={profile.writing_score} />
                <ScoreMark label="Comprehension" score={profile.comprehension_score} />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-body text-sm text-ink/60">Overall level:</span>
                <span className="font-display text-2xl text-pencil">{LEVEL_LABELS[profile.overall_level] ?? '—'}</span>
              </div>
              <Link to="/assessment" className="font-body text-sm text-rule hover:underline">Retake the assessment →</Link>
            </>
          )}
        </section>
      </div>
    </div>
  )
}