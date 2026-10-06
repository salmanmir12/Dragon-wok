export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Soup' | 'Chicken' | 'Beef' | 'Fish' | 'Noodles' | 'Momos' | 'Hot Pot' | 'Drinks' | 'Deals';
  price?: number;
  familyPrice?: number;
  familyLabel?: string;
  ingredients?: string[];
  isSignature?: boolean;
  isPopular?: boolean;
  image?: string;
  note?: string;
}

export interface SpecialDeal {
  id: string;
  title: string;
  price: number;
  items: string[];
  badge?: string;
  popular?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // --- STARTERS ---
  { id: 'st-1', name: 'Plain Fries', category: 'Starters', price: 300 },
  { id: 'st-2', name: 'Honey Wings', category: 'Starters', price: 600 },
  { id: 'st-3', name: 'Korean Chicken', category: 'Starters', price: 500, isPopular: true },
  { id: 'st-4', name: 'BBQ Wings', category: 'Starters', price: 650 },
  { id: 'st-5', name: 'Drum Sticks', category: 'Starters', price: 250 },
  { id: 'st-6', name: 'Finger Fish (6 Pcs)', category: 'Starters', price: 950 },
  { id: 'st-7', name: 'Daka Fish', category: 'Starters', price: 850 },
  { id: 'st-8', name: 'Daka Chicken', category: 'Starters', price: 700 },
  { id: 'st-9', name: 'Chicken Chilli Chips', category: 'Starters', price: 900 },
  { id: 'st-10', name: 'Chicken Chasewunts Chips', category: 'Starters', price: 900 },
  { id: 'st-11', name: 'Chicken Manchurian Chips', category: 'Starters', price: 900 },

  // --- SOUP ---
  { 
    id: 'sp-1', 
    name: 'Dragon Special Soup', 
    category: 'Soup', 
    price: 550, 
    familyPrice: 2000, 
    familyLabel: 'Family',
    isPopular: true 
  },
  { 
    id: 'sp-2', 
    name: 'Chicken Dumpling Noodle Soup', 
    category: 'Soup', 
    price: 1500, 
    familyLabel: 'Family Bowl' 
  },
  { 
    id: 'sp-3', 
    name: 'Szechwan Soup', 
    category: 'Soup', 
    price: 500, 
    familyPrice: 1500, 
    familyLabel: 'Family' 
  },
  { 
    id: 'sp-4', 
    name: 'Chicken Corn Soup', 
    category: 'Soup', 
    price: 300, 
    familyPrice: 1100, 
    familyLabel: 'Family' 
  },
  { 
    id: 'sp-5', 
    name: 'Hot & Sour Soup', 
    category: 'Soup', 
    price: 400, 
    familyPrice: 1500, 
    familyLabel: 'Family',
    image: 'https://unsplash.com',
    isPopular: true 
  },
  { 
    id: 'sp-6', 
    name: 'Chicken Noodle Soup', 
    category: 'Soup', 
    price: 1200, 
    familyLabel: 'Family Bowl' 
  },

  // --- CHICKEN MAIN COURSE ---
  { id: 'ck-1', name: 'Chicken Manchurian', category: 'Chicken', price: 1400, image: 'https://unsplash.com', isPopular: true },
  { id: 'ck-2', name: 'Chicken Cashewnut', category: 'Chicken', price: 1400 },
  { id: 'ck-3', name: 'Chicken Chilli Dry', category: 'Chicken', price: 1400, isPopular: true },
  { id: 'ck-4', name: 'Kungpow Chicken', category: 'Chicken', price: 1400 },
  { id: 'ck-5', name: 'Szechwan Chicken', category: 'Chicken', price: 1400 },
  { id: 'ck-6', name: 'Seasme Honey Chicken', category: 'Chicken', price: 1400 },
  { id: 'ck-7', name: 'Garlic Chicken', category: 'Chicken', price: 1400 },
  { id: 'ck-8', name: 'Chicken Chilli Onion', category: 'Chicken', price: 1400 },
  { id: 'ck-9', name: 'Chicken W/ Oyster Sauce', category: 'Chicken', price: 1400 },
  { id: 'ck-10', name: 'Sweet & Sour Chicken', category: 'Chicken', price: 1400 },

  // --- BEEF ---
  { id: 'bf-1', name: 'Beef Chilli Dry', category: 'Beef', price: 1500, isPopular: true },
  { id: 'bf-2', name: 'Pepper Beef', category: 'Beef', price: 1500 },
  { id: 'bf-3', name: 'Beef in Oyster Sauce', category: 'Beef', price: 1500 },
  { id: 'bf-4', name: 'Beef Chilli Onion', category: 'Beef', price: 1500 },
  { id: 'bf-5', name: 'Szechwan Beef', category: 'Beef', price: 1500 },

  // --- FISH ---
  { id: 'fs-1', name: 'Kungpow Fish', category: 'Fish', price: 1600 },
  { id: 'fs-2', name: 'Sweet & Sour Fish', category: 'Fish', price: 1600 },
  { id: 'fs-3', name: 'Garlic Fish', category: 'Fish', price: 1600 },
  { id: 'fs-4', name: 'Fish Chilli Dry', category: 'Fish', price: 1600 },

  // --- NOODLES ---
  { 
    id: 'nd-1', 
    name: 'Chicken Chowmein', 
    category: 'Noodles', 
    price: 749,
    image: 'https://unsplash.com',
    isPopular: true 
  },
  { id: 'nd-2', name: 'Vegetable Chowmein', category: 'Noodles', price: 549 },
  { id: 'nd-3', name: 'Beef Chowmein', category: 'Noodles', price: 949 },
  { 
    id: 'nd-4', 
    name: 'Dragon Chowmein', 
    category: 'Noodles', 
    price: 849, 
    image: 'https://unsplash.com',
    isSignature: true,
    isPopular: true 
  },

  // --- MOMOS ---
  { id: 'mo-1', name: 'Steam Momos (1 Plate)', category: 'Momos', price: 500, isPopular: true },
  { 
    id: 'mo-2', 
    name: 'Fried Momos (1 Plate)', 
    category: 'Momos', 
    price: 550, 
    image: 'https://unsplash.com',
    isPopular: true 
  },
  { id: 'mo-3', name: 'Half Fried Momos', category: 'Momos', price: 550 },
  { id: 'mo-4', name: 'Special Momos', category: 'Momos', price: 800 },
  { id: 'mo-5', name: 'Chilli Momos', category: 'Momos', price: 800 },
  { id: 'mo-6', name: 'Manchurian Momos', category: 'Momos', price: 800 },

  // --- SZECHWAN HOT POT (SIGNATURE) ---
  {
    id: 'hp-1',
    name: 'Szechwan Hot Pot',
    category: 'Hot Pot',
    price: 2500,
    isSignature: true,
    isPopular: true,
    image: 'https://unsplash.com',
    ingredients: [
      'Noodles',
      'Sausages',
      'Peanut butter',
      'Mushroom',
      'Chicken',
      'Momos',
      'Szechuan pasta',
      'Veggies',
      'Egg'
    ],
    note: 'Dragon Wok Signature Experience'
  },

  // --- DRINKS ---
  { id: 'dr-1', name: 'Mint Margrita', category: 'Drinks', price: 300 },
  { id: 'dr-2', name: 'Gava Mint', category: 'Drinks', price: 400 },
  { id: 'dr-3', name: 'Lemonade', category: 'Drinks', price: 300 },
  { id: 'dr-4', name: 'Kit Kat', category: 'Drinks', price: 500 },
  { id: 'dr-5', name: 'Reo Shake', category: 'Drinks', price: 500 },
  { id: 'dr-6', name: 'Cold Coffee', category: 'Drinks', price: 400 },
  { id: 'dr-7', name: 'Chocolate Shake', category: 'Drinks', price: 450 }
];

export const SPECIAL_DEALS: SpecialDeal[] = [
  {
    id: 'deal-super-1',
    title: 'SUPER DEAL 1',
    price: 1150,
    items: [
      'Thai Mongolian Chicken',
      '2 Pcs Steam Momos',
      'Korean Chicken',
      'Fried Rice'
    ],
    badge: 'Popular Choice'
  },
  {
    id: 'deal-super-2',
    title: 'SUPER DEAL 2',
    price: 1800,
    items: [
      'Chicken Manchurian',
      '4 Pcs Steam Momos',
      'Korean Chicken',
      'Fried Rice'
    ],
    badge: 'Family Favorite'
  },
  {
    id: 'deal-super-3',
    title: 'SUPER DEAL 3',
    price: 2100,
    items: [
      'Sweet and Sour Chicken',
      '4 Pcs Fried Momos',
      'Korean Chicken',
      'Twist and Sour Chicken',
      'Fried Rice'
    ],
    badge: 'Feast Combo'
  },
  {
    id: 'deal-dragon-1',
    title: 'DRAGON DEAL 1',
    price: 2600,
    popular: true,
    items: [
      '4 Pcs Steam Momos',
      'BBQ Wings (4 Pcs)',
      'Dragon Chowmein',
      'Fried Rice',
      'Szechwan Chicken'
    ],
    badge: 'Chef Signature'
  },
  {
    id: 'deal-dragon-2',
    title: 'DRAGON DEAL 2',
    price: 1800,
    items: [
      'Chicken Wings (4 Pcs)',
      'Thai Manchurian',
      'Chicken Chowmein (1/2 Price)',
      'Chilli Dry',
      'Fried Rice'
    ],
    badge: 'Great Value'
  },
  {
    id: 'deal-dragon-3',
    title: 'DRAGON DEAL 3',
    price: 3000,
    items: [
      'Chicken Wings (8 Pcs)',
      'Fish Manchurian',
      'Chilli Dry',
      'Fried Rice',
      'Noodles'
    ],
    badge: 'Grand Platter'
  }
];

export const FEATURED_DISHES = [
  {
    id: 'feat-1',
    name: 'Dragon Chowmein',
    price: 849,
    category: 'Noodles',
    image: 'https://unsplash.com',
    badge: 'Signature Wok'
  },
  {
    id: 'feat-2',
    name: 'Chicken Chowmein',
    price: 749,
    category: 'Noodles',
    image: 'https://unsplash.com',
    badge: 'Local Favorite'
  },
  {
    id: 'feat-3',
    name: 'Fried Momos',
    price: 550,
    category: 'Momos',
    image: 'https://unsplash.com',
    badge: 'Crispy & Tender'
  },
  {
    id: 'feat-4',
    name: 'Hot & Sour Soup',
    price: 400,
    category: 'Soup',
    image: 'https://unsplash.com',
    badge: 'Zesty & Classic'
  },
  {
    id: 'feat-5',
    name: 'Chicken Manchurian',
    price: 1400,
    category: 'Chicken',
    image: 'https://unsplash.com',
    badge: 'Rich Sauté'
  },
  {
    id: 'feat-6',
    name: 'Szechwan Hot Pot',
    price: 2500,
    category: 'Hot Pot',
    image: 'https://unsplash.com',
    badge: 'Masterpiece'
  }
];

export const GALLERY_ITEMS = [
  {
    id: 'gal-1',
    title: 'Wok Hei Flame Tossing',
    category: 'Wok',
    image: '/images/hero_wok_fire.jpg',
    description: 'High-heat wok cooking unleashing authentic smoky wok hei flavor.'
  },
  {
    id: 'gal-2',
    title: 'Szechwan Hot Pot Feast',
    category: 'Food',
    image: '/images/dish_hot_pot.jpg',
    description: 'Rich chili broth loaded with dumplings, chicken, and fresh vegetables.'
  },
  {
    id: 'gal-3',
    title: 'Dragon Chowmein',
    category: 'Noodles',
    image: '/images/dish_chowmein.jpg',
    description: 'Tossed noodles with tender cuts and crisp garden greens.'
  },
  {
    id: 'gal-4',
    title: 'Crispy Fried & Steamed Momos',
    category: 'Momos',
    image: '/images/dish_momos.jpg',
    description: 'Handcrafted dumplings served with savory chili oil sauce.'
  },
  {
    id: 'gal-5',
    title: 'Hot & Sour Soup Tureen',
    category: 'Soups',
    image: '/images/hero_wok_fire.jpg',
    description: 'Steaming broth with balanced spicy and tangy notes.'
  },
  {
    id: 'gal-6',
    title: 'Chicken Main Course Stir-Fry',
    category: 'Chicken',
    image: '/images/dish_chowmein.jpg',
    description: 'Fresh poultry glazed in rich Chinese sauces and chili.'
  },
  {
    id: 'gal-7',
    title: 'Dining Atmosphere',
    category: 'Restaurant',
    image: '/images/hero_wok_fire.jpg',
    description: 'Welcoming dining ambiance at Jadoon Plaza Phase 1.'
  }
];
