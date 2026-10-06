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
} from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    items,
    totalPrice,
    restaurantStatus,
    customerDetails,
    setCustomerDetails,
    clearCart,
  } = useOrder();

  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isCheckoutOpen) {
      setStep('form');
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
      newErrors.address = 'Please enter your delivery address.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep('confirm');
    }
  };

  const handleSendToWhatsApp = () => {
    const whatsappUrl = generateWhatsAppOrderUrl(
      customerDetails,
      items,
      totalPrice,
      !restaurantStatus.isOpen
    );

    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Optionally close checkout and keep cart or let user know
    setIsCheckoutOpen(false);
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
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 block">
                {step === 'form' ? 'Step 1 of 2' : 'Step 2 of 2'}
              </span>
              <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white">
                {step === 'form' ? 'Checkout Details' : 'Ready to Order?'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed warning banner if closed */}
        {!restaurantStatus.isOpen && (
          <div className="mb-6 bg-rose-950/50 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
            <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-white mb-0.5">
                Restaurant Currently Closed (12:00 PM – 2:00 AM)
              </strong>
              Your order can be prepared once Dragon Wok opens at 12:00 PM. You can still send your pre-order to WhatsApp now.
            </div>
          </div>
        )}

        {/* STEP 1: Customer Form */}
        {step === 'form' ? (
          <form onSubmit={handleValidateAndProceed} noValidate className="space-y-4">
            {/* Customer Name */}
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5"
              >
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="checkout-name"
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Ali Khan"
                  className={`w-full bg-stone-900 border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 ${
                    errors.name
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5"
              >
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="checkout-phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="e.g. 0310 1234567"
                  className={`w-full bg-stone-900 border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 ${
                    errors.phone
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Delivery or Pickup */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">
                Order Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCustomerDetails((prev) => ({ ...prev, orderType: 'Delivery' }))
                  }
                  className={`py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                    customerDetails.orderType === 'Delivery'
                      ? 'bg-[#991b1b] text-white border-red-700 shadow-sm'
                      : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomerDetails((prev) => ({ ...prev, orderType: 'Pickup' }))
                  }
                  className={`py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                    customerDetails.orderType === 'Pickup'
                      ? 'bg-[#991b1b] text-white border-red-700 shadow-sm'
                      : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pickup</span>
                </button>
              </div>
            </div>

            {/* Delivery Address (only if Delivery) */}
            {customerDetails.orderType === 'Delivery' && (
              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5"
                >
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <textarea
                    id="checkout-address"
                    rows={2}
                    value={customerDetails.address}
                    onChange={(e) =>
                      setCustomerDetails((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="House/Street, Area (e.g. Mandian, Abbottabad)"
                    className={`w-full bg-stone-900 border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 resize-none ${
                      errors.address
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5"
              >
                Special Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <textarea
                  id="checkout-notes"
                  rows={2}
                  value={customerDetails.notes}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="e.g. Less spicy please, call when arrived..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 uppercase font-semibold">Subtotal</span>
                <p className="font-serif-brand text-xl font-bold text-amber-400 tabular-nums">
                  Rs. {totalPrice.toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Continue to Review</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Confirmation Screen */
          <div className="space-y-5">
            <p className="text-xs text-stone-400 leading-relaxed">
              Review your order details below. Once confirmed, this will launch WhatsApp with a pre-filled message ready to send to Dragon Wok.
            </p>

            {/* Customer Summary Box */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-400">Name:</span>
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
              {customerDetails.orderType === 'Delivery' && customerDetails.address && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Address:</span>
                  <span className="text-white font-semibold max-w-[200px] text-right truncate">
                    {customerDetails.address}
                  </span>
                </div>
              )}
              {customerDetails.notes && (
                <div className="flex justify-between pt-1 border-t border-stone-800">
                  <span className="text-stone-400">Notes:</span>
                  <span className="text-stone-200 italic">{customerDetails.notes}</span>
                </div>
              )}
            </div>

            {/* Items Summary Box */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 text-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Order Items ({items.length})
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-stone-300">
                  <span className="truncate pr-2">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="text-white font-semibold tabular-nums shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline font-bold text-sm">
                <span className="text-white uppercase text-xs">Subtotal</span>
                <span className="text-amber-400 text-base tabular-nums">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2.5">
              <button
                onClick={handleSendToWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 py-3.5 px-6 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Send className="w-4 h-4 text-stone-950" />
                <span>Send Order on WhatsApp</span>
              </button>

              <button
                onClick={() => setStep('form')}
                className="w-full py-2.5 text-xs uppercase font-semibold text-stone-400 hover:text-white"
              >
                Go Back and Edit Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
