import React from 'react';
import { Flame, MapPin, Clock, Star, Sparkles } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const Hero: React.FC = () => {
  const { restaurantStatus } = useOrder();

  return (
    <section className="relative pt-20 sm:pt-24 pb-4 sm:pb-6 bg-[#121316] border-b border-stone-800/80 overflow-hidden">
      {/* Subtle atmospheric background glow */}
      <div className="absolute inset-0 z-0 bg-[#121316]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#991b1b]/15 via-transparent to-amber-950/15" />
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
          {/* Left / Center: Brand & Compact Heading */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-amber-400 text-[11px] font-bold tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Dragon Wok • Mandian, Abbottabad</span>
              </span>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-[11px] font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    restaurantStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span
                  className={`font-bold uppercase tracking-wider ${
                    restaurantStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {restaurantStatus.isOpen ? 'OPEN NOW' : 'CLOSED'}
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-stone-400 font-mono text-[10px]">
                  {restaurantStatus.subText}
                </span>
              </div>
            </div>

            {/* Requirement 4: Compact "Order Your Favorites" Heading */}
            <h1 className="font-serif-brand text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-1.5">
              Order Your Favorites
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Authentic wok-tossed chowmein, crispy momos, signature chicken & beef gravies, and feast combos delivered hot across Abbottabad.
            </p>
          </div>

          {/* Right: Compact Trust Badges & Verified Ratings */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white font-mono">4.4</span>
              <span className="text-stone-400 text-[11px]">Google (20+)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
              <span className="font-bold text-white font-mono">4.5</span>
              <span className="text-stone-400 text-[11px]">Foodpanda (450+)</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 text-[11px]">
              <MapPin className="w-3 h-3 text-[#b91c1c]" />
              <span>Jadoon Plaza Phase 1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
