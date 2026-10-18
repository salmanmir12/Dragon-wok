import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { MENU_ITEMS, MenuItem as DefaultMenuItem } from '../data/menuData';

export interface DynamicMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  familyPrice?: number;
  description?: string;
  image?: string;
  available: boolean;
  badge?: string;
  updatedAt?: string;
}

export interface RestaurantSettings {
  isOpenOverride: boolean | null;
  announcement: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  phone: string;
  address: string;
  minOrderAmount: number;
}

interface MenuContextType {
  menuItems: DynamicMenuItem[];
  settings: RestaurantSettings;
  loading: boolean;
  addMenuItem: (item: Omit<DynamicMenuItem, 'id'>) => Promise<string>;
  updateMenuItem: (id: string, item: Partial<DynamicMenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string, current: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => Promise<void>;
  seedDefaultMenu: () => Promise<number>;
  getItemById: (id: string) => DynamicMenuItem | undefined;
  validateCartItems: (cartItems: { id: string; quantity: number; portionLabel?: string }[]) => {
    validatedItems: { id: string; name: string; price: number; quantity: number; category: string; portionLabel?: string }[];
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  isOpenOverride: null,
  announcement: 'Fresh wok dishes tossed to order • Delivery across Abbottabad',
  deliveryFee: 150,
  estimatedDeliveryTime: '30-45 mins',
  phone: '0310 0968734',
  address: 'Jadoon Plaza Phase 1, Mandian, Abbottabad',
  minOrderAmount: 300,
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>(() => {
    // Initial fallback from static catalog
    return MENU_ITEMS.map((item: DefaultMenuItem) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price ?? 0,
      familyPrice: item.familyPrice,
      description: item.note || '',
      image: item.image || '/images/hero_wok_fire.jpg',
      available: true,
      badge: item.badge,
    }));
  });

  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Real-time listener for Firestore /menu_items
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      if (!snapshot.empty) {
        const items: DynamicMenuItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<DynamicMenuItem, 'id'>) });
        });
        setMenuItems(items);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Menu collection listener warning:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Real-time listener for /restaurant_settings/config
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'restaurant_settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...(docSnap.data() as Partial<RestaurantSettings>) });
      }
    }, (err) => {
      console.warn('Settings listener error:', err.message);
    });

    return () => unsub();
  }, []);

  const addMenuItem = async (item: Omit<DynamicMenuItem, 'id'>) => {
    const cleanId = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) + '-' + Date.now().toString().slice(-4);
    const docRef = doc(db, 'menu_items', cleanId);
    try {
      await setDoc(docRef, {
        ...item,
        updatedAt: new Date().toISOString(),
      });
      return cleanId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `menu_items/${cleanId}`);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<DynamicMenuItem>) => {
    const docRef = doc(db, 'menu_items', id);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `menu_items/${id}`);
    }
  };

  const deleteMenuItem = async (id: string) => {
    const docRef = doc(db, 'menu_items', id);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu_items/${id}`);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateMenuItem(id, { available: !current });
  };

  const updateSettings = async (newSettings: Partial<RestaurantSettings>) => {
    const docRef = doc(db, 'restaurant_settings', 'config');
    try {
      await setDoc(docRef, {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurant_settings/config');
    }
  };

  const seedDefaultMenu = async (): Promise<number> => {
    let count = 0;
    try {
      for (const item of MENU_ITEMS) {
        const docRef = doc(db, 'menu_items', item.id);
        await setDoc(docRef, {
          name: item.name,
          category: item.category,
          price: item.price ?? 0,
          familyPrice: item.familyPrice || null,
          description: item.note || '',
          image: item.image || '/images/hero_wok_fire.jpg',
          available: true,
          badge: item.badge || null,
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      return count;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menu_items');
    }
  };

  const getItemById = (id: string) => {
    return menuItems.find((m) => m.id === id);
  };

  // Secure price calculation & validation against canonical catalog
  const validateCartItems = (cartItems: { id: string; quantity: number; portionLabel?: string }[]) => {
    const validatedItems = cartItems.map((cartItem) => {
      const match = getItemById(cartItem.id);
      let canonicalPrice = match ? match.price : 0;
      if (match && cartItem.portionLabel === 'Family' && match.familyPrice) {
        canonicalPrice = match.familyPrice;
      }
      return {
        id: cartItem.id,
        name: match ? match.name : 'Unknown Item',
        price: canonicalPrice,
        quantity: Math.max(1, cartItem.quantity),
        category: match ? match.category : 'General',
        portionLabel: cartItem.portionLabel,
      };
    });

    const subtotal = validatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const deliveryFee = settings.deliveryFee || 150;
    const total = subtotal + deliveryFee;

    return { validatedItems, subtotal, deliveryFee, total };
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        settings,
        loading,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleAvailability,
        updateSettings,
        seedDefaultMenu,
        getItemById,
        validateCartItems,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
