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
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-950/50 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        title="Chat with Dragon Wok on WhatsApp (0310 0968734)"
        aria-label="Chat with Dragon Wok on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-stone-950 fill-stone-950/30" />
      </a>
    </aside>
  );
};
