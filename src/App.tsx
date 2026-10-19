/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';

// Clean Single-Page Ordering Components (Flame On & KFC Style)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RatingBar } from './components/RatingBar';
import { Menu } from './components/Menu';
import { Footer } from './components/Footer';

// Real-time Shopping Cart & Checkout Modals
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ClosedRestaurantModal } from './components/ClosedRestaurantModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { AuthModal } from './components/auth/AuthModal';

// Dedicated Dashboards & Kitchen Voice Alert Terminal
import { CustomerAccount } from './pages/CustomerAccount';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';

// Pure digital menu card & direct ordering layout (Eliminates blog posts, articles & extra detail sections)
function HomePage() {
  return (
    <>
      {/* 1. Fast Ordering Top Hero Banner */}
      <Hero />

      {/* 2. Restaurant Rating & Abbottabad Delivery Trust Bar */}
      <RatingBar />

      {/* 3. Central Digital Menu Card with Sticky Categories & Direct Ordering */}
      <Menu />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <OrderProvider>
            <div className="min-h-screen bg-[#101216] text-[#e5e7eb] flex flex-col font-sans selection:bg-[#991b1b] selection:text-white">
              {/* Sticky Navigation with Business Hours, Cart Counter & Quick Links */}
              <Navbar />

              {/* Main Routing Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/kitchen" element={<KitchenDashboard />} />
                  <Route path="/staff" element={<KitchenDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/account" element={<CustomerAccount />} />
                  {/* Catch-all to home */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Clean Restaurant Footer */}
              <Footer />

              {/* Authentication Modal */}
              <AuthModal />

              {/* Real-Time Shopping Cart Drawer */}
              <CartDrawer />

              {/* Customer Checkout & Order Placement Modal */}
              <CheckoutModal />

              {/* Closed Restaurant Notice */}
              <ClosedRestaurantModal />

              {/* Sticky Floating Cart Button */}
              <FloatingCartButton />

              {/* WhatsApp Quick Action Button */}
              <WhatsAppFloatingButton />
            </div>
          </OrderProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
