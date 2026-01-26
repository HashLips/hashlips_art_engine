/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        srPrimary: "var(--color-srPrimary)",
        srAccent: "var(--color-srAccent)",
        srTeal: "var(--color-srTeal)",
        srText: "var(--color-srText)",
        srMuted: "var(--color-srMuted)",
        srBg: "var(--color-srBg)",
        srCard: "var(--color-srCard)",
        srBorder: "var(--color-srBorder)",
      },
      container: {
        center: true,
        padding: "1rem",
      },
    },
  },
  plugins: [],
};
