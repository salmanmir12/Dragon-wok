import { checkIsRestaurantOpen } from './businessHours';

export interface ChatDishOption {
  id: string;
  name: string;
  price: number;
}

export interface ChatOrderSummary {
  items: { id: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  customerName?: string;
  phone?: string;
  address?: string;
  orderType: 'Delivery' | 'Pickup';
  whatsappUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  dishSuggestions?: ChatDishOption[];
  orderSummary?: ChatOrderSummary;
  showOrderForm?: boolean;
  action?: {
    type: 'add_to_cart' | 'scroll_to_menu' | 'whatsapp' | 'call' | 'open_order_form';
    payload?: string;
    label: string;
  };
}

export const POPULAR_DISHES_LIST: ChatDishOption[] = [
  { id: 'nd-4', name: 'Dragon Chowmein', price: 849 },
  { id: 'nd-1', name: 'Chicken Chowmein', price: 749 },
  { id: 'mo-2', name: 'Fried Momos (1 Plate)', price: 550 },
  { id: 'mo-1', name: 'Steam Momos (1 Plate)', price: 500 },
  { id: 'hp-1', name: 'Szechwan Hot Pot', price: 2500 },
  { id: 'ck-1', name: 'Chicken Manchurian', price: 1400 },
  { id: 'ck-3', name: 'Chicken Chilli Dry', price: 1400 },
  { id: 'sp-5', name: 'Hot & Sour Soup', price: 400 },
  { id: 'deal-super-1', name: 'Super Deal 1', price: 1150 },
  { id: 'deal-super-2', name: 'Super Deal 2', price: 1800 },
  { id: 'deal-dragon-1', name: 'Dragon Deal 1', price: 2600 },
];

export const INITIAL_SUGGESTIONS = [
  '🛒 Place Order',
  '🍜 Popular Dishes & Prices',
  '🔥 Special Deals',
  '🕒 Opening Hours',
  '📍 Restaurant Location',
  '🍗 Chicken Dishes',
  '🌶️ Spicy Food',
];

/**
 * Searches and extracts dishes mentioned in user text
 */
export function extractDishesFromQuery(text: string): { dish: ChatDishOption; quantity: number }[] {
  const query = text.toLowerCase();
  const found: { dish: ChatDishOption; quantity: number }[] = [];

  const extractQty = (keyword: string) => {
    const regex = new RegExp(`(\\d+)\\s*(?:plate|taad|pcs|x|piece|bowl)?\\s*${keyword}`, 'i');
    const match = query.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 1;
  };

  if (query.includes('dragon chowmein')) {
    found.push({ dish: { id: 'nd-4', name: 'Dragon Chowmein', price: 849 }, quantity: extractQty('dragon chowmein') });
  } else if (query.includes('chicken chowmein')) {
    found.push({ dish: { id: 'nd-1', name: 'Chicken Chowmein', price: 749 }, quantity: extractQty('chicken chowmein') });
  } else if (query.includes('beef chowmein')) {
    found.push({ dish: { id: 'nd-3', name: 'Beef Chowmein', price: 949 }, quantity: extractQty('beef chowmein') });
  } else if (query.includes('veg chowmein') || query.includes('vegetable chowmein')) {
    found.push({ dish: { id: 'nd-2', name: 'Vegetable Chowmein', price: 549 }, quantity: extractQty('chowmein') });
  } else if (query.includes('chowmein') || query.includes('noodle')) {
    found.push({ dish: { id: 'nd-4', name: 'Dragon Chowmein', price: 849 }, quantity: extractQty('chowmein') });
  }

  if (query.includes('fried momo') || query.includes('fried momos')) {
    found.push({ dish: { id: 'mo-2', name: 'Fried Momos (1 Plate)', price: 550 }, quantity: extractQty('fried momo') });
  } else if (query.includes('steam momo') || query.includes('steamed momo')) {
    found.push({ dish: { id: 'mo-1', name: 'Steam Momos (1 Plate)', price: 500 }, quantity: extractQty('steam momo') });
  } else if (query.includes('momo') || query.includes('momos')) {
    found.push({ dish: { id: 'mo-2', name: 'Fried Momos (1 Plate)', price: 550 }, quantity: extractQty('momo') });
  }

  if (query.includes('hot pot') || query.includes('hotpot') || query.includes('szechwan hot pot')) {
    found.push({ dish: { id: 'hp-1', name: 'Szechwan Hot Pot', price: 2500 }, quantity: extractQty('hot pot') });
  }

  if (query.includes('manchurian') || query.includes('chicken manchurian')) {
    found.push({ dish: { id: 'ck-1', name: 'Chicken Manchurian', price: 1400 }, quantity: extractQty('manchurian') });
  }

  if (query.includes('chilli dry') || query.includes('chicken chilli dry')) {
    found.push({ dish: { id: 'ck-3', name: 'Chicken Chilli Dry', price: 1400 }, quantity: extractQty('chilli dry') });
  }

  if (query.includes('super deal 1')) {
    found.push({ dish: { id: 'deal-super-1', name: 'Super Deal 1', price: 1150 }, quantity: 1 });
  } else if (query.includes('super deal 2')) {
    found.push({ dish: { id: 'deal-super-2', name: 'Super Deal 2', price: 1800 }, quantity: 1 });
  } else if (query.includes('super deal 3')) {
    found.push({ dish: { id: 'deal-super-3', name: 'Super Deal 3', price: 2100 }, quantity: 1 });
  } else if (query.includes('dragon deal 1')) {
    found.push({ dish: { id: 'deal-dragon-1', name: 'Dragon Deal 1', price: 2600 }, quantity: 1 });
  } else if (query.includes('dragon deal 2')) {
    found.push({ dish: { id: 'deal-dragon-2', name: 'Dragon Deal 2', price: 1800 }, quantity: 1 });
  } else if (query.includes('dragon deal 3')) {
    found.push({ dish: { id: 'deal-dragon-3', name: 'Dragon Deal 3', price: 3000 }, quantity: 1 });
  }

  if (query.includes('hot & sour') || query.includes('hot and sour soup')) {
    found.push({ dish: { id: 'sp-5', name: 'Hot & Sour Soup', price: 400 }, quantity: extractQty('soup') });
  } else if (query.includes('corn soup')) {
    found.push({ dish: { id: 'sp-4', name: 'Chicken Corn Soup', price: 300 }, quantity: extractQty('soup') });
  }

  return found;
}

/**
 * 100% Local Rule-Based Chatbot Engine (No API, No External Service)
 */
export function getSmartBotResponse(
  userQuery: string,
  currentTray: { id: string; name: string; quantity: number; price: number }[]
): {
  reply: string;
  addItems?: { dish: ChatDishOption; quantity: number }[];
  dishSuggestions?: ChatDishOption[];
  showOrderForm?: boolean;
  action?: ChatMessage['action'];
} {
  const query = userQuery.toLowerCase().trim();
  const status = checkIsRestaurantOpen();

  // 1. Check if user specified items to add to order
  const extracted = extractDishesFromQuery(query);
  if (extracted.length > 0) {
    const itemNames = extracted.map((e) => `${e.quantity}x ${e.dish.name} (Rs. ${(e.dish.price * e.quantity).toLocaleString()})`).join(', ');
    return {
      reply: `Great choice! I have added to your order:\n✅ **${itemNames}**\n\nWould you like to add anything else or proceed to send your order on WhatsApp?`,
      addItems: extracted,
      showOrderForm: true,
      dishSuggestions: [
        { id: 'mo-2', name: 'Fried Momos (Rs. 550)', price: 550 },
        { id: 'nd-4', name: 'Dragon Chowmein (Rs. 849)', price: 849 },
        { id: 'sp-5', name: 'Hot & Sour Soup (Rs. 400)', price: 400 },
      ],
    };
  }

  // 2. Greetings
  if (
    query.startsWith('hi') ||
    query.startsWith('hello') ||
    query.startsWith('hey') ||
    query.includes('salam') ||
    query.includes('aoa') ||
    query === 'good morning' ||
    query === 'good evening'
  ) {
    const statusText = status.isOpen ? '🟢 Open Now (12:00 PM – 2:00 AM)' : '🔴 Currently Closed (Opens at 12:00 PM)';
    return {
      reply: `Hello and welcome to Dragon Wok Abbottabad! 🐉\n\n${statusText}\n\nI can help you explore our menu, check prices, recommend dishes, and place your order directly to our WhatsApp! What can I get for you today?`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 3. Thank you
  if (query.includes('thank') || query.includes('thanks') || query.includes('shukriya') || query.includes('jazakallah')) {
    return {
      reply: `You're very welcome! 😊 It is our pleasure to serve you at Dragon Wok. Let me know if you would like to order or need any more details!`,
    };
  }

  // 4. Recommendations / "What should I order?" / "kya mangwaun"
  if (
    query.includes('what should i order') ||
    query.includes('recommend') ||
    query.includes('suggestion') ||
    query.includes('kya acha hai') ||
    query.includes('best dish') ||
    query.includes('special kya hai')
  ) {
    return {
      reply: `For a first visit, I recommend our most popular Dragon Wok dishes:\n\n⭐ **Dragon Chowmein (Rs. 849)** — Signature high-flame wok noodles\n🥟 **Fried Momos (Rs. 550)** — Crispy golden dumplings with chili dip\n🥘 **Szechwan Hot Pot (Rs. 2,500)** — Deluxe sharing pot loaded with chicken, momos & veggies\n🍗 **Chicken Manchurian (Rs. 1,400)** — Classic savory Chinese gravy\n\nYou can tap below to add any to your order!`,
      dishSuggestions: [
        { id: 'nd-4', name: 'Dragon Chowmein', price: 849 },
        { id: 'mo-2', name: 'Fried Momos (1 Plate)', price: 550 },
        { id: 'hp-1', name: 'Szechwan Hot Pot', price: 2500 },
        { id: 'ck-1', name: 'Chicken Manchurian', price: 1400 },
      ],
    };
  }

  // 5. Popular dishes
  if (query.includes('popular') || query.includes('mashhoor') || query.includes('top dishes') || query.includes('bestseller')) {
    return {
      reply: `Here are the top crowd-favorites at Dragon Wok Abbottabad:\n\n1. **Dragon Chowmein** (Rs. 849)\n2. **Chicken Chowmein** (Rs. 749)\n3. **Fried Momos** (Rs. 550)\n4. **Hot & Sour Soup** (Rs. 400)\n5. **Chicken Manchurian** (Rs. 1,400)\n6. **Szechwan Hot Pot** (Rs. 2,500)\n\nTap to add any dish to your order tray:`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 6),
    };
  }

  // 6. Chicken dishes
  if (query.includes('chicken dish') || query.includes('chicken items') || query.includes('chicken menu') || query.includes('chicken')) {
    return {
      reply: `🍗 **Dragon Wok Chicken Main Courses (Rs. 1,400 each):**\n\n• Chicken Manchurian (Rs. 1,400)\n• Chicken Chilli Dry (Rs. 1,400)\n• Kungpow Chicken (Rs. 1,400)\n• Szechwan Chicken (Rs. 1,400)\n• Chicken Cashewnut (Rs. 1,400)\n• Sesame Honey Chicken (Rs. 1,400)\n• Garlic Chicken (Rs. 1,400)\n• Sweet & Sour Chicken (Rs. 1,400)\n\nPrepared fresh to order in high-heat woks!`,
      dishSuggestions: [
        { id: 'ck-1', name: 'Chicken Manchurian', price: 1400 },
        { id: 'ck-3', name: 'Chicken Chilli Dry', price: 1400 },
        { id: 'nd-1', name: 'Chicken Chowmein', price: 749 },
      ],
    };
  }

  // 7. Chinese food inquiry
  if (query.includes('chinese food') || query.includes('authentic') || query.includes('cuisine') || query.includes('desi chinese')) {
    return {
      reply: `Dragon Wok brings bold, authentic Chinese-inspired flavors cooked in traditional woks over high heat (Wok Hei). We serve freshly prepared chowmein, handcrafted steamed and fried momos, sizzling chicken and beef dishes, and our famous signature Szechwan Hot Pot.`,
      action: {
        type: 'scroll_to_menu',
        label: 'Explore Full Menu',
        payload: 'menu',
      },
    };
  }

  // 8. Spicy food
  if (query.includes('spicy') || query.includes('chilli') || query.includes('mirch') || query.includes('teekha') || query.includes('hot food')) {
    return {
      reply: `🌶️ **Looking for a spicy kick?** Here are our top spicy favorites:\n\n• **Chicken Chilli Dry (Rs. 1,400)** — Wok-seared with green chilies\n• **Chilli Momos (Rs. 800)** — Tossed in fiery sauce\n• **Szechwan Chicken / Beef (Rs. 1,400 / Rs. 1,500)** — Bold Szechwan peppercorn chili profile\n• **Szechwan Hot Pot (Rs. 2,500)** — Rich aromatic chili broth\n• **Hot & Sour Soup (Rs. 400)** — Spicy & tangy classic broth!`,
      dishSuggestions: [
        { id: 'ck-3', name: 'Chicken Chilli Dry', price: 1400 },
        { id: 'sp-5', name: 'Hot & Sour Soup', price: 400 },
        { id: 'nd-4', name: 'Dragon Chowmein', price: 849 },
      ],
    };
  }

  // 9. Vegetarian food
  if (query.includes('vegetarian') || query.includes('vegetable') || query.includes('veg') || query.includes('sabzi')) {
    return {
      reply: `🥗 **Vegetarian Options at Dragon Wok:**\n\n• **Vegetable Chowmein** — Rs. 549 (Fresh wok-tossed noodles with garden vegetables)\n• **Plain Fries** — Rs. 300\n\nYou can also request custom vegetable preparations for soups or gravies!`,
      dishSuggestions: [
        { id: 'nd-2', name: 'Vegetable Chowmein', price: 549 },
      ],
    };
  }

  // 10. Prices / Rate list
  if (query.includes('price') || query.includes('rate') || query.includes('cost') || query.includes('kitne ka') || query.includes('charges')) {
    return {
      reply: `Here are our verified menu price highlights:\n\n• Starters: Rs. 250 – Rs. 950\n• Soups: Rs. 300 – Rs. 550 (Family bowls up to Rs. 2,000)\n• Chowmein: Rs. 549 – Rs. 949\n• Momos: Rs. 500 – Rs. 800\n• Chicken Main Course: Rs. 1,400\n• Beef Main Course: Rs. 1,500\n• Fish Main Course: Rs. 1,600\n• Szechwan Hot Pot: Rs. 2,500\n• Super Deals: Rs. 1,150 – Rs. 3,000\n\nAll prices are in Pakistani Rupees (Rs.) with no invented taxes!`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 11. Restaurant timings / Opening hours / "What time do you open?"
  if (
    query.includes('timing') ||
    query.includes('opening hours') ||
    query.includes('what time') ||
    query.includes('when do you open') ||
    query.includes('kab khulta') ||
    query.includes('hours') ||
    query.includes('close')
  ) {
    const statusNote = status.isOpen ? '🟢 **Currently OPEN NOW**' : '🔴 **Currently CLOSED** (Opens at 12:00 PM)';
    return {
      reply: `🕒 **Dragon Wok Opening Hours:**\n\nWe are open daily from **12:00 PM to 2:00 AM** (Asia/Karachi, Pakistan Standard Time).\n\n${statusNote}\n\n📍 Jadoon Plaza Phase 1, Mandian, Abbottabad\n📞 0310 0968734`,
      action: {
        type: 'call',
        label: 'Call 0310 0968734',
        payload: '03100968734',
      },
    };
  }

  // 12. Location / "Where are you located?"
  if (
    query.includes('where are you located') ||
    query.includes('location') ||
    query.includes('address') ||
    query.includes('kahan') ||
    query.includes('pata') ||
    query.includes('mandian') ||
    query.includes('jadoon')
  ) {
    return {
      reply: `📍 **Dragon Wok Location:**\n\nJadoon Plaza Phase 1, Mandian, Abbottabad, Khyber Pakhtunkhwa, Pakistan.\n\nWe are conveniently situated in the heart of Mandian with comfortable modern dine-in seating and takeaway!`,
      action: {
        type: 'scroll_to_menu',
        label: 'View Map & Location',
        payload: 'location',
      },
    };
  }

  // 13. Contact information
  if (query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('whatsapp') || query.includes('call')) {
    return {
      reply: `📞 **Contact Dragon Wok:**\n\n• **Direct Phone & WhatsApp:** 0310 0968734\n• **Address:** Jadoon Plaza Phase 1, Mandian, Abbottabad\n• **Instagram:** @dragon_wok_abbottabad\n• **Facebook:** Dragon Wok\n• **TikTok:** @dragon.wok8`,
      action: {
        type: 'whatsapp',
        label: 'Chat on WhatsApp (0310 0968734)',
        payload: '923100968734',
      },
    };
  }

  // 14. Delivery & Takeaway
  if (query.includes('delivery') || query.includes('takeaway') || query.includes('take away') || query.includes('parcel') || query.includes('rider') || query.includes('home delivery')) {
    return {
      reply: `🛵 **Delivery & Takeaway Services:**\n\nYes! We offer both Home Delivery and Takeaway/Pickup across Mandian and Abbottabad.\n\nYou can select your items here in chat and click **"Send WhatsApp Order"** to dispatch your order directly to our kitchen at **0310 0968734**!`,
      showOrderForm: true,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 15. Menu request
  if (query === 'menu' || query.includes('show menu') || query.includes('menu card') || query.includes('kya menu hai') || query.includes('full menu')) {
    return {
      reply: `Our complete menu includes:\n• **Starters**: Fries (Rs. 300), Honey Wings (Rs. 600), Finger Fish (Rs. 950)\n• **Soups**: Hot & Sour (Rs. 400), Dragon Special (Rs. 550), Corn Soup (Rs. 300)\n• **Noodles**: Dragon Chowmein (Rs. 849), Chicken Chowmein (Rs. 749)\n• **Momos**: Fried Momos (Rs. 550), Steam Momos (Rs. 500)\n• **Mains**: Chicken Manchurian, Chilli Dry, Cashewnut (Rs. 1,400 each)\n• **Signature**: Szechwan Hot Pot (Rs. 2,500)\n• **Deals**: Super Deals (from Rs. 1,150)\n\nWhich category would you like to order?`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 6),
    };
  }

  // 16. Help
  if (query.includes('help') || query.includes('madad') || query.includes('kya kar sakte ho') || query.includes('what can you do')) {
    return {
      reply: `I can help you with:\n1. 🛒 **Direct WhatsApp Ordering** (add dishes and send order with 1 tap)\n2. 🍜 **Dish Prices & Recommendations**\n3. 🔥 **Super Deals & Combos**\n4. 🕒 **Opening Hours (12 PM – 2 AM)**\n5. 📍 **Location (Jadoon Plaza Mandian)**\n\nWhat would you like to know?`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 17. Place Order intent
  if (query.includes('order') || query.includes('mangwana') || query.includes('bhejo') || query.includes('buy')) {
    return {
      reply: `Ready to order! Tap the dishes below to add them to your order tray, then enter your details to send directly to Dragon Wok's WhatsApp (**0310 0968734**):`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 6),
      showOrderForm: currentTray.length > 0,
    };
  }

  // 18. Default Friendly Fallback (Exact requirement)
  return {
    reply: `Sorry! I can help you with our menu, dishes, prices, timings, location, delivery, and other Dragon Wok information. What would you like to know?`,
    dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    showOrderForm: currentTray.length > 0,
  };
}
