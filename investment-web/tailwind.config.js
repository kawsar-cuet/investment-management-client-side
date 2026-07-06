/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2',  // Main primary
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0D47A1',
          900: '#0D3D66',
        },
        secondary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#388E3C',  // Main secondary
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#1B5E20',
          900: '#0D3D1F',
        },
        accent: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800',  // Main accent
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'material': '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
        'material-lg': '0 4px 8px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.16)',
      }
    },
    screens: {
      'xs': '0px',
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1400px',
    }
  },
  plugins: [],
}
