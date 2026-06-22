/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        shield: {
          dark: "#f3faf6",
          card: "#ffffff",
          border: "#d6e9dd",
          accent: "#10b981",
          danger: "#ef4444",
          warn: "#f59e0b",
        },
      },
      backgroundImage: {
        "shield-gradient": "linear-gradient(135deg, #ffffff 0%, #f0faf4 55%, #e2f4e9 100%)",
        "saffron-gradient": "linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)",
      },
    },
  },
  plugins: [],
};
