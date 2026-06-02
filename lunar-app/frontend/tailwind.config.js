/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body:    ['"Epilogue"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper:   '#FAFAF2',
        ink:     '#1A1A1A',
        orange:  '#E8500A',
        blue:    '#2D5BE3',
        yellow:  '#F2C94C',
        red:     '#D93025',
        muted:   '#6B6B5A',
        border:  '#1A1A1A',
        card:    '#FFFFFF',
        tag:     {
          basalt:     '#f7e8aa',
          highland:   '#934b43',
          melt:       '#708090',
          pyro:       '#afafaf',
          mixed:      '#3a4e48',
        }
      },
      boxShadow: {
        'panel':  '4px 4px 0px #1A1A1A',
        'panel-lg': '6px 6px 0px #1A1A1A',
        'panel-sm': '2px 2px 0px #1A1A1A',
        'panel-orange': '4px 4px 0px #E8500A',
        'panel-blue':   '4px 4px 0px #2D5BE3',
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
