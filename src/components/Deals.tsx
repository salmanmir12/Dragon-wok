import React from 'react';
import { Sparkles, Utensils } from 'lucide-react';
import { SPECIAL_DEALS } from '../data/menuData';
import { DealCard } from './DealCard';

export const Deals: React.FC = () => {
  return (
    <section id="deals" className="py-24 bg-[#121316] relative scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VALUE COMBOS & PACKAGES</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Special Deals
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Curated combinations featuring signature mains, momos, wings, and wok fried rice designed for sharing.
          </p>
        </div>

        {/* Two Groups: Super Deals and Dragon Deals */}
        <div className="space-y-12">
          
          {/* Super Deals */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-amber-500/60" />
              <h3 className="font-serif-brand text-xl font-bold text-amber-400 uppercase tracking-wider">
                Super Deals
              </h3>
              <span className="flex-1 h-[1px] bg-stone-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPECIAL_DEALS.filter((d) => d.id.startsWith('deal-super')).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>

          {/* Dragon Deals */}
          <div>
            <div className="flex items-center gap-3 mb-6 pt-6">
              <span className="w-8 h-[1px] bg-[#b91c1c]" />
              <h3 className="font-serif-brand text-xl font-bold text-rose-400 uppercase tracking-wider">
                Dragon Feast Deals
              </h3>
              <span className="flex-1 h-[1px] bg-stone-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPECIAL_DEALS.filter((d) => d.id.startsWith('deal-dragon')).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>

        </div>

        {/* Deals Ordering Note */}
        <div className="mt-12 p-6 rounded-xl bg-stone-900/60 border border-stone-800 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-stone-300 text-sm">
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Deals are available for dine-in, takeaway, and direct phone order dispatch.</span>
          </div>
        </div>

      </div>
    </section>
  );
};
