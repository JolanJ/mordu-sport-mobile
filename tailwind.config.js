/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Marque
        'mordu-blue': '#00C4FF',
        'mordu-orange': '#F27020',
        
        // Néon
        'neon-green': '#00FF39',
        'neon-blue': '#00D2FF',
        'neon-purple': '#A470F4',
        'neon-yellow': '#FFD700',
        
        // Système (Dark Mode)
        'background': '#0D0D0D',
        'foreground': '#F5F5F5',
        'card': '#141414',
        'border': '#333333',
        'muted': '#1F1F1F',
        'muted-foreground': '#999999',
        'input': '#262626',
        'primary': '#00C4FF',
        'accent': '#F27020',
        'destructive': '#EF4444',
        'success': '#10B981',
        
        // Ligues
        'nhl': '#00C4FF',
        'nba': '#F27020',
        'nfl': '#DC2626',
        
        // États
        'live': '#FF4500',
        'upcoming': '#999999',
        'finished': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['GeistMono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      }
    },
  },
  plugins: [],
}

