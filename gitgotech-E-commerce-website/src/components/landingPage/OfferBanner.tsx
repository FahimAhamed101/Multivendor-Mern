'use client';

import { useState } from 'react';

export default function OfferBanner() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      alert('Redirecting to special offers...');
      setClicked(false);
    }, 1000);
  };

  return (
    <div 
      className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl mx-auto my-8 max-w-6xl"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>
      
      {/* 90% OFF - Custom positioned */}
      <div className="absolute top-1/4 left-10 md:left-20 transform -translate-y-1/2">
        <div className="text-[8rem] md:text-[10rem] font-black leading-none animate-pulse-glow"
             style={{
               background: 'linear-gradient(to right, #ffdd00, #ff9500)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               textShadow: '3px 3px 0 rgba(255, 50, 50, 0.5), -3px -3px 0 rgba(50, 150, 255, 0.5)'
             }}>
          90%
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white tracking-widest bg-black/50 px-6 py-3 rounded-full border-2 border-yellow-400 inline-block mt-4">
          OFF
        </div>
      </div>

      {/* Enjoy Button - Custom positioned */}
      <button
        onClick={handleClick}
        disabled={clicked}
        className={`absolute bottom-20 right-10 md:right-20 px-12 py-5 rounded-full font-black text-xl md:text-2xl tracking-widest uppercase transform transition-all duration-300 hover:scale-105 active:scale-95 animate-button-glow ${
          clicked 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 scale-95' 
            : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
        } text-white shadow-2xl border-2 border-white/30 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {clicked ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Loading...
          </div>
        ) : (
          'Enjoy Big Saving'
        )}
      </button>

      {/* Decorative elements */}
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-full blur-xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-500/20 to-transparent rounded-full blur-xl animate-float"></div>
      
      {/* Sparkle effects */}
      <div className="absolute top-10 left-1/4 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
      <div className="absolute bottom-32 right-1/3 w-3 h-3 bg-yellow-300 rounded-full shadow-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
    </div>
  );
}