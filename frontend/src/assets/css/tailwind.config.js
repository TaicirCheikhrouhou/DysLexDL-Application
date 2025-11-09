// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{html,js,jsx,ts,tsx}",  // Adjust based on your project structure
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1D4ED8',  // Blue color (Tailwind blue-600)
          secondary: '#2563EB', // Lighter blue for secondary accents
          lightBlue: '#93C5FD', // Lighter blue for backgrounds or highlights
        },
        animation: {
          'fade-in': 'fadeIn 0.6s ease-in-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0, transform: 'translateY(15px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        },
      },
    },
    plugins: [],
  }
  