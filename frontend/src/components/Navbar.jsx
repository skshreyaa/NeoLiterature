import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StreakBadge from './StreakBadge'
import LabsMenu from './LabsMenu'

function isStreakActiveToday(lastActivityDate) {
  if (!lastActivityDate) return false
  return lastActivityDate === new Date().toISOString().slice(0, 10)
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="w-full border-b-2 border-ink/10 bg-paper/95 backdrop-blur px-6 sm:px-10 py-4 flex items-center justify-between">
      <Link to="/" className="font-display text-2xl text-pencil tracking-wide">neo<span className="text-ink">.</span></Link>
      <div className="flex items-center gap-4 font-body text-sm">
        {user ? (
          <>
            {user.profile && (
              <StreakBadge current={user.profile.current_streak ?? 0} isActiveToday={isStreakActiveToday(user.profile.last_activity_date)} size={22} />
            )}
            <Link to="/dashboard" className="hidden md:inline hover:text-pencil transition-colors focus-ring rounded px-1">Dashboard</Link>
            <Link to="/insights" className="hidden lg:inline hover:text-pencil transition-colors focus-ring rounded px-1">Insights</Link>
            <Link to="/curriculum" className="hidden md:inline hover:text-pencil transition-colors focus-ring rounded px-1">Lessons</Link>
            <Link to="/learning-path" className="hidden lg:inline hover:text-pencil transition-colors focus-ring rounded px-1">My path</Link>
            <div className="hidden lg:block">
              <LabsMenu />
            </div>
            <Link to="/community" className="hidden lg:inline hover:text-pencil transition-colors focus-ring rounded px-1">Community</Link>
            <Link to="/assistant" className="hidden md:inline hover:text-pencil transition-colors focus-ring rounded px-1">✨ Assistant</Link>
            <Link to="/leaderboard" className="hidden lg:inline hover:text-pencil transition-colors focus-ring rounded px-1">Leaderboard</Link>
            <Link to="/profile" className="hover:text-pencil transition-colors focus-ring rounded px-1">My page</Link>
            <Link to="/settings" className="hover:text-pencil transition-colors focus-ring rounded px-1">Settings</Link>
            <span className="hidden sm:inline text-ink/50">|</span>
            <button onClick={handleLogout} className="hover:text-pencil transition-colors focus-ring rounded px-1">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-pencil transition-colors focus-ring rounded px-1">Sign in</Link>
            <Link to="/onboarding" className="bg-pencil text-paper px-4 py-2 rounded-sm hover:bg-ink transition-colors focus-ring">Start learning</Link>
          </>
        )}
      </div>
    </nav>
  )
}