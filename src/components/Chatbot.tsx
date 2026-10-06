import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Plus,
  Minus,
  Trash2,
  Phone,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Sparkles,
  Bot,
  RotateCcw,
} from 'lucide-react';
import {
  ChatMessage,
  ChatDishOption,
  INITIAL_SUGGESTIONS,
  POPULAR_DISHES_LIST,
  getSmartBotResponse,
} from '../utils/chatbotKnowledge';
import { useOrder } from '../context/OrderContext';
import { RESTAURANT_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface ChatTrayItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatTray, setChatTray] = useState<ChatTrayItem[]>([]);
  const [showCheckoutDrawer, setShowCheckoutDrawer] = useState(false);

  // Customer info inside chatbot
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [formError, setFormError] = useState('');

  const { addItem, restaurantStatus } = useOrder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! Welcome to Dragon Wok Abbottabad 🐉\n\nMai aapka direct Order Assistant hoon. Aap yahan se apna order de sakte hain aur yeh seedha Dragon Wok ke WhatsApp (**03100968734**) par chala jayega!\n\nAap kya khana pasand karenge?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping, showCheckoutDrawer]);

  const traySubtotal = chatTray.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const trayCount = chatTray.reduce((sum, item) => sum + item.quantity, 0);

  // Add dish to chatbot order tray
  const handleAddDish = (dish: ChatDishOption, qty: number = 1) => {
    setChatTray((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, quantity: qty }];
    });

    // Also sync with website cart
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
    });

    // Add confirmation message in chat
    const confirmMsg: ChatMessage = {
      id: `bot-add-${Date.now()}`,
      sender: 'bot',
      text: `✅ **Added to Order:** ${qty}x ${dish.name} (Rs. ${(dish.price * qty).toLocaleString()})\n\nAbhi total: **Rs. ${(traySubtotal + dish.price * qty).toLocaleString()}**.\nAur kuch add karna hai ya WhatsApp par order bhejein?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: {
        type: 'open_order_form',
        label: '🛒 Finalize & Send on WhatsApp',
      },
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleUpdateQty = (dishId: string, delta: number) => {
    setChatTray((prev) =>
      prev
        .map((i) => {
          if (i.id === dishId) {
            const next = i.quantity + delta;
            return next > 0 ? { ...i, quantity: next } : null;
          }
          return i;
        })
        .filter(Boolean) as ChatTrayItem[]
    );
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getSmartBotResponse(query, chatTray);

      // If user specified dishes in their message, add them automatically
      if (response.addItems && response.addItems.length > 0) {
        response.addItems.forEach((item) => {
          handleAddDish(item.dish, item.quantity);
        });
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dishSuggestions: response.dishSuggestions,
        action: response.action,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (response.showOrderForm) {
        setShowCheckoutDrawer(true);
      }
    }, 450);
  };

  // Build clean WhatsApp message and launch WhatsApp
  const handleFinalizeWhatsAppOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    if (chatTray.length === 0) {
      setFormError('Pehle kam az kam 1 dish select karein!');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Apna Naam zaroor likhein!');
      return;
    }

    const cleanedPhone = customerPhone.replace(/[\s-]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setFormError('Sahi Pakistani Phone Number likhein (e.g. 0310 1234567)!');
      return;
    }

    if (orderType === 'Delivery' && !customerAddress.trim()) {
      setFormError('Delivery ke liye Address likhna zaroori hai!');
      return;
    }

    // Format WhatsApp order message
    const customerLines = [
      '*Customer Details*',
      `Name: ${customerName.trim()}`,
      `Phone: ${customerPhone.trim()}`,
      `Order Type: ${orderType}`,
    ];

    if (orderType === 'Delivery' && customerAddress.trim()) {
      customerLines.push(`Address: ${customerAddress.trim()}`);
    }

    const orderLines = chatTray.map(
      (item) => `${item.quantity} × ${item.name} — Rs. ${(item.price * item.quantity).toLocaleString()}`
    );

    let message = `Hello Dragon Wok! 👋\n\nI would like to place an order via Dragon Bot.\n\n${customerLines.join(
      '\n'
    )}\n\n*Order Items*\n${orderLines.join('\n')}\n\n*Subtotal: Rs. ${traySubtotal.toLocaleString()}*`;

    if (customerNotes.trim()) {
      message += `\n\nNotes:\n${customerNotes.trim()}`;
    }

    if (!restaurantStatus.isOpen) {
      message += `\n\n*(Note: Placed during closed hours. Please prepare upon opening at 12:00 PM)*`;
    }

    message += `\n\nThank you!`;

    const whatsappUrl = `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Post confirmation message in chat
    const sentMsg: ChatMessage = {
      id: `bot-sent-${Date.now()}`,
      sender: 'bot',
      text: `🎉 **Order Sent to WhatsApp!**\n\nShukriya **${customerName}**! Aapka order Dragon Wok (**03100968734**) par WhatsApp open karke bhej diya gaya hai.\n\nKuch hi lamhon me Dragon Wok team aapka order confirm karegi.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, sentMsg]);
    setShowCheckoutDrawer(false);
  };

  const handleActionClick = (action?: ChatMessage['action']) => {
    if (!action) return;

    if (action.type === 'open_order_form') {
      setShowCheckoutDrawer(true);
    } else if (action.type === 'call') {
      window.location.href = `tel:${action.payload || '03100968734'}`;
    } else if (action.type === 'whatsapp') {
      window.open(`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'scroll_to_menu') {
      setIsOpen(false);
      const el = document.getElementById(action.payload || 'menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetChat = () => {
    setChatTray([]);
    setShowCheckoutDrawer(false);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Naya session shuru ho gaya hai! Aap kya order karna chahte hain? 🐉',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dishSuggestions: POPULAR_DISHES_LIST.slice(0, 4),
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Left) */}
      <aside aria-label="Dragon Wok Virtual Assistant" className="fixed bottom-5 left-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white pl-3.5 pr-4 py-3 rounded-full shadow-2xl shadow-red-950/60 hover:shadow-red-900/80 hover:scale-105 active:scale-95 transition-all duration-200 border border-amber-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Order directly via Dragon Bot"
            aria-label="Open Dragon Bot Chat"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Order via Dragon Bot 🐉
            </span>
            {trayCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {trayCount}
              </span>
            )}
          </button>
        )}
      </aside>

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-4 left-3 sm:left-6 z-50 w-[94vw] sm:w-[410px] h-[580px] max-h-[88vh] bg-[#16181f] border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-header-title"
        >
          {/* Header */}
          <div className="bg-[#1b1e27] border-b border-stone-800 p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-[#991b1b] border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1b1e27]" />
              </div>
              <div>
                <h3
                  id="chatbot-header-title"
                  className="font-serif-brand text-sm font-bold text-white leading-tight flex items-center gap-1.5"
                >
                  <span>Dragon Bot</span>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 font-semibold px-1.5 py-0.2 rounded border border-emerald-800/80">
                    WhatsApp Order Active
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      restaurantStatus.isOpen ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span>
                    {restaurantStatus.isOpen ? 'Open Now (12 PM–2 AM)' : 'Closed (Opens at 12 PM)'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Restart chat"
                aria-label="Restart chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sticky Active Order Tray Banner inside Chat */}
          {chatTray.length > 0 && (
            <div className="bg-[#1e1b18] border-b border-amber-500/30 px-3.5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-white font-medium">
                  {trayCount} dishes •{' '}
                  <strong className="text-amber-400 font-bold">
                    Rs. {traySubtotal.toLocaleString()}
                  </strong>
                </span>
              </div>
              <button
                onClick={() => setShowCheckoutDrawer(!showCheckoutDrawer)}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold px-3 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>{showCheckoutDrawer ? 'Hide Form' : 'Send WhatsApp'}</span>
              </button>
            </div>
          )}

          {/* Checkout / Order Details Drawer */}
          {showCheckoutDrawer && (
            <div className="bg-[#191b24] border-b border-stone-800 p-4 max-h-[260px] overflow-y-auto space-y-3 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider">
                  📋 WhatsApp Order Details
                </span>
                <span className="text-stone-300 font-semibold">
                  Subtotal: Rs. {traySubtotal.toLocaleString()}
                </span>
              </div>

              {/* Items List in Drawer */}
              <div className="space-y-1.5 bg-stone-900/90 p-2.5 rounded-lg border border-stone-800 max-h-24 overflow-y-auto">
                {chatTray.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-stone-200">
                    <span className="truncate pr-2">
                      {item.name} (x{item.quantity})
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-amber-400 font-semibold">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="p-0.5 bg-stone-800 text-stone-300 hover:text-white rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="p-0.5 bg-stone-800 text-stone-300 hover:text-white rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {formError && (
                <div className="text-rose-400 text-[11px] flex items-center gap-1 bg-rose-950/50 p-1.5 rounded border border-rose-900">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Apna Naam (Customer Name) *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />

                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 0310 1234567) *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />

                {/* Delivery or Pickup Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('Delivery')}
                    className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      orderType === 'Delivery'
                        ? 'bg-[#991b1b] text-white'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    🛵 Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('Pickup')}
                    className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      orderType === 'Pickup'
                        ? 'bg-[#991b1b] text-white'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    🏬 Takeaway / Pickup
                  </button>
                </div>

                {orderType === 'Delivery' && (
                  <input
                    type="text"
                    placeholder="Delivery Address (Mandian / Abbottabad) *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                )}

                <input
                  type="text"
                  placeholder="Special instructions (e.g. Less spicy) - Optional"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={handleFinalizeWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Order to WhatsApp (0310 0968734)</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#991b1b] text-white rounded-tr-xs'
                      : 'bg-[#1f232d] text-stone-200 border border-stone-800/80 rounded-tl-xs'
                  }`}
                >
                  {msg.text}

                  {/* 1-Tap Dish Add Buttons inside Bot Message */}
                  {msg.dishSuggestions && msg.dishSuggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-700/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">
                        Tap to Add to Order:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.dishSuggestions.map((dish) => (
                          <button
                            key={dish.id}
                            onClick={() => handleAddDish(dish)}
                            className="bg-stone-900 hover:bg-[#991b1b] text-stone-200 hover:text-white border border-stone-700/80 hover:border-amber-500 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                          >
                            <Plus className="w-3 h-3 text-amber-400" />
                            <span>{dish.name}</span>
                            <span className="text-amber-400 font-bold">
                              Rs. {dish.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Button if available */}
                  {msg.action && (
                    <div className="mt-3 pt-2 border-t border-stone-700/60 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleActionClick(msg.action)}
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        {msg.action.type === 'call' && <Phone className="w-3 h-3" />}
                        {msg.action.type === 'open_order_form' && <Send className="w-3 h-3" />}
                        {msg.action.type === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                        <span>{msg.action.label}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-[#1f232d] border border-stone-800 rounded-2xl rounded-tl-xs px-4 py-3 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-[#13151b] border-t border-stone-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#181b24] border-t border-stone-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Dish ka naam ya sawal likhein (e.g. 1 Chowmein)..."
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#991b1b] hover:bg-[#b91c1c] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
