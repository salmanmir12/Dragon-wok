/**
 * Direct Google Sheets Integration Module
 * Automatically appends each placed order as a new row in Google Sheets.
 */

export interface GoogleSheetOrderRow {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  deliveryAddress: string;
  itemizedSummary: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string;
}

/**
 * Triggers Google Sheet row append via backend API (/api/orders/sync-sheet)
 * or via configured direct Google Apps Script Webhook.
 */
export async function syncOrderToGoogleSheets(orderData: GoogleSheetOrderRow): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Try backend server endpoint
    const response = await fetch('/api/orders/sync-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Google Sheets sync result:', data);
      return { success: true, message: data.message || 'Order appended to Google Sheet' };
    }

    // 2. Client-side fallback if custom direct Webhook URL is set in env
    const clientWebhookUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (clientWebhookUrl && clientWebhookUrl.startsWith('https://script.google.com/')) {
      await fetch(clientWebhookUrl, {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Script Webhooks
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      return { success: true, message: 'Dispatched directly to Google Sheets Webhook' };
    }

    return { success: false, message: 'Google Sheets endpoint reached with status ' + response.status };
  } catch (error: any) {
    console.warn('Google Sheets sync notice:', error.message || error);
    // Non-blocking for the customer checkout
    return { success: false, message: error.message || 'Sync queued' };
  }
}
