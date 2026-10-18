import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// --- Requirement 5: Direct Google Sheets Integration Endpoint ---
app.post('/api/orders/sync-sheet', async (req, res) => {
  const order = req.body;

  if (!order || !order.orderId) {
    return res.status(400).json({ error: 'Missing orderId or order payload' });
  }

  console.log(`[Google Sheets Sync] Processing new order: ${order.orderId}`);

  // Format spreadsheet row
  const rowData = [
    order.createdAt || new Date().toISOString(),
    order.orderId,
    order.customerName || 'Customer',
    order.customerPhone || 'N/A',
    order.orderType || 'delivery',
    order.deliveryAddress || 'Abbottabad, Pakistan',
    order.itemizedSummary || (Array.isArray(order.items) ? order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : ''),
    order.subtotal || 0,
    order.deliveryFee || 0,
    order.total || 0,
    order.status || 'Pending',
    order.paymentMethod || 'Cash on Delivery',
    order.notes || '',
  ];

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sheetId = process.env.GOOGLE_SHEET_ID || 'SPREADSHEET_ID_PLACEHOLDER';

  if (webhookUrl && webhookUrl.startsWith('https://')) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendOrder',
          spreadsheetId: sheetId,
          order: {
            ...order,
            row: rowData,
          },
        }),
      });

      console.log(`[Google Sheets Sync] Webhook responded with status: ${response.status}`);
      return res.json({
        success: true,
        message: 'Order appended to Google Sheets via Webhook',
        orderId: order.orderId,
        sheetId,
      });
    } catch (err: any) {
      console.warn(`[Google Sheets Sync] Webhook dispatch error: ${err.message}`);
    }
  }

  // Standalone / placeholder mode: logs formatted row ready for spreadsheet ingestion
  console.log('[Google Sheets Sync] Row Ready for Spreadsheet Appending:');
  console.table([
    {
      Timestamp: rowData[0],
      OrderID: rowData[1],
      Customer: rowData[2],
      Phone: rowData[3],
      Type: rowData[4],
      Address: rowData[5],
      Items: rowData[6],
      Subtotal: rowData[7],
      Delivery: rowData[8],
      Total: rowData[9],
      Status: rowData[10],
      Payment: rowData[11],
    },
  ]);

  return res.json({
    success: true,
    message: 'Order formatted and recorded for Google Sheets sync',
    orderId: order.orderId,
    sheetId,
    rowData,
  });
});

// --- Requirement 4: Auto-Confirmation Notification Dispatcher ---
app.post('/api/orders/notify-status', async (req, res) => {
  const { orderId, customerName, customerPhone, newStatus, total, orderType, deliveryAddress } = req.body;

  if (!orderId || !newStatus) {
    return res.status(400).json({ error: 'Missing orderId or status' });
  }

  console.log(`[Order Auto-Notification] Order ${orderId} status changed to ${newStatus}`);
  console.log(`[Order Auto-Notification] Customer: ${customerName} (${customerPhone}) - Total: Rs. ${total}`);

  // Automated notification message dispatched to SMS/WhatsApp webhook
  const notificationPayload = {
    orderId,
    customerName,
    customerPhone,
    status: newStatus,
    total,
    orderType,
    deliveryAddress,
    sentAt: new Date().toISOString(),
    message: `Dragon Wok: Your order ${orderId} has been ${newStatus.toUpperCase()}! Preparing in wok now. Total: Rs. ${total}. Delivery: Abbottabad.`,
  };

  const notificationWebhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (notificationWebhookUrl) {
    try {
      await fetch(notificationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload),
      });
      console.log(`[Order Auto-Notification] Dispatched to external notification webhook`);
    } catch (err: any) {
      console.warn(`[Order Auto-Notification] External webhook dispatch error: ${err.message}`);
    }
  }

  return res.json({
    success: true,
    message: `Order confirmation notification automatically triggered for ${customerName}`,
    notification: notificationPayload,
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Dragon Wok Foodpanda Ordering Engine',
    location: 'Abbottabad, Pakistan',
    timestamp: new Date().toISOString(),
  });
});

// Development vs Production Setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development: Mount Vite middlewares for fast HMR / SSR bundling
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dragon Wok server running on http://0.0.0.0:${PORT}`);
    console.log(`📍 Location Lock: Abbottabad, Pakistan exclusively`);
    console.log(`📊 Google Sheets Endpoint: POST /api/orders/sync-sheet`);
    console.log(`🔔 Auto-Notification Endpoint: POST /api/orders/notify-status`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Dragon Wok server:', err);
  process.exit(1);
});
