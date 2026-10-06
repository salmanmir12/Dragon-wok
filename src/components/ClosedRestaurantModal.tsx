import React, { useEffect } from 'react';
import { X, Clock, Utensils, Moon } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const ClosedRestaurantModal: React.FC = () => {
  const { isClosedModalOpen, dismissClosedModal, restaurantStatus } = useOrder();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isClosedModalOpen) {
        dismissClosedModal();
      }
    };
    if (isClosedModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isClosedModalOpen, dismissClosedModal]);

  if (!isClosedModalOpen) return null;

  const handleBrowseMenu = () => {
    dismissClosedModal();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={dismissClosedModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="closed-modal-title"
    >
      <div
        className="relative max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 shadow-2xl p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={dismissClosedModal}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close notice"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Indicator Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center mx-auto mb-5 text-rose-400">
          <Moon className="w-8 h-8" />
        </div>

        {/* Small Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-400 text-xs font-semibold tracking-wider uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Currently Closed</span>
        </div>

        {/* Main Heading */}
        <h3
          id="closed-modal-title"
          className="font-serif-brand text-2xl sm:text-3xl font-bold text-white mb-2"
        >
          Dragon Wok is Currently Closed
        </h3>

        {/* Description & Operating Hours */}
        <p className="text-stone-300 text-sm font-medium mb-3">
          We're currently closed.
        </p>

        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 mb-5 flex items-center justify-center gap-2 text-xs text-amber-400 font-semibold">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Opening Hours: 12:00 PM – 2:00 AM (PKT)</span>
        </div>

        <p className="text-stone-400 text-xs leading-relaxed mb-6">
          You can still browse our menu and add items to your cart. Your order will be prepared as soon as the kitchen opens at 12:00 PM.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleBrowseMenu}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Menu</span>
          </button>

          <button
            onClick={dismissClosedModal}
            className="w-full inline-flex items-center justify-center py-3 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Close
          </button>
        </div>

        {/* Current Time in Pakistan */}
        <div className="mt-5 text-[11px] text-stone-500">
          Current Abbottabad Time: {restaurantStatus.pakistanTimeFormatted}
        </div>
      </div>
    </div>
  );
};
