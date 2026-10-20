/**
 * Authoritative Order Pricing Calculation Engine
 * Used consistently across Cart, Checkout, Order Confirmation, and Kitchen Dashboard.
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
  deliveryFee: number;
  total: number;
}

/**
 * Pure numeric calculation of item subtotals, order subtotal, delivery charges, and final payable total.
 * Never calculates from display strings or defaults to 150 when items exist.
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
  deliveryFeeSetting: number = 150
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

  // Delivery fee applies ONLY for delivery orders; free for pickup
  const deliveryFee = isDelivery ? (Number(deliveryFeeSetting) || 150) : 0;
  const total = subtotal + deliveryFee;

  return {
    items: processedItems,
    subtotal,
    deliveryFee,
    total,
  };
}
