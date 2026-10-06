import { CartItem, CustomerDetails } from '../context/OrderContext';

export const RESTAURANT_WHATSAPP_NUMBER = '923100968734'; // 0310 0968734 in international format
export const RESTAURANT_PHONE_DISPLAY = '0310 0968734';

/**
 * Builds the clean, professional WhatsApp order text.
 */
export function formatOrderMessage(
  customer: CustomerDetails,
  items: CartItem[],
  totalPrice: number,
  isClosed: boolean
): string {
  const customerLines = [
    '*Customer Details*',
    `Name: ${customer.name.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    `Order Type: ${customer.orderType}`,
  ];

  if (customer.orderType === 'Delivery' && customer.address.trim()) {
    customerLines.push(`Address: ${customer.address.trim()}`);
  }

  const orderLines = items.map(
    (item) =>
      `${item.quantity} × ${item.name} — Rs. ${(item.price * item.quantity).toLocaleString()}`
  );

  let message = `Hello Dragon Wok! 👋\n\nI would like to place an order.\n\n${customerLines.join(
    '\n'
  )}\n\n*Order*\n${orderLines.join('\n')}\n\n*Subtotal: Rs. ${totalPrice.toLocaleString()}*`;

  if (customer.notes && customer.notes.trim()) {
    message += `\n\nNotes:\n${customer.notes.trim()}`;
  }

  if (isClosed) {
    message += `\n\n*(Note: Sent while Dragon Wok is closed. Please prepare upon opening at 12:00 PM)*`;
  }

  message += `\n\nThank you!`;

  return message;
}

/**
 * Creates the complete wa.me click-to-chat URL with properly encoded message.
 */
export function generateWhatsAppOrderUrl(
  customer: CustomerDetails,
  items: CartItem[],
  totalPrice: number,
  isClosed: boolean
): string {
  const message = formatOrderMessage(customer, items, totalPrice, isClosed);
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates general chat URL for floating button
 */
export function getGeneralWhatsAppChatUrl(): string {
  const message = 'Hello Dragon Wok! I would like to know more about your menu.';
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
