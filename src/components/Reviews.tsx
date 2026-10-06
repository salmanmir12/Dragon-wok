import React from 'react';
import { Star, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

export const Reviews: React.FC = () => {
  return (
    <section className="py-24 bg-[#121316] relative border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED REPUTATION</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Guest Ratings & Reviews
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Consistently appreciated by food lovers, families, and students across Abbottabad on major dining and delivery platforms.
          </p>
        </div>

        {/* Two Platform Rating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          
          {/* Google Platform Card */}
          <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-8 sm:p-10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  Google Maps
                </span>
                <span className="text-xs text-stone-400">Local Listing</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif-brand text-5xl sm:text-6xl font-extrabold text-white tabular-nums">
                  4.4
                </span>
                <span className="text-xl text-stone-400 font-medium">/ 5.0</span>
              </div>

              {/* Stars visualization */}
              <div className="flex items-center gap-1.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'fill-amber-400/40 stroke-amber-400/40'
                    }`}
                  />
                ))}
              </div>

              <p className="text-base font-semibold text-stone-200 mb-2">
                20+ Verified Google Reviews
              </p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Ranked among the local Chinese dining choices at Jadoon Plaza Phase 1, Mandian, Abbottabad.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Dragon+Wok+Jadoon+Plaza+Phase+1+Mandian+Abbottabad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>View Google Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Foodpanda Platform Card */}
          <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-8 sm:p-10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-rose-400">
                  Foodpanda Pakistan
                </span>
                <span className="text-xs text-stone-400">Delivery Platform</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif-brand text-5xl sm:text-6xl font-extrabold text-white tabular-nums">
                  4.5
                </span>
                <span className="text-xl text-stone-400 font-medium">/ 5.0</span>
              </div>

              {/* Stars visualization */}
              <div className="flex items-center gap-1.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4
                        ? 'fill-rose-500 stroke-rose-500'
                        : 'fill-rose-500/70 stroke-rose-500'
                    }`}
                  />
                ))}
              </div>

              <p className="text-base font-semibold text-stone-200 mb-2">
                450+ Customer Ratings
              </p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Extensive order history and customer rating volume for Chinese takeout and delivery in Abbottabad.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800">
              <div className="text-xs text-stone-400">
                Verified delivery satisfaction score
              </div>
            </div>
          </div>

        </div>

        {/* View Reviews CTA Button */}
        <div className="text-center">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Dragon+Wok+Jadoon+Plaza+Phase+1+Mandian+Abbottabad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-amber-500 px-6 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>View Verified Reviews</span>
          </a>
        </div>

      </div>
    </section>
  );
};
