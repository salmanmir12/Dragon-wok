import React from 'react';
import { Sparkles, Utensils, Flame, Users2 } from 'lucide-react';

export const About: React.FC = () => {
  const features = [
    {
      title: 'Freshly Prepared',
      description: 'Food prepared fresh for every order.',
      icon: Sparkles,
    },
    {
      title: 'Chinese-Inspired Flavors',
      description: 'A menu built around familiar Chinese and Asian-inspired favorites.',
      icon: Utensils,
    },
    {
      title: 'Wok Experience',
      description: 'A menu centered around wok-style cooking.',
      icon: Flame,
    },
    {
      title: 'Family Friendly',
      description: 'A comfortable option for families, friends and casual dining.',
      icon: Users2,
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#121316] relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#991b1b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Atmospheric Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl group">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="/src/assets/images/dish_hot_pot_1791288849803.jpg"
                  alt="Sizzling wok cuisine and bubbling hot pot at Dragon Wok Abbottabad"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
              </div>

              {/* Scrim and Overlay Tag */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                      Signature Tradition
                    </p>
                    <p className="font-serif-brand text-lg text-white font-bold">
                      WOK • FIRE • FLAVOR
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#991b1b]/30 border border-[#b91c1c]/50 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Accent Frame */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-full h-full border border-amber-500/20 rounded-2xl -z-10" />
          </div>

          {/* Right Column: Text & Structured Features */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
              <span>OUR PHILOSOPHY</span>
            </div>

            <h2 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Welcome to <span className="text-amber-400">Dragon Wok</span> Abbottabad
            </h2>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed mb-10">
              Dragon Wok brings bold Chinese flavors to Abbottabad with a menu inspired by classic Asian favorites and modern wok-style cooking. From flavorful chowmein and fried rice to momos, soups, wings, and signature dishes, every plate is prepared to deliver a satisfying combination of taste, freshness, and texture.
            </p>

            {/* Feature Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
              {features.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div key={feat.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-stone-400 leading-snug">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
