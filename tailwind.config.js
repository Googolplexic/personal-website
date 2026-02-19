/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    { pattern: /^(m|p)(t|r|b|l|x|y)?-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/ },
    { pattern: /^gap-(0|1|2|3|4|5|6|8|10|12|16)$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['EB Garamond', 'EB Garamond Fallback', 'Garamond', 'Georgia', 'serif'],
        body: ['PT Sans', 'PT Sans Fallback', 'system-ui', '-apple-system', 'sans-serif'],
        signature: ['EB Garamond', 'EB Garamond Fallback', 'Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-slow': 'fadeIn 1.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
