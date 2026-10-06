/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrderProvider } from './context/OrderContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RatingBar } from './components/RatingBar';
import { About } from './components/About';
import { FeaturedDishes } from './components/FeaturedDishes';
import { Menu } from './components/Menu';
import { WhyDragonWok } from './components/WhyDragonWok';
import { Deals } from './components/Deals';
import { Gallery } from './components/Gallery';
import { Reviews } from './components/Reviews';
import { OrderCTA } from './components/OrderCTA';
import { Location } from './components/Location';
import { Contact } from './components/Contact';
import { SocialSection } from './components/SocialSection';
import { Footer } from './components/Footer';

// Dynamic Cart, Checkout, Business Hours, WhatsApp & Chatbot components
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ClosedRestaurantModal } from './components/ClosedRestaurantModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Chatbot } from './components/Chatbot';

export default function App() {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-[#121316] text-[#e5e7eb] flex flex-col font-sans selection:bg-[#991b1b] selection:text-white">
        {/* 1. Sticky Navigation with Live Business Hours Status */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-1">
          {/* 2. Hero */}
          <Hero />

          {/* 3. Restaurant Rating / Trust Bar */}
          <RatingBar />

          {/* 4. About Dragon Wok */}
          <About />

          {/* 5. Featured Dishes */}
          <FeaturedDishes />

          {/* 6. Complete Menu with Portion Selectors & Add to Cart */}
          <Menu />

          {/* 7. Why Dragon Wok */}
          <WhyDragonWok />

          {/* 8. Special Deals with Direct Cart Integration */}
          <Deals />

          {/* 9. Gallery */}
          <Gallery />

          {/* 10. Ratings / Reviews */}
          <Reviews />

          {/* 11. Order CTA */}
          <OrderCTA />

          {/* 12. Location */}
          <Location />

          {/* 13. Contact */}
          <Contact />

          {/* 14. Follow Dragon Wok Social Channels */}
          <SocialSection />
        </main>

        {/* 15. Footer with prominent social integration */}
        <Footer />

        {/* Interactive Shopping Cart Drawer */}
        <CartDrawer />

        {/* Customer Checkout Form & Order Confirmation Modal */}
        <CheckoutModal />

        {/* Tasteful Closed Restaurant Entrance Notice */}
        <ClosedRestaurantModal />

        {/* Sticky / Floating Cart Button */}
        <FloatingCartButton />

        {/* Floating WhatsApp Quick Action Button */}
        <WhatsAppFloatingButton />

        {/* Small Interactive Dragon Bot Assistant */}
        <Chatbot />
      </div>
    </OrderProvider>
  );
}
