/** @type {import('tailwindcss').Config} */
export default {
  // 修正：將 darkMode 放入主要的配置物件中
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}