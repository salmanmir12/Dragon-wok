import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  SOCIAL_LINKS,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from './SocialIcons';

export const SocialSection: React.FC = () => {
  const socialCards = [
    {
      name: SOCIAL_LINKS.instagram.name,
      handle: SOCIAL_LINKS.instagram.handle,
      url: SOCIAL_LINKS.instagram.url,
      ariaLabel: SOCIAL_LINKS.instagram.ariaLabel,
      icon: InstagramIcon,
      hoverBorder: 'hover:border-rose-500/50 hover:shadow-rose-950/20',
      iconColor: 'text-rose-400 group-hover:text-rose-300',
      accentBg: 'group-hover:bg-rose-500/10',
    },
    {
      name: SOCIAL_LINKS.facebook.name,
      handle: SOCIAL_LINKS.facebook.handle,
      url: SOCIAL_LINKS.facebook.url,
      ariaLabel: SOCIAL_LINKS.facebook.ariaLabel,
      icon: FacebookIcon,
      hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-950/20',
      iconColor: 'text-blue-400 group-hover:text-blue-300',
      accentBg: 'group-hover:bg-blue-500/10',
    },
    {
      name: SOCIAL_LINKS.tiktok.name,
      handle: SOCIAL_LINKS.tiktok.handle,
      url: SOCIAL_LINKS.tiktok.url,
      ariaLabel: SOCIAL_LINKS.tiktok.ariaLabel,
      icon: TikTokIcon,
      hoverBorder: 'hover:border-stone-400/50 hover:shadow-stone-900/20',
      iconColor: 'text-stone-300 group-hover:text-white',
      accentBg: 'group-hover:bg-white/10',
    },
  ];

  return (
    <section
      aria-label="Follow Dragon Wok on Social Media"
      className="py-20 bg-[#121316] relative border-t border-stone-800/80"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            OFFICIAL CHANNELS
          </div>
          <h2 className="font-serif-brand text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Follow Dragon Wok
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Stay connected with Dragon Wok for food updates, new dishes, deals, and more.
          </p>
        </div>

        {/* 3 Social Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {socialCards.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                className={`group relative bg-[#181a20] rounded-xl border border-stone-800 p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] shadow-lg ${item.hoverBorder} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[140px]`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center transition-colors ${item.accentBg}`}
                  >
                    <Icon className={`w-6 h-6 transition-colors ${item.iconColor}`} />
                  </div>
                  <div className="p-1.5 rounded-md text-stone-500 group-hover:text-stone-200 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                    {item.name}
                  </span>
                  <p className="font-serif-brand text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.handle}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
