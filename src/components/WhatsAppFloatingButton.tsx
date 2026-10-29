import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppChatUrl, RESTAURANT_PHONE_DISPLAY } from '../utils/whatsapp';
import { useOrder } from '../context/OrderContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappUrl = getGeneralWhatsAppChatUrl();
  const { totalCount, isCartOpen, isCheckoutOpen } = useOrder();

  // Hide when checkout or cart modal is active to prevent any overlay or distraction during form entry
  if (isCheckoutOpen || isCartOpen) return null;

  return (
    <aside
      aria-label="WhatsApp customer support"
      className={`fixed z-40 transition-all duration-200 ${
        // On desktop: neatly stacked above the desktop cart button at bottom-24 right-6
        // On mobile: if bottom cart bar is present, float above it at bottom-20 right-4, else bottom-5 right-4
        totalCount > 0
          ? 'bottom-20 right-4 md:bottom-24 md:right-6'
          : 'bottom-5 right-4 md:bottom-24 md:right-6'
      }`}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white shadow-xl shadow-emerald-950/60 border-2 border-white/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        title={`Chat with Dragon Wok on WhatsApp (${RESTAURANT_PHONE_DISPLAY})`}
        aria-label="Chat with Dragon Wok on WhatsApp for assistance"
      >
        <MessageCircle className="w-6 h-6 text-white fill-white/20 group-hover:scale-110 transition-transform" />

        {/* Desktop hover badge */}
        <span className="hidden lg:group-hover:flex absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg bg-stone-900/95 border border-stone-800 text-[11px] font-semibold text-emerald-300 shadow-xl pointer-events-none items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Need Help? Chat on WhatsApp</span>
        </span>
      </a>
    </aside>
  );
};
