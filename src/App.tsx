/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';

// Clean Single-Page Ordering Components (KFC & Food-Ordering Style)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
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

// Pure digital menu card & direct ordering layout (Menu-First Homepage)
function HomePage() {
  return (
    <>
      {/* 1. Compact Brand & "Order Your Favorites" Header */}
      <Hero />

      {/* 2. Menu Categories, Search & Food Cards with Instant Add Controls */}
      <Menu />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <MenuProvider>
            <OrderProvider>
              <div
                className="min-h-screen flex flex-col font-sans selection:bg-[#991b1b] selection:text-white transition-colors duration-300"
                style={{ backgroundColor: 'var(--color-bg, #101216)', color: 'var(--color-text, #e5e7eb)' }}
              >
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
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);
}
