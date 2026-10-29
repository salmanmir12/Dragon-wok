import { CartItem, CustomerDetails } from '../context/OrderContext';

export const RESTAURANT_WHATSAPP_NUMBER = '923100968734'; // 0310 0968734 in international format
export const RESTAURANT_PHONE_DISPLAY = '0310 0968734';

export interface WhatsAppOrderItem {
  name: string;
  price: number;
  quantity: number;
  portionLabel?: string | null;
}

/**
 * Builds the official Dragon Wok Abbottabad WhatsApp order text
 * adhering strictly to the user-specified format with unconfirmed delivery fee.
 */
export function formatOrderMessage(
  customer: CustomerDetails,
  items: (CartItem | WhatsAppOrderItem)[],
  foodSubtotal: number,
  isClosed: boolean,
  orderId?: string
): string {
  const cleanOrderId = orderId ? orderId.trim() : `DW-${Math.floor(100000 + Math.random() * 900000)}`;

  const addressLine =
    customer.orderType === 'Delivery'
      ? customer.address.trim() || 'Abbottabad (Address to be confirmed)'
      : 'Pickup from Dragon Wok Counter (Jadoon Plaza Phase 1 Mandian, Abbottabad)';

  const itemLines = (items || []).map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Number(item.price) || 0;
    const lineTotal = unitPrice * qty;
    const portion = item.portionLabel ? ` (${item.portionLabel})` : '';
    return `- ${item.name}${portion} × ${qty} = Rs. ${lineTotal.toLocaleString()}`;
  });

  const formattedSubtotal = `Rs. ${foodSubtotal.toLocaleString()}`;

  let message = `NEW ORDER — DRAGON WOK ABBOTTABAD\n\n`;
  message += `Order ID: ${cleanOrderId}\n\n`;
  message += `Customer: ${customer.name.trim()}\n`;
  message += `Phone: ${customer.phone.trim()}\n`;
  message += `Delivery Address: ${addressLine}\n\n`;
  message += `Items:\n${itemLines.join('\n')}\n\n`;
  message += `Food Subtotal: ${formattedSubtotal}\n`;
  
  if (customer.orderType === 'Delivery') {
    message += `Delivery Charges: To be confirmed by restaurant\n`;
    message += `Final Total: ${formattedSubtotal} + delivery charges\n\n`;
  } else {
    message += `Delivery Charges: Free (Counter Pickup)\n`;
    message += `Final Total: ${formattedSubtotal}\n\n`;
  }

  if (customer.notes && customer.notes.trim()) {
    message += `Notes: ${customer.notes.trim()}\n\n`;
  }

  message += `Status: Awaiting restaurant confirmation.`;

  if (isClosed) {
    message += `\n\n*(Note: Sent outside regular hours. Staff will confirm upon opening at 12:00 PM)*`;
  }

  return message;
}

/**
 * Creates the complete wa.me click-to-chat URL with properly encoded message.
 */
export function generateWhatsAppOrderUrl(
  customer: CustomerDetails,
  items: (CartItem | WhatsAppOrderItem)[],
  foodSubtotal: number,
  isClosed: boolean,
  orderId?: string
): string {
  const message = formatOrderMessage(customer, items, foodSubtotal, isClosed, orderId);
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates general chat URL for floating button
 */
export function getGeneralWhatsAppChatUrl(): string {
  const message = 'Assalam-o-Alaikum, I need help with my Dragon Wok order.';
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
