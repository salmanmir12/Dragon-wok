import React from 'react';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { FEATURED_DISHES } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

export const FeaturedDishes: React.FC = () => {
  const { addItem } = useOrder();

  return (
    <section className="py-24 bg-[#15171c] relative border-t border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
              CULINARY HIGHLIGHTS
            </div>
            <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Featured Specialties
            </h2>
          </div>
          <p className="text-stone-400 text-sm max-w-md mt-3 md:mt-0">
            Hand-selected favorites wok-tossed to order using fresh ingredients and high-heat cooking.
          </p>
        </div>

        {/* 6 Featured Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_DISHES.map((dish) => (
            <div
              key={dish.id}
              className="group bg-[#1a1d24] rounded-xl border border-stone-800 overflow-hidden hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {/* Dish Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                <img
                  src={dish.image}
                  alt={`${dish.name} - Dragon Wok Abbottabad`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/hero_wok_fire.jpg';
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />
                
                {/* Visual Scrim for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category & Badge indicator (unboxed metadata & clean tag) */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-xs font-medium text-amber-300 bg-stone-950/80 px-2.5 py-1 rounded backdrop-blur-sm border border-stone-800">
                  <span>{dish.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{dish.badge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {dish.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 text-stone-200 font-bold text-lg mb-6 tabular-nums">
                    <span className="text-amber-400 text-sm font-semibold">Rs.</span>
                    <span>{dish.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-stone-800/80">
                  <a
                    href="#menu"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-stone-300 hover:text-white bg-stone-800/60 hover:bg-stone-800 rounded-md transition-colors"
                  >
                    <span>View Menu</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() =>
                      addItem({
                        id: dish.id,
                        name: dish.name,
                        price: dish.price,
                        category: dish.category,
                      })
                    }
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#991b1b] hover:bg-[#b91c1c] rounded-md transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title={`Add ${dish.name} to Cart`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note on imagery replacement */}
        <div className="mt-8 text-center text-xs text-stone-500">
          Photographic presentation for menu representation. Prepared fresh to order at Dragon Wok Abbottabad.
        </div>

      </div>
    </section>
  );
};
