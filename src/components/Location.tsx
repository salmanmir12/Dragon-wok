import React from 'react';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';

export const Location: React.FC = () => {
  const directionsUrl =
    'https://www.google.com/maps/search/?api=1&query=Dragon+Wok+Jadoon+Plaza+Phase+1+Mandian+Abbottabad+Khyber+Pakhtunkhwa';

  return (
    <section id="location" className="py-24 bg-[#121316] relative scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            VISIT OUR RESTAURANT
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Find Dragon Wok
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Located in the Mandian dining hub of Abbottabad at Jadoon Plaza Phase 1.
          </p>
        </div>

        {/* Location Grid: Details Card & Styled Map Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Details Card */}
          <div className="lg:col-span-5 bg-[#181a20] rounded-2xl border border-stone-800 p-8 sm:p-10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-6">
                <MapPin className="w-4 h-4 text-[#b91c1c]" />
                <span>Abbottabad Branch</span>
              </div>

              <h3 className="font-serif-brand text-2xl font-bold text-white mb-6">
                Jadoon Plaza Phase 1
              </h3>

              <div className="space-y-6 text-sm">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400 block mb-0.5">
                      Address
                    </span>
                    <p className="text-stone-200 font-medium leading-relaxed">
                      Jadoon Plaza Phase 1, Mandian, Abbottabad, Khyber Pakhtunkhwa, Pakistan
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400 block mb-0.5">
                      Phone
                    </span>
                    <a
                      href="tel:03100968734"
                      className="text-stone-100 font-bold hover:text-amber-400 transition-colors"
                    >
                      0310 0968734
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-stone-400 block mb-0.5">
                      Opening Time
                    </span>
                    <p className="text-stone-200 font-medium">
                      12:00 PM onwards daily
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions Button */}
            <div className="mt-8 pt-6 border-t border-stone-800">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3.5 px-6 rounded-md font-semibold text-xs uppercase tracking-wider transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Styled Map Preview Card */}
          <div className="lg:col-span-7 bg-[#181a20] rounded-2xl border border-stone-800 p-6 flex flex-col justify-between overflow-hidden shadow-xl relative min-h-[360px]">
            {/* Visual map backdrop design with dark aesthetic */}
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-900 border border-stone-800/80 flex flex-col items-center justify-center p-8 text-center bg-subtle-pattern">
              <div className="w-16 h-16 rounded-full bg-[#991b1b]/20 border border-[#b91c1c]/40 flex items-center justify-center mb-4 text-[#b91c1c]">
                <MapPin className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>

              <h4 className="font-serif-brand text-2xl font-bold text-white mb-2">
                Mandian, Abbottabad
              </h4>

              <p className="max-w-md text-stone-300 text-sm mb-6">
                Prominently situated in Jadoon Plaza Phase 1. Easily accessible by car, cab, or local transport.
              </p>

              <div className="inline-flex items-center gap-3">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-600 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Landmark notes */}
              <div className="mt-8 pt-4 border-t border-stone-800/80 text-[11px] text-stone-400 max-w-sm">
                Mandian commercial district · Accessible parking nearby · Central Abbottabad
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
