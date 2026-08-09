import { motion } from 'framer-motion'

export default function Mascot({ mood = 'happy', size = 120 }) {
  const eyeY = mood === 'thinking' ? 48 : 44
  const mouthPath = {
    happy: 'M 42 62 Q 55 74 68 62',
    encouraging: 'M 44 64 Q 55 68 66 64',
    thinking: 'M 46 66 L 64 66',
    celebrating: 'M 40 60 Q 55 80 70 60',
  }[mood]

  return (
    <motion.svg
      viewBox="0 0 110 140" width={size} height={size * 1.27}
      animate={mood === 'celebrating' ? { y: [0, -14, 0] } : { y: [0, -4, 0] }}
      transition={{ duration: mood === 'celebrating' ? 0.5 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <rect x="30" y="20" width="50" height="90" rx="12" fill="#E0A94C" />
      <path d="M 30 110 L 55 135 L 80 110 Z" fill="#F3DCA0" />
      <path d="M 47 110 L 55 128 L 63 110 Z" fill="#232323" />
      <rect x="30" y="20" width="50" height="14" rx="7" fill="#C1483D" />
      <circle cx="44" cy={eyeY} r="4.5" fill="#232323" />
      <circle cx="66" cy={eyeY} r="4.5" fill="#232323" />
      <path d={mouthPath} stroke="#232323" strokeWidth="3" fill="none" strokeLinecap="round" />
      <motion.path d="M 30 70 Q 12 66 8 50" stroke="#E0A94C" strokeWidth="8" strokeLinecap="round" fill="none"
        animate={mood === 'celebrating' ? { rotate: [0, -20, 0] } : {}} style={{ transformOrigin: '30px 70px' }}
        transition={{ duration: 0.4, repeat: mood === 'celebrating' ? Infinity : 0 }} />
      <motion.path d="M 80 70 Q 98 66 102 50" stroke="#E0A94C" strokeWidth="8" strokeLinecap="round" fill="none"
        animate={mood === 'celebrating' ? { rotate: [0, 20, 0] } : {}} style={{ transformOrigin: '80px 70px' }}
        transition={{ duration: 0.4, repeat: mood === 'celebrating' ? Infinity : 0 }} />
    </motion.svg>
  )
}