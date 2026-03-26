export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"','Georgia','serif'],
        body: ['"Jost"','sans-serif'],
      },
      colors: {
        cream: { DEFAULT:'#faf7f4', 50:'#fefcfb', 100:'#faf7f4', 200:'#f2ece5', 300:'#e8ddd3' },
        rose:  { DEFAULT:'#c2185b', 50:'#fce4ec', 100:'#f8bbd0', 400:'#ec407a', 500:'#e91e63', 600:'#c2185b', 700:'#ad1457', 800:'#880e4f' },
        blush: { DEFAULT:'#e8a4b8', 100:'#fce4ec', 200:'#f4c6d5', 400:'#e8a4b8', 600:'#d4789a' },
        ink:   { DEFAULT:'#2d1f1f', 600:'#4a3535', 400:'#7a6060' },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-in':   'slideIn 0.35s cubic-bezier(.4,0,.2,1) both',
        'cart-bounce':'cartBounce 0.4s cubic-bezier(.36,.07,.19,.97)',
        'shimmer':    'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeUp:     { from:{ opacity:0, transform:'translateY(16px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:     { from:{ opacity:0 }, to:{ opacity:1 } },
        slideIn:    { from:{ transform:'translateX(100%)' }, to:{ transform:'translateX(0)' } },
        cartBounce: { '0%,100%':{ transform:'scale(1)' }, '50%':{ transform:'scale(1.3)' } },
        shimmer:    { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
      },
    },
  },
  plugins: [],
}
