import { motion } from 'framer-motion'

const KEY_SETS = {
  hi: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','क','ख','ग','घ','च','छ','ज','झ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह','ं','ः','्',' '],
  kn: ['ಅ','ಆ','ಇ','ಈ','ಉ','ಊ','ಎ','ಏ','ಒ','ಓ','ಕ','ಖ','ಗ','ಘ','ಚ','ಛ','ಜ','ಝ','ಟ','ಠ','ಡ','ಢ','ಣ','ತ','ಥ','ದ','ಧ','ನ','ಪ','ಫ','ಬ','ಭ','ಮ','ಯ','ರ','ಲ','ವ','ಶ','ಷ','ಸ','ಹ','ಂ','಼',' '],
  ta: ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஒ','ஓ','க','ங','ச','ஞ','ட','ண','த','ந','ப','ம','ய','ர','ல','வ','ழ','ள','ற','ன','ஃ',' '],
}

export default function VirtualKeyboard({ language, value, onChange }) {
  const keys = KEY_SETS[language]
  if (!keys) return null
  const addChar = (char) => onChange(value + char)
  const backspace = () => onChange(value.slice(0, -1))
  return (
    <div className="border-2 border-ink/15 rounded-2xl p-3 bg-white">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {keys.map((char, i) => (
          <motion.button key={i} type="button" whileTap={{ scale: 0.9 }} onClick={() => addChar(char)}
            className="min-w-[2.25rem] h-9 px-2 rounded-lg bg-paper border border-ink/10 font-body text-ink hover:border-rule transition-colors focus-ring">
            {char === ' ' ? '\u2423' : char}
          </motion.button>
        ))}
      </div>
      <button type="button" onClick={backspace} className="text-xs font-body text-pencil hover:underline">⌫ Backspace</button>
    </div>
  )
}