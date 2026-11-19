/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        campaign: {
          deepGreen: "#075B32",
          primaryGreen: "#087A43",
          gold: "#EBAA18",
          darkText: "#17241C",
          lightBg: "#F5F8F5",
          lightGreen: "#E8F3EA",
          cpaBlue: "#1555B5",
          border: "#D1E2D6",
          muted: "#5B7065",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

