# Dragon Wok Abbottabad — Direct Google Sheets Integration Setup

Every order placed on Dragon Wok is automatically formatted and recorded in real time.

---

## ⚡ 1-Minute Zero-Credentials Setup (Recommended)

You can connect your Google Sheet in under 60 seconds with no complex API keys or service account credentials.

### Step 1: Create your Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Title it: **Dragon Wok Orders — Abbottabad**.
3. In Row 1 (header), create the following columns:
   - **A:** `Timestamp`
   - **B:** `Order ID`
   - **C:** `Customer Name`
   - **D:** `Phone Number`
   - **E:** `Order Type`
   - **F:** `Abbottabad Address`
   - **G:** `Itemized Summary`
   - **H:** `Subtotal (Rs.)`
   - **I:** `Delivery Fee (Rs.)`
   - **J:** `Total Bill (Rs.)`
   - **K:** `Status`
   - **L:** `Payment Method`
   - **M:** `Special Instructions`

### Step 2: Add the Google Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any code in the editor and paste this script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var order = data.order || data;

    var row = [
      order.createdAt || new Date().toISOString(),
      order.orderId || "DW-" + Math.floor(Math.random() * 900000),
      order.customerName || "Customer",
      order.customerPhone || "N/A",
      order.orderType || "delivery",
      order.deliveryAddress || "Abbottabad, Pakistan",
      order.itemizedSummary || (order.items ? order.items.map(function(i){ return i.quantity + "x " + i.name; }).join(", ") : ""),
      order.subtotal || 0,
      order.deliveryFee || 0,
      order.total || 0,
      order.status || "Pending",
      order.paymentMethod || "Cash on Delivery",
      order.notes || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Order successfully appended to Google Sheet"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Deploy** > **New deployment**.
4. Click the gear icon > Select **Web app**.
5. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
6. Click **Deploy** and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

### Step 3: Add the Web App URL to your Project
Paste the URL into your `.env` or Vercel Environment Variables:
```env
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec"
VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec"
```

---

## 🎯 How It Works in Real-Time
1. Whenever a customer places an order on your website, `/api/orders/sync-sheet` formats the order and appends the row to your Google Sheet.
2. The kitchen staff sees the incoming order immediately on the Staff Dashboard.
3. Your Google Sheet serves as an offline live ledger for kitchen inventory, driver dispatch, and sales reporting.
