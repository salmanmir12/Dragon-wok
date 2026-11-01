export interface MenuItem {
  id: string;
  name: string;
  category:
    | 'Super Deals'
    | 'Starters'
    | 'Soup'
    | 'Momos'
    | 'Noodles'
    | 'Chicken'
    | 'Beef'
    | 'Fish'
    | 'Szechwan Hot Pot'
    | 'Drinks';
  price: number;
  familyPrice?: number;
  portionLabel?: string;
  description?: string;
  ingredients?: string[];
  isSignature?: boolean;
  isPopular?: boolean;
  available?: boolean;
  badge?: string;
  image?: string;
}

export interface SpecialDeal {
  id: string;
  title: string;
  price: number;
  items: string[];
  badge?: string;
  popular?: boolean;
  description?: string;
  image?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // --- 2. STARTERS (11 items) ---
  {
    id: 'st-1',
    name: 'Plain Fries',
    category: 'Starters',
    price: 300,
    description: 'Crisp golden potato fries lightly salted to perfection.',
  },
  {
    id: 'st-2',
    name: 'Honey Wings',
    category: 'Starters',
    price: 600,
    description: 'Tender chicken wings glazed in sticky sweet honey wok glaze.',
  },
  {
    id: 'st-3',
    name: 'Korean Chicken',
    category: 'Starters',
    price: 500,
    isPopular: true,
    badge: 'Popular',
    description: 'Crunchy battered chicken tossed in savory-sweet Korean chili glaze.',
  },
  {
    id: 'st-4',
    name: 'BBQ Wings',
    category: 'Starters',
    price: 650,
    description: 'Smoky high-heat wok roasted chicken wings with rich BBQ coating.',
  },
  {
    id: 'st-5',
    name: 'Drum Sticks',
    category: 'Starters',
    price: 250,
    description: 'Crispy fried seasoned chicken drumstick.',
  },
  {
    id: 'st-6',
    name: 'Finger Fish (6 pieces)',
    category: 'Starters',
    price: 950,
    description: 'Golden crumbed tender fish fillets served with zesty dip.',
  },
  {
    id: 'st-7',
    name: 'Daka Fish',
    category: 'Starters',
    price: 850,
    description: 'Crispy sesame-crusted Dhaka style seasoned fish bites.',
  },
  {
    id: 'st-8',
    name: 'Daka Chicken',
    category: 'Starters',
    price: 700,
    description: 'Savory sesame-coated Dhaka fried chicken strips.',
  },
  {
    id: 'st-9',
    name: 'Chicken Chilli Chips',
    category: 'Starters',
    price: 900,
    description: 'Crispy potato chips tossed with spicy chicken shreds and fresh chili.',
  },
  {
    id: 'st-10',
    name: 'Chicken Cashewnut Chips',
    category: 'Starters',
    price: 900,
    description: 'Crisp chips tossed with toasted cashews and savory chicken.',
  },
  {
    id: 'st-11',
    name: 'Chicken Manchurian Chips',
    category: 'Starters',
    price: 900,
    description: 'French fries coated in tangy Indo-Chinese Manchurian chicken gravy.',
  },

  // --- 3. SOUP (10 items - single & family bowls as separate products) ---
  {
    id: 'sp-1',
    name: 'Dragon Special Soup',
    category: 'Soup',
    price: 550,
    portionLabel: 'Single Serving',
    isSignature: true,
    isPopular: true,
    badge: "Chef's Special",
    description: "Chef's signature spicy thick broth loaded with chicken, prawns, mushrooms and herbs.",
  },
  {
    id: 'sp-1-fam',
    name: 'Dragon Special Soup, Family Bowl',
    category: 'Soup',
    price: 2000,
    portionLabel: 'Family Bowl (3-4 Persons)',
    isSignature: true,
    badge: 'Family Sharing',
    description: 'Generous sharing tureen of our signature dragon broth for the entire table.',
  },
  {
    id: 'sp-2-fam',
    name: 'Chicken Dumpling Noodles Soup, Family Bowl',
    category: 'Soup',
    price: 1500,
    portionLabel: 'Family Bowl (3-4 Persons)',
    isPopular: true,
    badge: 'Dumpling Feast',
    description: 'Steaming broth with handmade chicken dumplings, long noodles, and greens.',
  },
  {
    id: 'sp-3',
    name: 'Szechwan Soup',
    category: 'Soup',
    price: 500,
    portionLabel: 'Single Serving',
    description: 'Authentic fiery red Szechwan broth with shredded chicken and chili flakes.',
  },
  {
    id: 'sp-3-fam',
    name: 'Szechwan Soup, Family Bowl',
    category: 'Soup',
    price: 1500,
    portionLabel: 'Family Bowl (3-4 Persons)',
    description: 'Large sharing tureen of spicy Szechwan pepper broth.',
  },
  {
    id: 'sp-4',
    name: 'Chicken Corn Soup',
    category: 'Soup',
    price: 300,
    portionLabel: 'Single Serving',
    description: 'Classic comforting soup with sweet crushed corn, egg drops, and tender chicken.',
  },
  {
    id: 'sp-4-fam',
    name: 'Chicken Corn Soup, Family Bowl',
    category: 'Soup',
    price: 1100,
    portionLabel: 'Family Bowl (3-4 Persons)',
    description: 'Family size serving of our classic sweet chicken and corn soup.',
  },
  {
    id: 'sp-5',
    name: 'Hot and Sour Soup',
    category: 'Soup',
    price: 400,
    portionLabel: 'Single Serving',
    isPopular: true,
    description: 'Traditional peppery vinegar broth with shredded chicken, tofu, and mushrooms.',
  },
  {
    id: 'sp-5-fam',
    name: 'Hot and Sour Soup, Family Bowl',
    category: 'Soup',
    price: 1300,
    portionLabel: 'Family Bowl (3-4 Persons)',
    description: 'Large family tureen of classic zesty hot and sour soup.',
  },
  {
    id: 'sp-6-fam',
    name: 'Chicken Noodles Soup, Family Bowl',
    category: 'Soup',
    price: 1200,
    portionLabel: 'Family Bowl (3-4 Persons)',
    description: 'Warm chicken broth packed with delicate egg noodles and fresh julienne vegetables.',
  },

  // --- 4. MOMOS (6 items) ---
  {
    id: 'mo-1',
    name: 'Steam Momos, 1 plate',
    category: 'Momos',
    price: 500,
    portionLabel: '1 Plate (6 Pcs)',
    isPopular: true,
    badge: 'Best Seller',
    description: 'Authentic handmade steamed chicken dumplings served with spicy chili garlic chutney.',
  },
  {
    id: 'mo-2',
    name: 'Fried Momos, 1 plate',
    category: 'Momos',
    price: 550,
    portionLabel: '1 Plate (6 Pcs)',
    isPopular: true,
    badge: 'Crispy',
    description: 'Golden wok-fried dumplings with a crisp outer crunch and juicy chicken filling.',
  },
  {
    id: 'mo-3',
    name: 'Half Fried Momos',
    category: 'Momos',
    price: 550,
    portionLabel: '1 Plate',
    description: 'Potsticker-style dumplings pan-seared crispy on one side and delicate steamed on top.',
  },
  {
    id: 'mo-4',
    name: 'Special Momos',
    category: 'Momos',
    price: 800,
    portionLabel: 'Chef Plate',
    badge: 'Special Recipe',
    description: 'Deluxe chicken dumplings coated in our secret aromatic wok herb reduction.',
  },
  {
    id: 'mo-5',
    name: 'Chilli Momos',
    category: 'Momos',
    price: 800,
    portionLabel: 'Spicy Plate',
    description: 'Fried dumplings tossed with fresh green chilies, onions, and spicy wok glaze.',
  },
  {
    id: 'mo-6',
    name: 'Manchurian Momos',
    category: 'Momos',
    price: 800,
    portionLabel: 'Saucy Plate',
    description: 'Crispy momos drenched in tangy Indo-Chinese Manchurian gravy.',
  },

  // --- 5. NOODLES (4 items) ---
  {
    id: 'nd-1',
    name: 'Chicken Chowmein',
    category: 'Noodles',
    price: 749,
    isPopular: true,
    badge: 'Popular',
    description: 'Classic wok-tossed chowmein noodles with tender chicken strips, cabbage, and carrots.',
  },
  {
    id: 'nd-2',
    name: 'Vegetable Chowmein',
    category: 'Noodles',
    price: 549,
    description: 'Wok-charred noodles with fresh seasonal farm vegetables, capsicum, and cabbage.',
  },
  {
    id: 'nd-3',
    name: 'Beef Chowmein',
    category: 'Noodles',
    price: 949,
    badge: 'Hearty',
    description: 'Premium sliced undercut beef tossed with high-heat smoky noodles.',
  },
  {
    id: 'nd-4',
    name: 'Dragon Chowmein',
    category: 'Noodles',
    price: 849,
    isSignature: true,
    isPopular: true,
    badge: 'Signature',
    description: 'Chef specialty noodles with chicken, beef, fresh prawns, and secret wok sauce.',
  },

  // --- 6. CHICKEN (10 items @ Rs. 1,400 each) ---
  {
    id: 'ck-1',
    name: 'Chicken Manchurian',
    category: 'Chicken',
    price: 1400,
    isPopular: true,
    badge: 'Classic',
    description: 'Tender chicken cubes in a tangy ginger, garlic, and tomato-based Indo-Chinese red gravy.',
  },
  {
    id: 'ck-2',
    name: 'Chicken Cashewnut',
    category: 'Chicken',
    price: 1400,
    description: 'Stir-fried chicken tossed with roasted crunchy cashews, bell peppers, and scallions.',
  },
  {
    id: 'ck-3',
    name: 'Chicken Chilli Dry',
    category: 'Chicken',
    price: 1400,
    isPopular: true,
    badge: 'Spicy Favorite',
    description: 'Crispy fried chicken strips tossed dry with fresh green chilies, garlic, and onions.',
  },
  {
    id: 'ck-4',
    name: 'Kungpow Chicken',
    category: 'Chicken',
    price: 1400,
    description: 'Authentic Sichuan-style diced chicken with dried red chilies, roasted peanuts, and spicy sauce.',
  },
  {
    id: 'ck-5',
    name: 'Szechwan Chicken',
    category: 'Chicken',
    price: 1400,
    description: 'Spicy chicken simmered in bold Szechwan peppercorn chili paste with crisp vegetables.',
  },
  {
    id: 'ck-6',
    name: 'Sesame Honey Chicken',
    category: 'Chicken',
    price: 1400,
    description: 'Crisp chicken glazed with organic honey and toasted white sesame seeds.',
  },
  {
    id: 'ck-7',
    name: 'Garlic Chicken',
    category: 'Chicken',
    price: 1400,
    description: 'Tender chicken slices sautéed with generous minced roasted garlic and fresh spring onions.',
  },
  {
    id: 'ck-8',
    name: 'Chicken Chilli Onion',
    category: 'Chicken',
    price: 1400,
    description: 'Wok-tossed chicken slices with caramelized onions and pungent green chilies.',
  },
  {
    id: 'ck-9',
    name: 'Chicken with Oyster Sauce',
    category: 'Chicken',
    price: 1400,
    description: 'Savory stir-fried chicken and sliced mushrooms in rich Cantonese oyster sauce.',
  },
  {
    id: 'ck-10',
    name: 'Sweet & Sour Chicken',
    category: 'Chicken',
    price: 1400,
    description: 'Battered chicken cubes tossed with pineapple chunks, bell peppers, and sweet-sour glaze.',
  },

  // --- 7. BEEF (5 items @ Rs. 1,500 each) ---
  {
    id: 'bf-1',
    name: 'Beef Chilli Dry',
    category: 'Beef',
    price: 1500,
    isPopular: true,
    badge: 'Prime Beef',
    description: 'Tender sliced undercut beef tossed dry with fiery green chilies and ginger slivers.',
  },
  {
    id: 'bf-2',
    name: 'Pepper Beef',
    category: 'Beef',
    price: 1500,
    description: 'Marinated beef slices stir-fried with crushed black peppercorns and sweet bell peppers.',
  },
  {
    id: 'bf-3',
    name: 'Beef in Oyster Sauce',
    category: 'Beef',
    price: 1500,
    description: 'Tender beef strips braised in rich Cantonese oyster sauce with broccoli florets.',
  },
  {
    id: 'bf-4',
    name: 'Beef Chilli Onion',
    category: 'Beef',
    price: 1500,
    description: 'Seared beef slices tossed with chunky Spanish onions and fiery green chilies.',
  },
  {
    id: 'bf-5',
    name: 'Szechwan Beef',
    category: 'Beef',
    price: 1500,
    description: 'Sliced beef wok-charred in fiery Sichuan chili paste with aromatic spices.',
  },

  // --- 8. FISH (4 items @ Rs. 1,600 each) ---
  {
    id: 'fs-1',
    name: 'Kungpow Fish',
    category: 'Fish',
    price: 1600,
    description: 'Tender fish fillets tossed with Sichuan chili paste, crunchy peanuts, and scallions.',
  },
  {
    id: 'fs-2',
    name: 'Sweet & Sour Fish',
    category: 'Fish',
    price: 1600,
    description: 'Crisp fish fillets coated in vibrant sweet and sour glaze with pineapple and peppers.',
  },
  {
    id: 'fs-3',
    name: 'Garlic Fish',
    category: 'Fish',
    price: 1600,
    description: 'Delicate fish fillet smothered in fragrant toasted garlic sauce and fresh herbs.',
  },
  {
    id: 'fs-4',
    name: 'Fish Chilli Dry',
    category: 'Fish',
    price: 1600,
    isPopular: true,
    badge: 'Chef Specialty',
    description: 'Golden fried fish bites tossed dry with freshly sliced chilies, garlic, and spring onion.',
  },

  // --- 9. SZECHWAN HOT POT (Rs. 2,500) ---
  {
    id: 'hp-1',
    name: 'Szechwan Hot Pot',
    category: 'Szechwan Hot Pot',
    price: 2500,
    isSignature: true,
    isPopular: true,
    badge: 'Grand Table Feast',
    description:
      'The ultimate Dragon Wok communal banquet experience cooked in a rich, bubbling Szechwan chili broth with 9 premium ingredients.',
    ingredients: [
      'Noodles',
      'Sausages',
      'Peanut butter',
      'Mushroom',
      'Chicken',
      'Momos',
      'Szechwan pasta',
      'Vegetables',
      'Egg',
    ],
  },

  // --- 10. DRINKS (7 items) ---
  {
    id: 'dr-1',
    name: 'Mint Margarita',
    category: 'Drinks',
    price: 300,
    description: 'Chilled blended drink with fresh garden mint, tangy lemon, and crushed ice.',
  },
  {
    id: 'dr-2',
    name: 'Guava Mint',
    category: 'Drinks',
    price: 400,
    description: 'Tropical guava puree shaken with fresh crushed mint leaves and lime juice.',
  },
  {
    id: 'dr-3',
    name: 'Lemonade',
    category: 'Drinks',
    price: 300,
    description: 'Freshly squeezed lemon beverage served chilled over ice.',
  },
  {
    id: 'dr-4',
    name: 'Kit Kat Shake',
    category: 'Drinks',
    price: 500,
    badge: 'Chocolate Shake',
    description: 'Thick creamy milkshake blended with crunchy Kit Kat wafer chocolate.',
  },
  {
    id: 'dr-5',
    name: 'Oreo Shake',
    category: 'Drinks',
    price: 500,
    badge: 'Customer Favorite',
    description: 'Rich vanilla ice cream shake blended with real crushed Oreo cookies.',
  },
  {
    id: 'dr-6',
    name: 'Cold Coffee',
    category: 'Drinks',
    price: 400,
    description: 'Smooth brewed espresso blended cold with creamy milk and rich froth.',
  },
  {
    id: 'dr-7',
    name: 'Chocolate Shake',
    category: 'Drinks',
    price: 450,
    description: 'Classic velvety rich chocolate shake topped with dark chocolate drizzle.',
  },
];

export const SPECIAL_DEALS: SpecialDeal[] = [
  {
    id: 'deal-super-1',
    title: 'Super Deal 1',
    price: 1550,
    badge: 'Popular Choice',
    popular: true,
    description: 'A satisfying single-person or light sharing wok feast.',
    items: [
      'Thai Mongolian Chicken with Fried Rice',
      'Fried Momos — 2 pieces',
      'Korean Chicken',
    ],
  },
  {
    id: 'deal-super-2',
    title: 'Super Deal 2',
    price: 1800,
    badge: 'Double Chicken Combo',
    description: 'Hearty duo combination of spicy Szechwan and savory Mongolian chicken.',
    items: [
      'Steam Momos — 4 pieces',
      'Szechwan Chicken with Fried Rice',
      'Thai Mongolian Chicken with Fried Rice',
    ],
  },
  {
    id: 'deal-super-3',
    title: 'Super Deal 3',
    price: 2100,
    badge: 'Full Dinner Combo',
    description: 'Complete multi-course banquet with noodles, chicken, wings, and momos.',
    items: [
      'Fried Momos — 4 pieces',
      'Chicken Chowmein',
      'Sweet and Sour Chicken with Fried Rice',
      'Chicken Wings — 4 pieces',
    ],
  },
  {
    id: 'deal-dragon-1',
    title: 'Dragon Deal 1',
    price: 2600,
    badge: 'Dragon Signature Platter',
    popular: true,
    description: 'Grand family feast featuring our famous chowmein, wings, and momos.',
    items: [
      'Steam Momos — 6 pieces',
      'Chicken Chowmein',
      'BBQ Wings',
      'Thai Mongolian Chicken with Fried Rice',
      'Korean Chicken',
    ],
  },
  {
    id: 'deal-dragon-2',
    title: 'Dragon Deal 2',
    price: 3000,
    badge: 'Ultimate Feast Platter',
    popular: true,
    description: 'Generous party platter loaded with 10 wings, dry chili, chowmein, and chicken.',
    items: [
      'Chicken Wings — 10 pieces',
      'Thai Mongolian Chicken with Fried Rice',
      'Chicken Chowmein without rice',
      'Chilli Dry with Fried Rice',
    ],
  },
];

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Wok Hei Flame Tossing',
    category: 'Wok',
    image: '/images/hero_wok_fire.jpg',
    description: 'High-heat wok cooking unleashing authentic smoky wok hei flavor.',
  },
  {
    id: 'gal-2',
    title: 'Modern Dining Space',
    category: 'Restaurant',
    image: '/images/restaurant_interior.jpg',
    description: 'Modern, clean, and welcoming interior dining space at Jadoon Plaza Phase 1.',
  },
  {
    id: 'gal-3',
    title: 'Restaurant Front & Entrance',
    category: 'Restaurant',
    image: '/images/restaurant_exterior.jpg',
    description: 'Exterior storefront of Dragon Wok Abbottabad at Jadoon Plaza Phase 1.',
  },
];
