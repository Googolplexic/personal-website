/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Background colors from themeClasses()
    'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-gray-950', 'bg-black',
    'dark:bg-gray-200', 'dark:bg-gray-300', 'dark:bg-gray-400', 'dark:bg-gray-500', 'dark:bg-gray-600', 'dark:bg-gray-700', 'dark:bg-gray-800', 'dark:bg-gray-900', 'dark:bg-gray-950', 'dark:bg-black',

    // Hover background colors
    'hover:bg-gray-300', 'hover:bg-gray-400', 'hover:bg-gray-500', 'hover:bg-gray-600', 'hover:bg-gray-900',
    'dark:hover:bg-gray-300', 'dark:hover:bg-gray-400', 'dark:hover:bg-gray-500', 'dark:hover:bg-gray-600', 'dark:hover:bg-gray-900',

    // Active background colors
    'active:bg-gray-400', 'active:bg-gray-500', 'active:bg-gray-700', 'active:bg-black',
    'dark:active:bg-gray-400', 'dark:active:bg-gray-500', 'dark:active:bg-gray-700', 'dark:active:bg-black',

    // Text colors from themeClasses()
    'text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-900',
    'dark:text-white', 'dark:text-gray-100', 'dark:text-gray-200', 'dark:text-gray-300', 'dark:text-gray-400', 'dark:text-gray-500', 'dark:text-gray-600', 'dark:text-gray-700', 'dark:text-gray-900',

    // Hover text colors
    'hover:!text-gray-900', 'hover:!text-gray-100',
    'dark:hover:!text-gray-900', 'dark:hover:!text-gray-100',

    // Important text colors (for overrides)
    '!text-gray-900', '!text-gray-100',
    'dark:!text-gray-900', 'dark:!text-gray-100',

    // Border colors from themeClasses()
    'border-blue-400', 'border-blue-500',
    'dark:border-blue-400', 'dark:border-blue-500',

    // Blue text colors
    'text-blue-400', 'text-blue-600',
    'dark:text-blue-400', 'dark:text-blue-600',

    // Spacing utilities from spacing() function
    { pattern: /^(m|p)(t|r|b|l|x|y)?-(0|1|2|3|4|6|8|12|16)$/ },

    // Gap utilities from grid() function
    { pattern: /^gap-(0|1|2|3|4|6|8|12|16)$/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
