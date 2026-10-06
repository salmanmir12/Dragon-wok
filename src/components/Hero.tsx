import React from 'react';
import { Flame, ArrowRight, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const Hero: React.FC = () => {
  const { setIsCartOpen, restaurantStatus } = useOrder();

  return (
    <section id="home" className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#121316]">
      {/* Background Image with Cinematic Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_wok_fire_1791288825817.jpg"
          alt="Chinese wok stir-frying over high flames with golden steam in Dragon Wok Abbottabad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.4] contrast-[1.1] transition-transform duration-1000"
        />
        {/* Layered Gradients for guaranteed WCAG AA text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/60 to-[#121316]/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#121316]/50 to-[#121316]/90" />
      </div>

      {/* Decorative Subtle Accent Hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#b91c1c]/40 to-transparent z-10" />

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center flex flex-col items-center">
        {/* Small Label & Realtime Status Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-700/60 text-amber-400 text-xs font-semibold tracking-widest uppercase shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AUTHENTIC CHINESE-INSPIRED CUISINE</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-950/80 border border-stone-800 text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                restaurantStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span
              className={`tracking-wider uppercase text-[11px] font-bold ${
                restaurantStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {restaurantStatus.statusText}
            </span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400 text-[11px]">{restaurantStatus.subText}</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 
          style={{ textWrap: 'balance' }}
          className="font-serif-brand text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]"
        >
          Bold Chinese Flavors. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-[#b91c1c]">
            Made Fresh.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="max-w-2xl text-stone-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-10">
          Experience bold flavors, wok-tossed favorites, and Chinese-inspired cuisine in the heart of Abbottabad.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-12">
          <a
            href="#menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-8 py-4 rounded-md font-semibold text-sm tracking-wider uppercase transition-all shadow-lg shadow-red-950/50 hover:translate-y-[-1px] active:translate-y-[0px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900/90 hover:bg-stone-800 text-stone-100 border border-stone-700/80 hover:border-amber-500/60 px-8 py-4 rounded-md font-semibold text-sm tracking-wider uppercase transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Order Now</span>
          </button>
        </div>

        {/* Location Subtitle in Hero */}
        <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm font-medium tracking-wide">
          <MapPin className="w-4 h-4 text-[#b91c1c]" />
          <span>Jadoon Plaza Phase 1 • Abbottabad</span>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#121316] to-transparent pointer-events-none" />
    </section>
  );
};
