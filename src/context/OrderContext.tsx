import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkIsRestaurantOpen, RestaurantStatus } from '../utils/businessHours';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  portionLabel?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  orderType: 'Delivery' | 'Pickup';
  address: string;
  notes: string;
}

interface OrderContextType {
  items: CartItem[];
  addItem: (item: { id: string; name: string; price: number; category?: string; portionLabel?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  totalPrice: number;
  totalCount: number;
  restaurantStatus: RestaurantStatus;
  isClosedModalOpen: boolean;
  setIsClosedModalOpen: (open: boolean) => void;
  dismissClosedModal: () => void;
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted cart
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dragonwok_order_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Business hours status with auto-update
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus>(() => checkIsRestaurantOpen());
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);

  // Customer checkout form state
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    orderType: 'Delivery',
    address: '',
    notes: '',
  });

  // Periodic business hours checker (every 30 seconds)
  useEffect(() => {
    const updateStatus = () => {
      setRestaurantStatus(checkIsRestaurantOpen());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show closed popup once per session if restaurant is closed upon arrival
  useEffect(() => {
    try {
      const hasDismissed = sessionStorage.getItem('dragonwok_closed_modal_dismissed');
      if (!restaurantStatus.isOpen && !hasDismissed) {
        // Small delay so entrance animation feels natural
        const timer = setTimeout(() => {
          setIsClosedModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore session storage limitations
    }
  }, [restaurantStatus.isOpen]);

  const dismissClosedModal = useCallback(() => {
    setIsClosedModalOpen(false);
    try {
      sessionStorage.setItem('dragonwok_closed_modal_dismissed', 'true');
    } catch {
      // ignore
    }
  }, []);

  // Persist cart items
  useEffect(() => {
    try {
      localStorage.setItem('dragonwok_order_cart', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = useCallback(
    (item: { id: string; name: string; price: number; category?: string; portionLabel?: string }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            category: item.category,
            portionLabel: item.portionLabel,
          },
        ];
      });
      setIsCartOpen(true);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        totalPrice,
        totalCount,
        restaurantStatus,
        isClosedModalOpen,
        setIsClosedModalOpen,
        dismissClosedModal,
        customerDetails,
        setCustomerDetails,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
