/** @type {import('tailwindcss').Config} */

module.exports = {
   darkMode: "class",
   content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./node_modules/flowbite/**/*.{js,ts,jsx,tsx}",
      "./node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {
         keyframes: {
            fadeIn: {
               '0%': { opacity: '0', transform: 'translateY(10px)' },
               '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            spin: {
               from: { transform: 'rotate(0deg)' },
               to: { transform: 'rotate(360deg)' },
            },
         },
         animation: {
            fadeIn: 'fadeIn 0.3s ease-out',
            spin: 'spin 1s linear infinite',
         },
      },
   },
   plugins: [require("flowbite/plugin")],
};
