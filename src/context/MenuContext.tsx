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
import { MENU_ITEMS, SPECIAL_DEALS, MenuItem as DefaultMenuItem } from '../data/menuData';

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
  validateCartItems: (cartItems: {
    id: string;
    quantity: number;
    name?: string;
    price?: number;
    category?: string;
    portionLabel?: string;
  }[]) => {
    validatedItems: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      category: string;
      portionLabel?: string | null;
      itemTotal: number;
    }[];
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

  const getItemById = (id: string): DynamicMenuItem | undefined => {
    // 1. Direct match in Firestore dynamic menuItems
    const direct = menuItems.find((m) => m.id === id);
    if (direct) return direct;

    // 2. Base ID match (strip portion suffixes like -regular or -family)
    const baseId = id.replace(/-(regular|family)$/, '');
    const baseMatch = menuItems.find((m) => m.id === baseId);
    if (baseMatch) return baseMatch;

    // 3. Fallback to default static MENU_ITEMS
    const staticItem = MENU_ITEMS.find((s) => s.id === id || s.id === baseId);
    if (staticItem) {
      return {
        id: staticItem.id,
        name: staticItem.name,
        category: staticItem.category,
        price: staticItem.price ?? 0,
        familyPrice: staticItem.familyPrice,
        description: staticItem.note,
        image: staticItem.image,
        available: true,
        badge: staticItem.badge,
      };
    }

    // 4. Fallback to SPECIAL_DEALS
    const dealItem = SPECIAL_DEALS.find((d) => d.id === id || d.id === baseId);
    if (dealItem) {
      return {
        id: dealItem.id,
        name: dealItem.title,
        category: 'Deals',
        price: dealItem.price,
        description: dealItem.items.join(', '),
        available: true,
        badge: dealItem.badge,
      };
    }

    return undefined;
  };

  // Secure price calculation & validation against canonical catalog and real cart state
  const validateCartItems = (cartItems: {
    id: string;
    quantity: number;
    name?: string;
    price?: number;
    category?: string;
    portionLabel?: string;
  }[]) => {
    const validatedItems = cartItems.map((cartItem) => {
      const match = getItemById(cartItem.id);

      // Determine canonical price with family portion support
      let canonicalPrice = match ? match.price : 0;
      if (match && cartItem.portionLabel === 'Family' && match.familyPrice) {
        canonicalPrice = match.familyPrice;
      }

      // If price from catalog is 0 but item in cart has a valid positive price, trust cart price
      if (canonicalPrice <= 0 && typeof cartItem.price === 'number' && cartItem.price > 0) {
        canonicalPrice = cartItem.price;
      }

      // Determine name (never return "Unknown Item" if cartItem.name exists)
      let itemName = cartItem.name?.trim();
      if (!itemName || itemName === 'Unknown Item') {
        itemName = match ? match.name : 'Dragon Wok Dish';
      }

      const quantity = Math.max(1, Number(cartItem.quantity) || 1);
      const itemTotal = canonicalPrice * quantity;

      return {
        id: cartItem.id,
        name: itemName,
        price: canonicalPrice,
        quantity,
        category: match ? match.category : (cartItem.category || 'General'),
        portionLabel: cartItem.portionLabel || null,
        itemTotal,
      };
    });

    const subtotal = validatedItems.reduce((acc, curr) => acc + curr.itemTotal, 0);
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
