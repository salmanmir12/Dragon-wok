import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ShoppingBag,
  Send,
  MapPin,
  Phone,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, removeUndefined } from '../firebase';
import { useOrder, CustomerDetails } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { calculateOrderPricing, OrderLineItem } from '../utils/orderPricing';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import {
  ABBOTTABAD_AREAS,
  RESTAURANT_PICKUP_LOCATION,
  validateAbbottabadLocation,
} from '../utils/abbottabadLocations';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    items,
    restaurantStatus,
    customerDetails,
    setCustomerDetails,
    clearCart,
  } = useOrder();

  const { user, profile } = useAuth();
  const { validateCartItems, settings } = useMenu();

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('mandian');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Preserve placed order details across cart reset for confirmation and WhatsApp
  const [placedOrderSummary, setPlacedOrderSummary] = useState<{
    orderId: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    orderType: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      portionLabel?: string | null;
      itemTotal: number;
    }>;
    address: string;
    customerName: string;
    customerPhone: string;
  } | null>(null);

  // Handle closing modal and cleanly reset state when closing from success
  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (step === 'success') {
      setStep('form');
      setPlacedOrderId(null);
      setPlacedOrderSummary(null);
    }
  };

  // Accurately sum up (item.price * item.quantity) based on active cart
  const activeCartSubtotal = items.reduce(
    (sum, item) => sum + (Math.max(0, Number(item.price)) || 0) * Math.max(1, Number(item.quantity) || 1),
    0
  );

  // Validate cart items & calculate server-verified pricing
  const validatedPricing = validateCartItems(
    items.map((i) => ({
      id: i.id,
      name: i.name,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      category: i.category,
      portionLabel: i.portionLabel,
    }))
  );

  // Accurate active subtotal strictly summing up (item.price * item.quantity)
  const finalSubtotal = activeCartSubtotal > 0 ? activeCartSubtotal : (validatedPricing.subtotal || 0);
  const deliveryCharges = customerDetails.orderType === 'Delivery' ? (settings.deliveryFee || 150) : 0;
  const finalTotal = finalSubtotal + deliveryCharges;

  // Pre-fill user profile if available
  useEffect(() => {
    if (profile && !customerDetails.name && !customerDetails.phone) {
      setCustomerDetails((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        phone: profile.phone || prev.phone,
        address: profile.addresses && profile.addresses.length > 0 ? profile.addresses[0] : prev.address,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (isCheckoutOpen) {
      if (step !== 'success') {
        setStep('form');
      }
      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Pakistani phone validation: matches 03xx-xxxxxxx, +923xxxxxxxxx, 923xxxxxxxxx
  const isValidPakistaniPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const regex = /^(03\d{9}|\+923\d{9}|923\d{9}|0\d{10})$/;
    return regex.test(cleaned);
  };

  const handleValidateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!isValidPakistaniPhone(customerDetails.phone)) {
      newErrors.phone = 'Enter a valid Pakistani phone number (e.g., 0310 1234567).';
    }

    // Strict Abbottabad Location Lock Validation
    const locationCheck = validateAbbottabadLocation(
      customerDetails.orderType,
      selectedAreaId,
      customerDetails.address
    );

    if (!locationCheck.isValid) {
      newErrors.address = locationCheck.errorMessage || 'Address must be inside Abbottabad, Pakistan.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Apply clean formatted Abbottabad address
      setCustomerDetails((prev) => ({
        ...prev,
        address: locationCheck.formattedAddress,
      }));
      setStep('confirm');
    }
  };

  // Confirm and persist real order into Firestore + Google Sheets
  const handlePlaceOrder = async () => {
    if (placingOrder) return; // Prevent duplicate clicks
    setPlacingOrder(true);
    setSubmitError(null);
    setErrors({});

    try {
      const uniqueOrderNumber = `DW-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDocRef = doc(db, 'orders', uniqueOrderNumber);

      const resolvedAddress = customerDetails.orderType === 'Delivery'
        ? customerDetails.address.trim()
        : RESTAURANT_PICKUP_LOCATION.fullAddress;

      const orderItems = (items || []).map((item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Math.max(1, Number(item.quantity) || 1);
        return {
          id: item.id,
          name: item.name || 'Dragon Wok Dish',
          price: itemPrice,
          quantity: itemQty,
          category: item.category || 'General',
          portionLabel: item.portionLabel || null,
          itemTotal: itemPrice * itemQty,
        };
      });

      if (items.length === 0) {
        setSubmitError('Your cart is empty. Please add items before ordering.');
        setPlacingOrder(false);
        return;
      }

      const calculatedSubtotal = items.reduce(
        (sum, item) => sum + (Math.max(0, Number(item.price)) || 0) * Math.max(1, Number(item.quantity) || 1),
        0
      );
      const calculatedDelivery = customerDetails.orderType === 'Delivery' ? (Number(settings.deliveryFee) || 150) : 0;
      const calculatedTotal = calculatedSubtotal + calculatedDelivery;

      const orderPayload = {
        orderId: uniqueOrderNumber,
        userId: user ? user.uid : 'guest',
        customerName: (customerDetails.name || '').trim(),
        customerPhone: (customerDetails.phone || '').trim(),
        orderType: (customerDetails.orderType || 'Pickup').toLowerCase() as 'delivery' | 'pickup',
        deliveryAddress: resolvedAddress,
        notes: (customerDetails.notes || '').trim(),
        items: orderItems,
        subtotal: calculatedSubtotal,
        deliveryFee: calculatedDelivery,
        total: calculatedTotal,
        status: 'Pending',
        paymentMethod: 'cod',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Strip any undefined properties defensively
      const cleanPayload = removeUndefined(orderPayload);
      await setDoc(orderDocRef, cleanPayload);

      // Verify and fetch the saved record directly from Firestore
      let confirmedTotal = calculatedTotal;
      let confirmedSubtotal = calculatedSubtotal;
      let confirmedDelivery = calculatedDelivery;
      try {
        const savedSnap = await getDoc(orderDocRef);
        if (savedSnap.exists()) {
          const savedData = savedSnap.data();
          if (typeof savedData?.total === 'number' && savedData.total > 0) {
            confirmedTotal = savedData.total;
          }
          if (typeof savedData?.subtotal === 'number') {
            confirmedSubtotal = savedData.subtotal;
          }
          if (typeof savedData?.deliveryFee === 'number') {
            confirmedDelivery = savedData.deliveryFee;
          }
        }
      } catch (e) {
        console.warn('Could not re-fetch saved order doc:', e);
      }

      // Preserve full order details so reset cart does not clear confirmation screen
      setPlacedOrderSummary({
        orderId: uniqueOrderNumber,
        total: confirmedTotal,
        subtotal: confirmedSubtotal,
        deliveryFee: confirmedDelivery,
        orderType: customerDetails.orderType,
        items: orderItems,
        address: resolvedAddress,
        customerName: (customerDetails.name || '').trim(),
        customerPhone: (customerDetails.phone || '').trim(),
      });

      setPlacedOrderId(uniqueOrderNumber);
      clearCart();
      setStep('success');
    } catch (err: any) {
      console.error('Order creation error:', err);
      const userFriendlyMsg = err?.message?.includes('insufficient permissions')
        ? 'Database permission error. Please verify network connection.'
        : (err?.message || 'Failed to place order. Please try again.');
      setSubmitError(userFriendlyMsg);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSendToWhatsApp = () => {
    // If order was already submitted, send the verified placed order summary!
    if (placedOrderSummary) {
      const cartFormattedItems = placedOrderSummary.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        portionLabel: i.portionLabel || undefined,
      }));
      const whatsappUrl = generateWhatsAppOrderUrl(
        {
          name: placedOrderSummary.customerName,
          phone: placedOrderSummary.customerPhone,
          address: placedOrderSummary.address,
          notes: customerDetails.notes,
          orderType: placedOrderSummary.orderType as 'Delivery' | 'Pickup',
        },
        cartFormattedItems,
        placedOrderSummary.total,
        !restaurantStatus.isOpen
      );
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const whatsappUrl = generateWhatsAppOrderUrl(
      customerDetails,
      items,
      finalTotal,
      !restaurantStatus.isOpen
    );
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={() => {
          if (!placingOrder) handleClose();
        }}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-xl bg-[#16181f] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-6">
          
          {/* Foodpanda-style Top Bar */}
          <div className="bg-[#1b1e26] px-5 sm:px-6 py-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#991b1b] flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 id="checkout-modal-title" className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  <span>Fast Checkout</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Abbottabad Locked
                  </span>
                </h2>
                <p className="text-[11px] text-stone-400">
                  Dragon Wok • Mandian, Abbottabad (Cash on Delivery)
                </p>
              </div>
            </div>

            {/* Cross (X) Close Option - Always accessible after completing order & during form */}
            {!placingOrder && (
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition bg-stone-900/60 border border-stone-800/80 hover:border-stone-700 flex items-center justify-center"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
            
            {/* Empty Cart Safety Guard */}
            {items.length === 0 && step !== 'success' ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Your Cart is Empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Please select your favorite wok dishes, noodles, or deals before proceeding to checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-6 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-950/40"
                >
                  Return to Menu
                </button>
              </div>
            ) : null}

            {/* STEP 1: FOODPANDA-STYLE CUSTOMER & ABBOTTABAD LOCATION FORM */}
            {items.length > 0 && step === 'form' && (
              <form onSubmit={handleValidateAndProceed} className="space-y-4">
                
                {/* Order Type Tabs (Foodpanda Style) */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    How would you like your order?
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#121316] p-1 rounded-2xl border border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCustomerDetails((prev) => ({ ...prev, orderType: 'Delivery' }))}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        customerDetails.orderType === 'Delivery'
                          ? 'bg-[#991b1b] text-white shadow-lg shadow-red-950/50'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <span>🛵 Abbottabad Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerDetails((prev) => ({ ...prev, orderType: 'Pickup' }))}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        customerDetails.orderType === 'Pickup'
                          ? 'bg-[#991b1b] text-white shadow-lg shadow-red-950/50'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <span>🥡 Self-Pickup (Mandian)</span>
                    </button>
                  </div>
                </div>

                {/* Customer Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Ali Khan"
                      className="w-full bg-[#121316] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 0310 1234567"
                      className="w-full bg-[#121316] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono transition"
                    />
                    {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Requirement 2: ABBOTTABAD LOCATION LOCK SELECTOR */}
                {customerDetails.orderType === 'Delivery' ? (
                  <div className="p-3.5 rounded-2xl bg-[#121316] border border-stone-800/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Abbottabad Neighborhood / Sector *</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        Locked to Abbottabad
                      </span>
                    </div>

                    <select
                      value={selectedAreaId}
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className="w-full bg-[#191b22] border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {ABBOTTABAD_AREAS.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} — {area.popularLandmark || 'Abbottabad'} ({area.deliveryTimeEstimate})
                        </option>
                      ))}
                    </select>

                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">
                        Street Address / House / Landmark in Abbottabad *
                      </label>
                      <textarea
                        rows={2}
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="House / Flat #, Street, Near Famous Landmark (Must be in Abbottabad)"
                        className="w-full bg-[#191b22] border border-stone-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                      />
                      {errors.address && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-white block mb-0.5">
                        Locked Self-Pickup Location:
                      </span>
                      <p className="text-amber-200/90 font-medium leading-relaxed">
                        {RESTAURANT_PICKUP_LOCATION.fullAddress}
                      </p>
                      <p className="text-stone-400 text-[11px] mt-1">
                        Please arrive 25-35 minutes after ordering. Show your order ID at counter.
                      </p>
                    </div>
                  </div>
                )}

                {/* Special Instructions (Optional) */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Special Cooking / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Extra spicy wok, no onions, call on gate arrival"
                    className="w-full bg-[#121316] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Bill Summary Banner */}
                <div className="pt-2 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
                  <div>
                    <span>Items Total ({items.reduce((s, i) => s + i.quantity, 0)}): </span>
                    <span className="font-mono font-bold text-stone-100">Rs. {finalSubtotal.toLocaleString()}</span>
                    {customerDetails.orderType === 'Delivery' && (
                      <span className="text-stone-400"> + Rs. {deliveryCharges} Delivery</span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-amber-400 font-mono">
                    Rs. {finalTotal.toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition"
                  >
                    Back to Menu
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3.5 px-5 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/60 flex items-center justify-center gap-2"
                  >
                    <span>Review Order & Bill</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: REVIEW & PLACE ORDER */}
            {items.length > 0 && step === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-[#121316] p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between pb-2 border-b border-stone-800">
                    <span className="text-stone-400">Customer:</span>
                    <span className="font-bold text-white">{customerDetails.name}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-800">
                    <span className="text-stone-400">Phone:</span>
                    <span className="font-mono font-bold text-amber-400">{customerDetails.phone}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-800">
                    <span className="text-stone-400">Order Method:</span>
                    <span className="font-bold text-white">
                      {customerDetails.orderType === 'Delivery' ? '🛵 Delivery in Abbottabad' : '🥡 Self-Pickup (Mandian)'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-stone-800">
                    <span className="text-stone-400">Location:</span>
                    <span className="font-medium text-stone-200 text-right max-w-xs">
                      {customerDetails.orderType === 'Delivery' ? customerDetails.address : RESTAURANT_PICKUP_LOCATION.fullAddress}
                    </span>
                  </div>
                  {customerDetails.notes && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Notes:</span>
                      <span className="text-stone-300 italic text-right max-w-xs">{customerDetails.notes}</span>
                    </div>
                  )}
                </div>

                {/* Real Cart Items Breakdown */}
                <div className="bg-[#121316] p-4 rounded-2xl border border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Order Items ({items.length})
                  </span>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 font-mono">{item.quantity}x</span>
                        <span className="text-white font-medium">{item.name}</span>
                        {item.portionLabel && (
                          <span className="text-[10px] text-amber-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-800">
                            {item.portionLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-stone-300 font-mono">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-stone-800 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-400">
                      <span>Subtotal:</span>
                      <span className="font-mono font-bold text-stone-200">Rs. {finalSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Delivery Charges:</span>
                      <span className="font-mono text-stone-200">
                        {customerDetails.orderType === 'Delivery' ? `Rs. ${deliveryCharges}` : 'Free (Pickup)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-extrabold text-white pt-2 border-t border-stone-800">
                      <span className="text-amber-400 uppercase tracking-wider text-xs">Final Bill:</span>
                      <span className="text-base font-mono text-amber-400">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={placingOrder}
                    onClick={() => setStep('form')}
                    className="py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    disabled={placingOrder}
                    onClick={handlePlaceOrder}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] active:scale-[0.98] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-xl shadow-red-950/70 flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Kitchen...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Place Order (Cash on Delivery)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FOODPANDA-STYLE ORDER CONFIRMATION SCREEN */}
            {step === 'success' && (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    Order Received by Kitchen!
                  </span>
                  <h3 className="font-serif-brand text-2xl font-bold text-white mb-2">
                    Thank You, {customerDetails.name}!
                  </h3>
                  <div className="inline-block px-4 py-1.5 rounded-xl bg-[#121316] border border-stone-800 text-sm font-mono font-bold text-amber-400">
                    Order Number: {placedOrderId}
                  </div>
                </div>

                <div className="bg-[#121316] p-4 sm:p-5 rounded-2xl border border-stone-800 text-left text-xs space-y-3 max-w-sm mx-auto shadow-inner">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                    <span className="text-stone-400">Order ID:</span>
                    <span className="font-mono font-bold text-amber-400">{placedOrderId}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Status:</span>
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Pending Kitchen Acceptance
                    </span>
                  </div>

                  {/* Itemized Order Breakdown */}
                  {placedOrderSummary && placedOrderSummary.items.length > 0 && (
                    <div className="py-2.5 border-y border-stone-800/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Dishes Ordered ({placedOrderSummary.items.length}):
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar pr-1">
                        {placedOrderSummary.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-stone-300">
                            <span className="truncate pr-2">
                              <span className="font-bold text-amber-400 mr-1.5">{it.quantity}x</span>
                              {it.name}
                              {it.portionLabel ? ` (${it.portionLabel})` : ''}
                            </span>
                            <span className="font-mono text-stone-300 shrink-0 font-medium">
                              Rs. {(it.price * it.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-800 flex justify-between text-stone-400 text-[11px]">
                        <span>Subtotal:</span>
                        <span className="font-mono text-stone-300">
                          Rs. {placedOrderSummary.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-400 text-[11px]">
                        <span>Delivery Charge:</span>
                        <span className="font-mono text-stone-300">
                          {placedOrderSummary.orderType === 'Delivery' ? `Rs. ${placedOrderSummary.deliveryFee}` : 'Free (Pickup)'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1">
                    <span className="text-amber-400 uppercase tracking-wider text-xs">Total Bill:</span>
                    <span className="text-lg font-mono font-extrabold text-amber-400">
                      Rs. {(placedOrderSummary ? placedOrderSummary.total : finalTotal).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Payment:</span>
                    <span className="font-medium text-stone-200">Cash on Delivery</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Location:</span>
                    <span className="font-medium text-stone-200 text-right max-w-[180px] truncate">
                      {customerDetails.orderType === 'Delivery' ? customerDetails.address : 'Jadoon Plaza Mandian (Pickup)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Order Details via WhatsApp</span>
                  </button>

                  {/* Close Cross Option Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition border border-stone-800 hover:border-stone-700"
                  >
                    <X className="w-4 h-4 text-stone-400" />
                    <span>Close & Continue Browsing Menu</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
