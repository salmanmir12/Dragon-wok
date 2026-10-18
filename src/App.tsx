/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';

// Existing Website Components
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

// Dynamic Cart, Checkout, WhatsApp & Chatbot
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ClosedRestaurantModal } from './components/ClosedRestaurantModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Chatbot } from './components/Chatbot';
import { AuthModal } from './components/auth/AuthModal';

// Dedicated Dashboards
import { CustomerAccount } from './pages/CustomerAccount';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';

// Main Landing Page Component (Preserves all existing sections)
function HomePage() {
  return (
    <>
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
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <OrderProvider>
            <div className="min-h-screen bg-[#121316] text-[#e5e7eb] flex flex-col font-sans selection:bg-[#991b1b] selection:text-white">
              {/* Sticky Navigation with Business Hours & Role Badges */}
              <Navbar />

              {/* Main Routing Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/account" element={<CustomerAccount />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/staff" element={<StaffDashboard />} />
                  {/* Catch-all to home */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />

              {/* Authentication Modal */}
              <AuthModal />

              {/* Interactive Shopping Cart Drawer */}
              <CartDrawer />

              {/* Customer Checkout Form & Order Confirmation Modal */}
              <CheckoutModal />

              {/* Closed Restaurant Entrance Notice */}
              <ClosedRestaurantModal />

              {/* Sticky / Floating Cart Button */}
              <FloatingCartButton />

              {/* Floating WhatsApp Quick Action Button */}
              <WhatsAppFloatingButton />

              {/* Dragon Bot Assistant */}
              <Chatbot />
            </div>
          </OrderProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
