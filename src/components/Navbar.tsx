import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ShoppingBag, Clock } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, setIsCartOpen, restaurantStatus } = useOrder();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Menu', href: '#menu' },
    { name: 'About', href: '#about' },
    { name: 'Deals', href: '#deals' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav py-3 border-b border-white/10 shadow-xl'
          : 'bg-transparent py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] rounded-md"
            >
              <span className="font-serif-brand text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#f59e0b] transition-colors">
                DRAGON WOK
              </span>
            </a>

            {/* Subtle mobile status indicator */}
            <div className="sm:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-900/90 border border-stone-800 text-[10px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  restaurantStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span
                className={`font-bold uppercase tracking-wider ${
                  restaurantStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {restaurantStatus.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-stone-300 hover:text-white transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b91c1c] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary actions & Business Hours Indicator */}
          <div className="hidden sm:flex items-center gap-3.5">
            {/* Elegant Open / Closed Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs shadow-inner">
              <span
                className={`w-2 h-2 rounded-full ${
                  restaurantStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span
                className={`font-bold tracking-wider uppercase text-[11px] ${
                  restaurantStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {restaurantStatus.statusText}
              </span>
              <span className="text-stone-600">·</span>
              <span className="text-stone-400 text-[11px] font-medium">
                {restaurantStatus.subText}
              </span>
            </div>

            <a
              href="tel:03100968734"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors px-2 py-2"
              title="Call Dragon Wok"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>0310 0968734</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-red-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="ml-1 bg-amber-400 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Icons (Cart & Hamburger) */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
              className="relative p-2 text-stone-200 hover:text-white"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-400 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 text-stone-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-white/10 px-6 py-6 animate-fadeIn">
          {/* Mobile Status Tag */}
          <div className="mb-4 pb-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  restaurantStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span
                className={`font-bold uppercase ${
                  restaurantStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {restaurantStatus.statusText}
              </span>
            </div>
            <span className="text-xs text-stone-400">{restaurantStatus.subText}</span>
          </div>

          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-stone-200 hover:text-amber-400 py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-stone-800 flex flex-col gap-3">
              <a
                href="tel:03100968734"
                className="flex items-center justify-center gap-2 border border-stone-700 bg-stone-900/60 text-amber-400 py-3 rounded-md text-sm font-semibold tracking-wider uppercase"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                Call 0310 0968734
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 rounded-md text-sm font-semibold tracking-wider uppercase transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart</span>
                {totalCount > 0 && <span>({totalCount})</span>}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
