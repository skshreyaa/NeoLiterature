export default function ScoreMark({ label, score }) {
  const hasScore = score !== null && score !== undefined
  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d="M 60 8 C 95 6, 112 30, 110 60 C 108 92, 88 112, 58 111 C 26 110, 8 90, 9 58 C 10 28, 30 10, 60 8 Z"
          fill="none" stroke="#C1483D" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-data text-3xl text-ink relative z-10">{hasScore ? Math.round(score) : '—'}</span>
      <span className="font-body text-xs text-ink/60 relative z-10 mt-0.5">{label}</span>
    </div>
  )
}