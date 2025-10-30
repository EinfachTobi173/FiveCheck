import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b1020',
        glow: '#60EFFF',
        accent: '#9B5CFF',
        text: '#E6EDF3'
      },
      boxShadow: {
        glow: '0 0 20px rgba(96, 239, 255, 0.6)',
        card: '0 10px 30px rgba(0,0,0,0.4)'
      }
    }
  },
  plugins: []
} satisfies Config