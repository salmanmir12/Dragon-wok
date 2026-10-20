import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ShoppingBag, Clock, User, ShieldCheck, ChefHat } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, totalPrice, setIsCartOpen, restaurantStatus } = useOrder();
  const { user, isAdmin, isStaff, setAuthModalOpen, setAuthModalView } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Menu', href: '/#menu' },
    { name: 'Deals & Combos', href: '/#menu' },
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
          {/* Zone 1: Logo & Name */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Dragon Wok Home"
              className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] rounded-lg"
            >
              <picture>
                <source srcSet="/images/dragon_wok_logo.webp" type="image/webp" />
                <img
                  src="/images/dragon_wok_logo.jpg"
                  alt="Dragon Wok Logo"
                  className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-amber-500/40 shadow-md group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300"
                />
              </picture>
              <span className="font-serif-brand text-lg sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#f59e0b] transition-colors">
                DRAGON WOK
              </span>
            </Link>

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
          <div className="hidden sm:flex items-center gap-3">
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

            {/* Elevated Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#991b1b]/30 hover:bg-[#991b1b]/50 border border-[#b91c1c]/60 text-xs font-bold text-rose-300 transition"
                title="Open Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Elevated Staff Link */}
            {isStaff && (
              <Link
                to="/staff"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition"
                title="Open Staff Kitchen Board"
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>Kitchen</span>
              </Link>
            )}

            {/* Customer Account Button */}
            {user ? (
              <Link
                to="/account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white transition"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Account</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthModalView('login');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white transition"
              >
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="ml-1 bg-amber-400 text-stone-950 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {totalCount} • Rs. {totalPrice.toLocaleString()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Icons (Account, Cart, Hamburger) */}
          <div className="flex sm:hidden items-center gap-2">
            {user ? (
              <Link
                to="/account"
                aria-label="My Account"
                className="p-2 text-stone-200 hover:text-white"
              >
                <User className="w-5 h-5 text-amber-400" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthModalView('login');
                  setAuthModalOpen(true);
                }}
                aria-label="Sign In"
                className="p-2 text-stone-300 hover:text-white text-xs font-semibold"
              >
                Sign In
              </button>
            )}

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

            <div className="pt-4 border-t border-stone-800 flex flex-col gap-2.5">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-[#b91c1c]/60 bg-[#991b1b]/20 text-rose-300 py-2.5 rounded-md text-xs font-bold uppercase"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  Admin Dashboard
                </Link>
              )}

              {isStaff && (
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/10 text-amber-300 py-2.5 rounded-md text-xs font-bold uppercase"
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  Kitchen Staff Board
                </Link>
              )}

              {user ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-stone-700 bg-stone-900/80 text-white py-2.5 rounded-md text-xs font-semibold"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  My Customer Account
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalView('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 border border-stone-700 bg-stone-900/80 text-white py-2.5 rounded-md text-xs font-semibold"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  Sign In / Register
                </button>
              )}

              <a
                href="tel:03100968734"
                className="flex items-center justify-center gap-2 border border-stone-700 bg-stone-900/60 text-amber-400 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                Call 0310 0968734
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart {totalCount > 0 && `(${totalCount})`}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
