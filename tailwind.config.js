/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // jika tidak pakai folder src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}