/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-theme': 'var(--bg-app)',
        'sidebar-theme': 'var(--bg-sidebar)',
        'surface-theme': 'var(--bg-surface)',
        'card-theme': 'var(--bg-card)',
        'hover-theme': 'var(--bg-hover)',
        'border-theme': 'var(--border-color)',
        'border-subtle': 'var(--border-subtle)',
        'primary-theme': 'var(--text-primary)',
        'secondary-theme': 'var(--text-secondary)',
        'muted-theme': 'var(--text-muted)',
      },
    },
  },
  plugins: [],
}
