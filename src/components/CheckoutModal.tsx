import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ShoppingBag,
  Send,
  MapPin,
  Phone,
  User,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, removeUndefined, handleFirestoreError, OperationType } from '../firebase';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import { Link } from 'react-router-dom';

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

  const { user, profile, setAuthModalOpen, setAuthModalView } = useAuth();
  const { validateCartItems } = useMenu();

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Validate cart items & calculate server-verified pricing
  const validatedPricing = validateCartItems(
    items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      category: i.category,
      portionLabel: i.portionLabel,
    }))
  );

  const finalDeliveryFee = customerDetails.orderType === 'Delivery' ? validatedPricing.deliveryFee : 0;
  const finalTotal = validatedPricing.subtotal + finalDeliveryFee;

  // Pre-fill user profile information if available
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

  // Pakistani phone validation: matches 03xx-xxxxxxx, +923xxxxxxxxx, 923xxxxxxxxx, or any 10-11 digit mobile
  const isValidPakistaniPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const regex = /^(03\d{9}|\+923\d{9}|923\d{9}|0\d{10})$/;
    return regex.test(cleaned);
  };

  const handleValidateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!isValidPakistaniPhone(customerDetails.phone)) {
      newErrors.phone = 'Please enter a valid Pakistani phone number (e.g. 0310 1234567).';
    }

    if (customerDetails.orderType === 'Delivery' && !customerDetails.address.trim()) {
      newErrors.address = 'Please enter your delivery address in Abbottabad.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep('confirm');
    }
  };

  // Confirm and persist real order into Firestore
  const handlePlaceOrder = async () => {
    if (placingOrder) return; // Prevent duplicate clicks
    setPlacingOrder(true);
    setSubmitError(null);
    setErrors({});

    try {
      const uniqueOrderNumber = `DW-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDocRef = doc(db, 'orders', uniqueOrderNumber);

      const orderPayload = {
        orderId: uniqueOrderNumber,
        userId: user ? user.uid : 'guest',
        customerName: (customerDetails.name || '').trim(),
        customerPhone: (customerDetails.phone || '').trim(),
        orderType: (customerDetails.orderType || 'Pickup').toLowerCase() as 'delivery' | 'pickup',
        deliveryAddress: customerDetails.orderType === 'Delivery' ? (customerDetails.address || '').trim() : '',
        notes: (customerDetails.notes || '').trim(),
        items: (validatedPricing.validatedItems || []).map((item) => {
          const itemPrice = Number(item.price) || 0;
          const itemQty = Number(item.quantity) || 1;
          return {
            id: item.id,
            name: item.name || 'Dish',
            price: itemPrice,
            quantity: itemQty,
            category: item.category || 'General',
            portionLabel: item.portionLabel || null,
            itemTotal: itemPrice * itemQty,
          };
        }),
        subtotal: Number(validatedPricing.subtotal) || 0,
        deliveryFee: Number(finalDeliveryFee) || 0,
        total: Number(finalTotal) || 0,
        status: 'Pending',
        paymentMethod: 'cod',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cleanPayload = removeUndefined(orderPayload);
      await setDoc(orderDocRef, cleanPayload);

      setPlacedOrderId(uniqueOrderNumber);
      clearCart();
      setStep('success');
    } catch (err: any) {
      console.error('Order creation error:', err);
      const userFriendlyMsg = err?.message?.includes('insufficient permissions')
        ? 'Permission error: could not record order in database. Please check connection and try again.'
        : (err?.message || 'Failed to place order. Please try again.');
      setSubmitError(userFriendlyMsg);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSendToWhatsApp = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={() => setIsCheckoutOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-lg w-full bg-[#181a20] rounded-2xl border border-stone-800 shadow-2xl p-6 sm:p-8 my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
          <div className="flex items-center gap-2">
            {step === 'confirm' && (
              <button
                onClick={() => setStep('form')}
                className="p-1 text-stone-400 hover:text-white mr-1 rounded"
                aria-label="Go back to details"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-serif-brand text-xl font-bold text-white">
              {step === 'form' && 'Order Checkout'}
              {step === 'confirm' && 'Review & Confirm Order'}
              {step === 'success' && 'Order Placed Successfully!'}
            </h3>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed warning banner */}
        {!restaurantStatus.isOpen && step !== 'success' && (
          <div className="mb-5 bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3 text-amber-200 text-xs">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Restaurant is currently closed</p>
              <p className="text-amber-200/80 mt-0.5">
                Our kitchen opens at 12:00 PM (PKT). Your order will be placed as a priority pre-order!
              </p>
            </div>
          </div>
        )}

        {/* Member login prompt banner if guest */}
        {!user && step === 'form' && (
          <div className="mb-5 p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-300">Have a Dragon Wok account?</span>
            <button
              type="button"
              onClick={() => {
                setAuthModalView('login');
                setAuthModalOpen(true);
              }}
              className="text-amber-400 font-semibold hover:underline"
            >
              Sign In to auto-fill details
            </button>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleValidateAndProceed} className="space-y-4">
            {/* Fulfillment Type Toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Order Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerDetails((prev) => ({ ...prev, orderType: 'Delivery' }))}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    customerDetails.orderType === 'Delivery'
                      ? 'bg-[#991b1b] border-amber-500/50 text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Delivery (+Rs. {validatedPricing.deliveryFee})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerDetails((prev) => ({ ...prev, orderType: 'Pickup' }))}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    customerDetails.orderType === 'Pickup'
                      ? 'bg-[#991b1b] border-amber-500/50 text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pickup / Takeaway</span>
                </button>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label htmlFor="checkout-name" className="block text-xs font-medium text-stone-300 mb-1">
                Your Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  id="checkout-name"
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => {
                    setCustomerDetails((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Hamza Khan"
                  className={`w-full bg-stone-900 border ${
                    errors.name ? 'border-rose-500' : 'border-stone-800'
                  } rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500`}
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="checkout-phone" className="block text-xs font-medium text-stone-300 mb-1">
                Phone Number (WhatsApp Active) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  id="checkout-phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => {
                    setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="0310 1234567"
                  className={`w-full bg-stone-900 border ${
                    errors.phone ? 'border-rose-500' : 'border-stone-800'
                  } rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500`}
                />
              </div>
              {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Delivery Address */}
            {customerDetails.orderType === 'Delivery' && (
              <div>
                <label htmlFor="checkout-address" className="block text-xs font-medium text-stone-300 mb-1">
                  Delivery Address in Abbottabad <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                  <textarea
                    id="checkout-address"
                    rows={2}
                    value={customerDetails.address}
                    onChange={(e) => {
                      setCustomerDetails((prev) => ({ ...prev, address: e.target.value }));
                      if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    placeholder="House/flat #, Street, Near landmark, Abbottabad"
                    className={`w-full bg-stone-900 border ${
                      errors.address ? 'border-rose-500' : 'border-stone-800'
                    } rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none`}
                  />
                </div>
                {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address}</p>}
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label htmlFor="checkout-notes" className="block text-xs font-medium text-stone-300 mb-1">
                Special Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <textarea
                  id="checkout-notes"
                  rows={2}
                  value={customerDetails.notes}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="e.g. Less spicy please, extra hot sauce, call when arrived..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Pricing Summary & Review Button */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 uppercase font-semibold">Total to Pay</span>
                <p className="font-serif-brand text-xl font-bold text-amber-400">
                  Rs. {finalTotal.toLocaleString()}
                </p>
                <span className="text-[10px] text-stone-500">Cash on Delivery</span>
              </div>

              <button
                type="submit"
                className="bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition shadow-md"
              >
                Review & Place Order
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW & CONFIRM */}
        {step === 'confirm' && (
          <div className="space-y-5">
            <p className="text-xs text-stone-400 leading-relaxed">
              Review your details below. When you click <strong>Place Order</strong>, your order will be validated and saved directly into Dragon Wok's live Firestore database and kitchen dashboard.
            </p>

            {/* Error Banner if Firestore Save Failed */}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold block">Could not place order:</span>
                  <span>{submitError}</span>
                </div>
              </div>
            )}

            {/* Customer Details Box */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-400">Customer:</span>
                <span className="text-white font-semibold">{customerDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Phone:</span>
                <span className="text-white font-semibold">{customerDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Order Type:</span>
                <span className="text-amber-400 font-semibold">{customerDetails.orderType}</span>
              </div>
              {customerDetails.orderType === 'Delivery' && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Address:</span>
                  <span className="text-white font-semibold text-right max-w-[220px] truncate">
                    {customerDetails.address}
                  </span>
                </div>
              )}
              {customerDetails.notes && (
                <div className="flex justify-between pt-1 border-t border-stone-800">
                  <span className="text-stone-400">Notes:</span>
                  <span className="text-stone-300 italic">{customerDetails.notes}</span>
                </div>
              )}
            </div>

            {/* Order Items Breakdown */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 text-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Order Items ({validatedPricing.validatedItems.length})
              </div>
              {validatedPricing.validatedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-stone-300">
                  <span>
                    {item.quantity}x {item.name} {item.portionLabel && `(${item.portionLabel})`}
                  </span>
                  <span className="font-semibold text-white">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-stone-800 space-y-1 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal:</span>
                  <span>Rs. {validatedPricing.subtotal.toLocaleString()}</span>
                </div>
                {customerDetails.orderType === 'Delivery' && (
                  <div className="flex justify-between text-stone-400">
                    <span>Delivery Fee:</span>
                    <span>Rs. {validatedPricing.deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline font-bold text-sm pt-1 border-t border-stone-800">
                  <span className="text-white uppercase text-xs">Total Amount</span>
                  <span className="text-amber-400 text-base">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-400 flex items-center justify-between">
              <span>Payment Method:</span>
              <span className="font-bold text-white">
                {customerDetails.orderType === 'Delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-3.5 px-6 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#991b1b] hover:bg-[#b91c1c] text-white transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Order to Kitchen...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (Cash on Delivery)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={placingOrder}
                className="w-full py-2.5 text-xs uppercase font-semibold text-stone-400 hover:text-white"
              >
                Go Back and Edit Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif-brand text-2xl font-bold text-white mb-1">
                Order Placed Successfully!
              </h4>
              <p className="text-xs text-stone-400">
                Your order is confirmed in Dragon Wok's live kitchen system.
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 text-xs space-y-2">
              <div className="text-stone-400">Your Order Reference ID:</div>
              <div className="font-mono text-2xl font-bold text-amber-400 tracking-wider">
                {placedOrderId}
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-600/60 text-amber-300">
                🟡 Initial Status: Pending (Received by Kitchen)
              </div>
            </div>

            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Your order has been recorded. Our chef and kitchen staff have received the notification.
            </p>

            {/* Optional Secondary WhatsApp Action */}
            <div className="pt-3 border-t border-stone-800 space-y-2 text-left">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider text-center">
                Optional Secondary Action
              </div>
              <button
                onClick={handleSendToWhatsApp}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 transition shadow flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Send Order Details on WhatsApp (+92 310 0968734)</span>
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-1">
              <Link
                to="/account"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold transition text-center"
              >
                Track in My Account
              </Link>

              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-lg border border-stone-800 bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-white text-xs font-semibold transition"
              >
                Back to Menu / Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
