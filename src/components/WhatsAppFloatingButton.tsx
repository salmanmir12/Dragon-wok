import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppChatUrl } from '../utils/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappUrl = getGeneralWhatsAppChatUrl();

  return (
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-5 right-5 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 px-3.5 py-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-950/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        title="Chat on WhatsApp with Dragon Wok"
        aria-label="Chat with Dragon Wok on WhatsApp (0310 0968734)"
      >
        <MessageCircle className="w-5 h-5 text-stone-950 fill-stone-950/20" />
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-stone-950 whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
