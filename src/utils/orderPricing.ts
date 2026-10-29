/**
 * Authoritative Order Pricing Calculation Engine
 * Used consistently across Cart, Checkout, Order Confirmation, and Kitchen Dashboard.
 * Adheres strictly to manual delivery confirmation: Never defaults to Rs. 150.
 */

export interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  portionLabel?: string | null;
  itemTotal: number;
}

export interface CalculatedOrderPricing {
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  deliveryPendingConfirmation: boolean;
}

/**
 * Pure numeric calculation of item subtotals, food subtotal, and optional confirmed delivery charges.
 * Never defaults to 150. Delivery charges remain unconfirmed / null until staff confirms.
 */
export function calculateOrderPricing(
  items: {
    id: string;
    name?: string;
    price: number;
    quantity: number;
    category?: string;
    portionLabel?: string | null;
  }[],
  orderType: 'Delivery' | 'Pickup' | 'delivery' | 'pickup',
  confirmedDeliveryFee?: number | null
): CalculatedOrderPricing {
  const isDelivery = String(orderType).toLowerCase() === 'delivery';

  const processedItems: OrderLineItem[] = (items || []).map((item) => {
    const unitPrice = Math.max(0, Number(item.price) || 0);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const itemTotal = unitPrice * quantity;

    return {
      id: String(item.id),
      name: (item.name || 'Dragon Wok Dish').trim(),
      price: unitPrice,
      quantity,
      category: item.category || 'General',
      portionLabel: item.portionLabel || null,
      itemTotal,
    };
  });

  const subtotal = processedItems.reduce((acc, curr) => acc + curr.itemTotal, 0);

  // Delivery fee is 0 for pickup; for delivery it is only added if explicitly confirmed
  const hasConfirmedFee = typeof confirmedDeliveryFee === 'number' && confirmedDeliveryFee >= 0;
  const deliveryFee = isDelivery ? (hasConfirmedFee ? confirmedDeliveryFee : null) : 0;
  const deliveryPendingConfirmation = isDelivery && !hasConfirmedFee;
  const total = subtotal + (deliveryFee || 0);

  return {
    items: processedItems,
    subtotal,
    deliveryFee,
    total,
    deliveryPendingConfirmation,
  };
}
