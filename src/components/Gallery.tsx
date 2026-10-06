import React, { useState } from 'react';
import { ZoomIn, Info } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/menuData';
import { LightboxModal } from './LightboxModal';

type GalleryCategory = 'All' | 'Food' | 'Noodles' | 'Momos' | 'Soups' | 'Chicken' | 'Restaurant' | 'Wok';

const GALLERY_CATEGORIES: GalleryCategory[] = [
  'All',
  'Food',
  'Noodles',
  'Momos',
  'Soups',
  'Chicken',
  'Restaurant',
  'Wok',
];

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('All');
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_ITEMS[0] | null>(null);

  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="py-24 bg-[#15171c] relative border-t border-stone-800 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            VISUAL SHOWCASE
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Dragon Wok Gallery
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            A glimpse into the sizzle, steam, and culinary craftsmanship that define our wok kitchen.
          </p>
        </div>

        {/* Development Placeholder Notice as explicitly requested */}
        <div className="mb-10 max-w-2xl mx-auto bg-stone-900/80 border border-stone-800 rounded-lg p-3.5 flex items-center gap-3 text-xs text-stone-400">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Note:</strong> Imagery displayed represents culinary concept styling and development assets. Official photography for Dragon Wok Abbottabad can be seamlessly swapped into this component.
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-0 sm:flex-wrap sm:justify-center mb-10 no-scrollbar">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#991b1b] text-white shadow-md'
                  : 'bg-[#181a20] text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry-Style Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-xl overflow-hidden border border-stone-800 bg-stone-900 cursor-pointer shadow-lg hover:border-amber-500/40 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-950">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />
              </div>

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-stone-200 group-hover:text-white group-hover:bg-[#991b1b] transition-colors shrink-0">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <LightboxModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage.image}
          title={selectedImage.title}
          category={selectedImage.category}
          description={selectedImage.description}
        />
      )}
    </section>
  );
};
