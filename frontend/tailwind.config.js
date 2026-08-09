function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: withOpacity('--color-paper'),
        ink: withOpacity('--color-ink'),
        rule: withOpacity('--color-rule'),
        pencil: withOpacity('--color-pencil'),
        marigold: withOpacity('--color-marigold'),
        sage: withOpacity('--color-sage'),
        surface: withOpacity('--color-surface'),
      },
      fontFamily: {
        display: ['"Kalam"', 'cursive'],
        body: ['"Nunito Sans"', 'sans-serif'],
        data: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}