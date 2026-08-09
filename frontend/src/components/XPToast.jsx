import { motion, AnimatePresence } from 'framer-motion'

export default function XPToast({ amount }) {
  return (
    <AnimatePresence>
      {amount != null && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center gap-2 bg-marigold text-ink font-body font-bold px-5 py-2.5 rounded-full shadow-lg"
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            ⚡
          </motion.span>
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}