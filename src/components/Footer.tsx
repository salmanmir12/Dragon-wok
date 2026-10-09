import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import {
  SOCIAL_LINKS,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from './SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0e0f12] text-stone-400 border-t border-stone-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-800">
          
          {/* Brand, Tagline & Social Icons */}
          <div className="md:col-span-5 space-y-4">
            <a href="#home" className="inline-flex items-center gap-3 group">
              <picture>
                <source srcSet="/images/dragon_wok_logo.webp" type="image/webp" />
                <img
                  src="/images/dragon_wok_logo.jpg"
                  alt="Dragon Wok Logo"
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shadow-md group-hover:scale-105 transition-transform"
                />
              </picture>
              <span className="font-serif-brand text-2xl font-bold tracking-wider text-white">
                DRAGON WOK
              </span>
            </a>
            <p className="font-serif-brand text-stone-300 text-sm font-medium">
              Bold Chinese Flavors in Abbottabad.
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Wok-tossed chowmein, soups, dumplings, sizzling main courses, and signature Chinese recipes prepared fresh for Abbottabad families, students, and guests.
            </p>

            {/* Prominent Footer Social Media Icons */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={SOCIAL_LINKS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LINKS.instagram.ariaLabel}
                  className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 hover:border-rose-500/50 hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Dragon Wok on Instagram"
                >
                  <InstagramIcon className="w-5 h-5 text-rose-400" />
                </a>

                <a
                  href={SOCIAL_LINKS.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LINKS.facebook.ariaLabel}
                  className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 hover:border-blue-500/50 hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Dragon Wok on Facebook"
                >
                  <FacebookIcon className="w-5 h-5 text-blue-400" />
                </a>

                <a
                  href={SOCIAL_LINKS.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LINKS.tiktok.ariaLabel}
                  className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 hover:border-stone-400/50 hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Dragon Wok on TikTok"
                >
                  <TikTokIcon className="w-5 h-5 text-stone-200" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#deals" className="hover:text-white transition-colors">
                  Special Deals
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:03100968734"
                    className="text-stone-200 font-semibold hover:text-amber-400 transition-colors"
                  >
                    0310 0968734
                  </a>
                  <p className="text-xs text-stone-500">Takeaway & Inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#b91c1c] shrink-0 mt-0.5" />
                <p className="text-stone-300 text-xs leading-relaxed">
                  Jadoon Plaza Phase 1, Mandian, Abbottabad, Khyber Pakhtunkhwa, Pakistan
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-stone-300 text-xs">
                  Open Daily: <span className="text-white font-medium">12:00 PM – 2:00 AM (PKT)</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Dragon Wok Abbottabad. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#menu" className="hover:text-stone-400 transition-colors">
              Menu Items
            </a>
            <a href="#deals" className="hover:text-stone-400 transition-colors">
              Combos
            </a>
            <a href="#location" className="hover:text-stone-400 transition-colors">
              Location
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
