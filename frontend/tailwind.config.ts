import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Terracotta
        primary: {
          50: '#FDF4F1',
          100: '#FAE5DF',
          200: '#F5C9BD',
          300: '#EFAA97',
          400: '#E78A70',
          DEFAULT: '#E07A5F',
          600: '#D4603F',
          700: '#B34A2E',
          800: '#8F3B25',
          900: '#6B2D1C',
        },
        // Secondary - Navy
        secondary: {
          50: '#ECEDF0',
          100: '#D5D7DE',
          200: '#ABAFC0',
          300: '#8287A1',
          400: '#5A6082',
          DEFAULT: '#3D405B',
          600: '#31334A',
          700: '#252638',
          800: '#1A1A27',
          900: '#0E0E15',
        },
        // Accent - Sage
        accent: {
          50: '#F0F5F2',
          100: '#DCE8E1',
          200: '#B9D1C3',
          300: '#96BAA5',
          DEFAULT: '#81B29A',
          500: '#6A9F84',
          600: '#558069',
          700: '#40614F',
          800: '#2B4135',
          900: '#16211B',
        },
        // Neutral - Sand/Cream
        sand: {
          50: '#FEFDFB',
          100: '#FDF9F3',
          200: '#F9F0E3',
          DEFAULT: '#F4F1DE',
          400: '#E8E0C4',
          500: '#D9CDA6',
          600: '#C4B586',
          700: '#A69663',
          800: '#7D7049',
          900: '#534B31',
        },
        // Status Colors
        success: '#81B29A',
        warning: '#F2CC8F',
        error: '#E07A5F',
        info: '#3D405B',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
