/**
 * Auto-Confirmation Message Trigger Service
 * Dispatches an automated order confirmation notification to the customer
 * when the kitchen staff accepts their order.
 */

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  total: number;
  deliveryAddress?: string;
  newStatus: string;
  itemsSummary: string;
}

/**
 * Sends an automated confirmation trigger to the backend endpoint (/api/orders/notify-status)
 * and prepares an instant WhatsApp notification link.
 */
export async function triggerOrderConfirmation(order: OrderNotificationPayload): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/orders/notify-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Automated notification dispatched:', data);
      return { success: true, message: data.message || 'Customer notification dispatched' };
    }

    return { success: false, message: 'Notification service returned status ' + response.status };
  } catch (err: any) {
    console.warn('Notification trigger notice:', err.message || err);
    return { success: false, message: err.message || 'Notification queued' };
  }
}

/**
 * Builds standard Dragon Wok Abbottabad customer order confirmation message
 */
export function buildCustomerWhatsAppConfirmationMessage(order: {
  orderId: string;
  customerName: string;
  total: number;
  orderType: string;
  deliveryAddress?: string;
}): string {
  const isDelivery = order.orderType === 'delivery';
  return encodeURIComponent(
    `🔥 Dragon Wok Abbottabad — Order Confirmed!\n\n` +
    `Dear ${order.customerName || 'Valued Customer'},\n` +
    `Your order *${order.orderId}* has been ACCEPTED by our kitchen and is now being prepared in the wok!\n\n` +
    `💰 Total Bill: Rs. ${order.total?.toLocaleString()}\n` +
    `🥡 Type: ${isDelivery ? 'Delivery in Abbottabad' : 'Self-Pickup at Jadoon Plaza Phase 1'}\n` +
    (isDelivery && order.deliveryAddress ? `📍 Address: ${order.deliveryAddress}\n` : '') +
    `⏱️ Estimated Time: 30-45 minutes\n\n` +
    `Thank you for ordering with Dragon Wok! Need assistance? Call 0310 0968734.`
  );
}
