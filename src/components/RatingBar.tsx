import React from 'react';
import { Star, MessageSquare, Clock, MapPin } from 'lucide-react';

export const RatingBar: React.FC = () => {
  return (
    <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#181a20] border border-stone-800 rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-800">
          {/* Google Rating */}
          <div className="flex flex-col items-center text-center px-3 pt-3 sm:pt-0">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
              <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
              <span className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                4.4
              </span>
              <span className="text-stone-400 text-sm font-medium">/ 5</span>
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              Google Rating
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Verified Abbottabad Diners
            </div>
          </div>

          {/* Google Reviews */}
          <div className="flex flex-col items-center text-center px-3 pt-3 sm:pt-0">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                20+
              </span>
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              Google Reviews
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Organic Customer Ratings
            </div>
          </div>

          {/* Foodpanda Rating */}
          <div className="flex flex-col items-center text-center px-3 pt-3 sm:pt-0">
            <div className="flex items-center gap-1.5 text-rose-400 mb-1.5">
              <Star className="w-5 h-5 fill-rose-500 stroke-rose-500" />
              <span className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                4.5
              </span>
              <span className="text-stone-400 text-sm font-medium">/ 5</span>
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              Foodpanda Rating
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Online Delivery Score
            </div>
          </div>

          {/* Foodpanda Reviews */}
          <div className="flex flex-col items-center text-center px-3 pt-3 sm:pt-0">
            <div className="flex items-center gap-1.5 text-rose-400 mb-1.5">
              <MessageSquare className="w-5 h-5 text-rose-400" />
              <span className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                450+
              </span>
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              Foodpanda Reviews
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              High Volume Satisfaction
            </div>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Serving Fresh Daily: <strong className="text-stone-200">12:00 PM onwards</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Jadoon Plaza Phase 1, Mandian, Abbottabad</span>
          </div>
        </div>
      </div>
    </section>
  );
};
