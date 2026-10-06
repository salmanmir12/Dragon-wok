import { checkIsRestaurantOpen } from './businessHours';
import { MENU_ITEMS, SPECIAL_DEALS } from '../data/menuData';

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
  '🛒 Mujhe Order Karna Hai',
  '🔥 Aaj ki Best Deals',
  '🍜 Chowmein & Momos Rates',
  '🥘 Szechwan Hot Pot',
  '🕒 Timing & Location',
];

/**
 * Searches and extracts dishes mentioned in user text
 */
export function extractDishesFromQuery(text: string): { dish: ChatDishOption; quantity: number }[] {
  const query = text.toLowerCase();
  const found: { dish: ChatDishOption; quantity: number }[] = [];

  // Match numbers if mentioned like "2 chowmein", "3 momos"
  const extractQty = (keyword: string) => {
    const regex = new RegExp(`(\\d+)\\s*(?:plate|taad|pcs|x|piece|bowl)?\\s*${keyword}`, 'i');
    const match = query.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 1;
  };

  // Check specific dishes
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
 * Intelligent natural Urdu/Roman Urdu responder for order queries
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

  // Check if user is specifying items to order
  const extracted = extractDishesFromQuery(query);
  if (extracted.length > 0) {
    const itemNames = extracted.map((e) => `${e.quantity}x ${e.dish.name} (Rs. ${(e.dish.price * e.quantity).toLocaleString()})`).join(', ');
    return {
      reply: `Zabardast! Maine aapke order me shamil kar diya hai:\n✅ **${itemNames}**\n\nAap mazeed dishes add karna chahte hain, ya abhi WhatsApp par order bhejein?`,
      addItems: extracted,
      showOrderForm: true,
      dishSuggestions: [
        { id: 'mo-2', name: 'Fried Momos (Rs. 550)', price: 550 },
        { id: 'nd-4', name: 'Dragon Chowmein (Rs. 849)', price: 849 },
        { id: 'sp-5', name: 'Hot & Sour Soup (Rs. 400)', price: 400 },
      ],
    };
  }

  // 1. Order intent
  if (
    query.includes('order') ||
    query.includes('mangwana') ||
    query.includes('chahiye') ||
    query.includes('bhejo') ||
    query.includes('khana') ||
    query.includes('kharidna')
  ) {
    return {
      reply: `Ji bilkul! Mai aapka order direct Dragon Wok ke WhatsApp (**03100968734**) par bhejwa deta hoon.\n\nAap kya order karna chahte hain? Neeche diye gaye popular dishes me se click karein ya dish ka naam likhein:`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 6),
      showOrderForm: currentTray.length > 0,
    };
  }

  // 2. Deals intent
  if (query.includes('deal') || query.includes('combo') || query.includes('offer')) {
    return {
      reply: `🔥 **Dragon Wok ki Top Deals:**\n\n1. **Super Deal 1 (Rs. 1,150):** Thai Mongolian Chicken + 2 Pcs Steam Momos + Korean Chicken + Fried Rice\n2. **Super Deal 2 (Rs. 1,800):** Chicken Manchurian + 4 Pcs Steam Momos + Korean Chicken + Fried Rice\n3. **Super Deal 3 (Rs. 2,100):** Sweet & Sour Chicken + 4 Pcs Fried Momos + Korean Chicken + Twist & Sour + Fried Rice\n4. **Dragon Deal 1 (Rs. 2,600):** Steam Momos + BBQ Wings + Dragon Chowmein + Fried Rice + Szechwan Chicken\n\nNeeche button dabakar seedha order me add karein:`,
      dishSuggestions: [
        { id: 'deal-super-1', name: 'Super Deal 1', price: 1150 },
        { id: 'deal-super-2', name: 'Super Deal 2', price: 1800 },
        { id: 'deal-super-3', name: 'Super Deal 3', price: 2100 },
        { id: 'deal-dragon-1', name: 'Dragon Deal 1', price: 2600 },
      ],
    };
  }

  // 3. Chowmein & Noodles
  if (query.includes('chowmein') || query.includes('noodle') || query.includes('chaumin')) {
    return {
      reply: `🍜 **Dragon Wok Chowmein Menu:**\n• **Dragon Chowmein (Special Signature):** Rs. 849\n• **Chicken Chowmein (Classic):** Rs. 749\n• **Beef Chowmein:** Rs. 949\n• **Vegetable Chowmein:** Rs. 549\n\nKaunsi Chowmein order karni hai?`,
      dishSuggestions: [
        { id: 'nd-4', name: 'Dragon Chowmein', price: 849 },
        { id: 'nd-1', name: 'Chicken Chowmein', price: 749 },
        { id: 'nd-3', name: 'Beef Chowmein', price: 949 },
      ],
    };
  }

  // 4. Momos
  if (query.includes('momo') || query.includes('dumpling')) {
    return {
      reply: `🥟 **Handcrafted Momos:**\n• **Fried Momos (Crispy & Juicy):** Rs. 550 / plate\n• **Steam Momos (Healthy & Fresh):** Rs. 500 / plate\n• **Chilli Momos:** Rs. 800\n• **Manchurian Momos:** Rs. 800\n\nKaunse Momos add karein?`,
      dishSuggestions: [
        { id: 'mo-2', name: 'Fried Momos (1 Plate)', price: 550 },
        { id: 'mo-1', name: 'Steam Momos (1 Plate)', price: 500 },
        { id: 'mo-5', name: 'Chilli Momos', price: 800 },
      ],
    };
  }

  // 5. Hot Pot
  if (query.includes('hot pot') || query.includes('hotpot') || query.includes('szechwan')) {
    return {
      reply: `🥘 **Szechwan Hot Pot — Rs. 2,500**\nDragon Wok ka famous sharing bowl! Isme shamil hain:\n• Aromatic chili broth, Noodles, Momos, Chicken, Sausages, Mushrooms, Peanut butter & Egg.\n\nKya yeh order me shamil karein?`,
      dishSuggestions: [
        { id: 'hp-1', name: 'Szechwan Hot Pot', price: 2500 },
      ],
    };
  }

  // 6. Timings & Opening Status
  if (query.includes('timing') || query.includes('time') || query.includes('kab') || query.includes('open') || query.includes('close')) {
    const timeStatus = status.isOpen ? '🟢 **Abhi Restaurant OPEN hai!**' : '🔴 **Abhi Restaurant CLOSED hai** (12:00 PM par open hoga).';
    return {
      reply: `🕒 **Dragon Wok Timings:**\nHum rozana **12:00 PM se 2:00 AM (raat)** tak khule hote hain.\n${timeStatus}\n\n📍 Location: Jadoon Plaza Phase 1, Mandian, Abbottabad.\n📞 Contact: 0310 0968734`,
      action: {
        type: 'call',
        label: 'Call Restaurant: 0310 0968734',
        payload: '03100968734',
      },
    };
  }

  // 7. Location & Address
  if (query.includes('location') || query.includes('kahan') || query.includes('address') || query.includes('pata')) {
    return {
      reply: `📍 **Dragon Wok Abbottabad Address:**\nJadoon Plaza Phase 1, Mandian, Abbottabad, Khyber Pakhtunkhwa.\n\nDelivery Mandian aur poore Abbottabad me available hai! Aap WhatsApp par address bhej kar mangwa sakte hain.`,
      action: {
        type: 'scroll_to_menu',
        label: 'Map Par Location Dekhein',
        payload: 'location',
      },
    };
  }

  // 8. Delivery inquiry
  if (query.includes('delivery') || query.includes('ghar') || query.includes('home delivery') || query.includes('rider')) {
    return {
      reply: `🛵 **Delivery Service:**\nJi haan, Dragon Wok Mandian aur Abbottabad me home delivery provide karta hai!\n\nAap apna order yahan chatbot me choose karein, aur apna address likh kar direct WhatsApp par bhej dein!`,
      showOrderForm: true,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 9. Contact / WhatsApp
  if (query.includes('number') || query.includes('phone') || query.includes('whatsapp') || query.includes('rabta')) {
    return {
      reply: `📞 **Official Phone & WhatsApp:**\n**0310 0968734**\n\nAap direct WhatsApp par baat kar sakte hain ya call kar sakte hain.`,
      action: {
        type: 'whatsapp',
        label: 'WhatsApp Chat Kholein',
        payload: '923100968734',
      },
    };
  }

  // 10. Greetings
  if (query.includes('salam') || query.includes('aoa') || query.includes('hi') || query.includes('hello')) {
    return {
      reply: `Walaikum Assalam! 🐉 Welcome to Dragon Wok Abbottabad!\n\nMai aapka order lene ke liye tayyar hoon. Aapko Chowmein, Fried Momos, Hot Pot ya koi Special Deal chahiye?`,
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    };
  }

  // 11. General fallback
  return {
    reply: `Mai Dragon Wok ka automated Order Assistant hoon! 🐉\n\nAap mujhse kisi bhi dish ka rate pooch sakte hain, ya apna order yahan finalize karke direct WhatsApp (**0310 0968734**) par bhej sakte hain.\n\nKuch popular options:`,
    dishSuggestions: POPULAR_DISHES_LIST.slice(0, 5),
    showOrderForm: currentTray.length > 0,
  };
}
