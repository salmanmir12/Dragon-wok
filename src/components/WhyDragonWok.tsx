import React from 'react';
import { Flame, ChefHat, Sparkles, MapPin } from 'lucide-react';

export const WhyDragonWok: React.FC = () => {
  const cards = [
    {
      title: 'Bold Flavors',
      description: 'Chinese-inspired dishes packed with flavor.',
      icon: Flame,
    },
    {
      title: 'Freshly Prepared',
      description: 'Food prepared fresh for every order.',
      icon: ChefHat,
    },
    {
      title: 'Wok Experience',
      description: 'A menu centered around wok-style cooking.',
      icon: Sparkles,
    },
    {
      title: 'Abbottabad Location',
      description: 'Conveniently located at Jadoon Plaza Phase 1.',
      icon: MapPin,
    },
  ];

  return (
    <section className="py-24 bg-[#15171c] relative border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            THE DRAGON WOK DIFFERENCE
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Why Dragon Wok
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Crafting memorable Chinese dining experiences for families, students, and food enthusiasts across Abbottabad.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-[#181a20] rounded-xl border border-stone-800 p-8 flex flex-col items-start hover:border-amber-500/40 transition-all duration-300 hover:translate-y-[-2px] shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
