import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:          '#f7f5f0',
        surface:     '#ffffff',
        dark:        '#1a1a2e',
        accent:      '#ff6b4a',
        'accent-lt': '#fff0ed',
        'accent-dk': '#e8523a',
        muted:       '#aaa8a0',
        border:      '#e8e4dc',
        success:     '#2da44e',
        'success-lt':'#edfbf1',
        error:       '#e53935',
        warn:        '#f4a22d',
        'warn-lt':   '#fff8ec',
        blue:        '#3b82f6',
        'blue-lt':   '#eff6ff',
      },
      fontFamily: {
        syne:      ['var(--font-syne)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
      borderRadius: {
        card:  '14px',
        input: '12px',
        phone: '44px',
        icon:  '10px',
      },
      boxShadow: {
        card:   '0 1px 4px rgba(26,26,46,0.05)',
        phone:  '0 24px 64px rgba(26,26,46,0.14)',
        accent: '0 4px 20px rgba(255,107,74,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
