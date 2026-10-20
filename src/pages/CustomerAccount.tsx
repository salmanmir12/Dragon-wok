import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  Heart,
  ChevronRight,
  LogOut,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useMenu } from '../context/MenuContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export interface StoredOrder {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  notes?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    portionLabel?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
}

export const CustomerAccount: React.FC = () => {
  const { user, profile, logout, updateCustomerProfile, setAuthModalOpen, setAuthModalView, toggleFavorite } = useAuth();
  const { addItem, setIsCartOpen } = useOrder();
  const { getItemById } = useMenu();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'favorites'>('orders');
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Guest order lookup states
  const [lookupOrderId, setLookupOrderId] = useState(searchParams.get('order') || '');
  const [lookupResult, setLookupResult] = useState<StoredOrder | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderId.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    const cleanId = lookupOrderId.trim().toUpperCase();
    try {
      const orderRef = doc(db, 'orders', cleanId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        setLookupResult({ id: snap.id, ...(snap.data() as Omit<StoredOrder, 'id'>) });
      } else {
        setLookupError(`Order reference "${cleanId}" was not found. Please verify the ID.`);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Error looking up order.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Real-time listener for current user's orders
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: StoredOrder[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<StoredOrder, 'id'>) });
      });
      // Sort in-memory to prevent complex composite index dependency
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
      setLoadingOrders(false);
    }, (err) => {
      console.warn('Orders listener error:', err.message);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [user]);

  // Handle reordering items
  const handleReorder = (order: StoredOrder) => {
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        portionLabel: item.portionLabel,
      });
    });
    setIsCartOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateCustomerProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const currentAddrs = profile?.addresses || [];
    if (currentAddrs.includes(newAddress.trim())) return;
    try {
      await updateCustomerProfile({
        addresses: [...currentAddrs, newAddress.trim()],
      });
      setNewAddress('');
      setProfileMsg({ type: 'success', text: 'Address added!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to save address.' });
    }
  };

  const handleDeleteAddress = async (index: number) => {
    const currentAddrs = profile?.addresses || [];
    const updated = currentAddrs.filter((_, i) => i !== index);
    try {
      await updateCustomerProfile({ addresses: updated });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to remove address.' });
    }
  };

  // Status visual pill styling
  const getStatusBadge = (status: StoredOrder['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/70 border border-amber-600/60 text-amber-300">🟡 Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950/70 border border-blue-600/60 text-blue-300">🔵 Confirmed</span>;
      case 'Preparing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/70 border border-purple-600/60 text-purple-300 animate-pulse">🍳 Preparing in Wok</span>;
      case 'Ready':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950/70 border border-cyan-600/60 text-cyan-300">🥡 Ready for Pickup / Dispatch</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-950/70 border border-orange-600/60 text-orange-300 animate-pulse">🛵 Out for Delivery</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-600/60 text-emerald-300">✅ Delivered & Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/70 border border-rose-600/60 text-rose-300">❌ Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121316] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 p-8 text-center shadow-2xl space-y-6">
          <picture>
            <source srcSet="/images/dragon_wok_logo.webp" type="image/webp" />
            <img
              src="/images/dragon_wok_logo.jpg"
              alt="Dragon Wok"
              className="w-16 h-16 rounded-full mx-auto border-2 border-amber-500/40 object-cover shadow-lg"
            />
          </picture>
          <div>
            <h2 className="font-serif-brand text-2xl font-bold mb-1">Customer Account & Tracking</h2>
            <p className="text-stone-400 text-xs">
              Sign in to manage your orders & saved addresses, or track any guest order with your Reference ID.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setAuthModalView('login');
                setAuthModalOpen(true);
              }}
              className="w-full py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition shadow-lg"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => {
                setAuthModalView('register');
                setAuthModalOpen(true);
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-lg text-sm font-semibold tracking-wider uppercase transition"
            >
              Create New Account
            </button>
          </div>

          {/* Guest Order Tracking Box */}
          <div className="pt-4 border-t border-stone-800 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
              Track Guest Order
            </span>
            <form onSubmit={handleLookupOrder} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. DW-123456"
                value={lookupOrderId}
                onChange={(e) => setLookupOrderId(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition disabled:opacity-50"
              >
                {lookupLoading ? '...' : 'Track'}
              </button>
            </form>

            {lookupError && (
              <p className="text-rose-400 text-[11px] mt-2">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="mt-4 p-4 rounded-xl bg-stone-900 border border-amber-500/40 text-xs space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-amber-400">{lookupResult.orderId}</span>
                  {getStatusBadge(lookupResult.status)}
                </div>
                {(() => {
                  const itemsSum = (lookupResult.items || []).reduce(
                    (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
                    0
                  );
                  const delivery = lookupResult.deliveryFee || 0;
                  const expectedTotal = itemsSum + delivery;
                  const displayTotal =
                    lookupResult.total && lookupResult.total > 0 && !(lookupResult.total === 150 && expectedTotal > 150)
                      ? lookupResult.total
                      : expectedTotal;

                  return (
                    <div className="text-stone-300">
                      Total: <strong className="text-white">Rs. {displayTotal.toLocaleString()}</strong> • {lookupResult.orderType.toUpperCase()}
                    </div>
                  );
                })()}
                <div className="text-stone-400">
                  {lookupResult.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dragon Wok Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121316] text-[#e5e7eb] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white">
                  My Account
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Customer
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Welcome back, {profile?.name || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-rose-950/50 hover:text-rose-400 border border-stone-800 text-xs font-semibold text-stone-300 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-stone-800/80">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'orders'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Live Tracking ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'favorites'
                ? 'bg-[#991b1b] text-white shadow-md'
                : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favorite Dishes ({profile?.favorites?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & LIVE TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="p-12 text-center text-stone-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
                <p>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <h3 className="font-serif-brand text-lg font-bold text-white mb-2">No Orders Yet</h3>
                <p className="text-stone-400 text-sm max-w-sm mx-auto mb-6">
                  You haven't placed an order yet. Explore our authentic wok-tossed chowmein, sizzling momos, and signature dishes!
                </p>
                <Link
                  to="/#menu"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-lg"
                >
                  <span>Explore Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isActive = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(order.status);
                const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
                  timeZone: 'Asia/Karachi',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <div
                    key={order.id}
                    className={`bg-[#181a20] rounded-2xl border ${
                      isActive ? 'border-amber-500/50 shadow-lg shadow-amber-950/20' : 'border-stone-800'
                    } p-6 transition-all`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-amber-400">
                            {order.orderId}
                          </span>
                          <span className="text-xs text-stone-400">
                            {orderDate} (PKT)
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                          {order.orderType === 'delivery' ? '🛵 Delivery Order' : '🥡 Takeaway / Pickup'}
                          {order.deliveryAddress && ` • ${order.deliveryAddress}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Active Order Progress Timeline */}
                    {isActive && (
                      <div className="py-6 px-4 my-4 rounded-xl bg-stone-900/80 border border-stone-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>Live Order Progress</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2 rounded-lg border ${order.status === 'Pending' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-stone-950 border-stone-800 text-stone-400'}`}>
                            1. Received
                          </div>
                          <div className={`p-2 rounded-lg border ${['Confirmed', 'Preparing'].includes(order.status) ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'bg-stone-950 border-stone-800 text-stone-400'}`}>
                            2. In the Wok
                          </div>
                          <div className={`p-2 rounded-lg border ${order.status === 'Ready' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' : 'bg-stone-950 border-stone-800 text-stone-400'}`}>
                            3. Packed & Ready
                          </div>
                          <div className={`p-2 rounded-lg border ${order.status === 'Out for Delivery' ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold' : 'bg-stone-950 border-stone-800 text-stone-400'}`}>
                            4. On the Way
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ordered Items List */}
                    <div className="py-4 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 text-stone-200">
                            <span className="font-bold text-amber-400">{item.quantity}x</span>
                            <span>{item.name}</span>
                            {item.portionLabel && (
                              <span className="text-[10px] text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                                {item.portionLabel}
                              </span>
                            )}
                          </div>
                          <span className="text-stone-300 font-medium">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Financials & Action Buttons */}
                    <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {(() => {
                        const itemsSum = (order.items || []).reduce(
                          (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
                          0
                        );
                        const delivery = Number(order.deliveryFee) || 0;
                        const expectedTotal = itemsSum + delivery;
                        const finalSubtotal = itemsSum > 0 ? itemsSum : (Number(order.subtotal) || 0);
                        const finalTotal =
                          order.total && order.total > 0 && !(order.total === 150 && expectedTotal > 150)
                            ? order.total
                            : expectedTotal;

                        return (
                          <div className="text-xs text-stone-400 space-y-1">
                            <div>Subtotal: Rs. {finalSubtotal.toLocaleString()}</div>
                            {delivery > 0 && <div>Delivery Fee: Rs. {delivery}</div>}
                            <div className="text-sm font-bold text-white pt-1">
                              Total: <span className="text-amber-400">Rs. {finalTotal.toLocaleString()}</span>
                              <span className="ml-2 text-[10px] font-normal uppercase text-stone-400">
                                ({order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay at Counter'})
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex flex-wrap items-center gap-2">
                        {/* WhatsApp order query */}
                        <a
                          href={`https://wa.me/923100968734?text=${encodeURIComponent(
                            `Hello Dragon Wok! I am inquiring about my Order ${order.orderId} (Status: ${order.status}). Name: ${order.customerName}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>WhatsApp Support</span>
                        </a>

                        {/* Reorder Button */}
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reorder All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & ADDRESSES */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 sm:p-8">
              <h3 className="font-serif-brand text-lg font-bold text-white mb-1">
                Personal Information
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Update your contact details for quicker order checkouts.
              </p>

              {profileMsg && (
                <div
                  className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border border-rose-800 text-rose-300'
                  }`}
                >
                  {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Email is linked to your authentication login.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0310 1234567"
                    className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 sm:p-8">
              <h3 className="font-serif-brand text-lg font-bold text-white mb-1">
                Saved Delivery Addresses
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Store your home, hostel, university, or office addresses for seamless delivery in Abbottabad.
              </p>

              <div className="space-y-3 mb-6">
                {(!profile?.addresses || profile.addresses.length === 0) ? (
                  <p className="text-xs text-stone-500 italic">No saved addresses yet. Add one below.</p>
                ) : (
                  profile.addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-stone-900 border border-stone-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2 text-stone-200">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{addr}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-stone-500 hover:text-rose-400 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Address Form */}
              <form onSubmit={handleAddAddress} className="space-y-3">
                <label className="block text-xs font-medium text-stone-300">
                  Add New Delivery Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. House #14, Street 3, Jadoon Plaza Phase 1, Mandian, Abbottabad"
                  className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add Address to Account</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: FAVORITE DISHES */}
        {activeTab === 'favorites' && (
          <div>
            {(!profile?.favorites || profile.favorites.length === 0) ? (
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-12 text-center">
                <Heart className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <h3 className="font-serif-brand text-lg font-bold text-white mb-2">No Favorites Saved</h3>
                <p className="text-stone-400 text-sm max-w-sm mx-auto mb-6">
                  Browse our menu and click the heart icon on any dish to save it here for quick reordering!
                </p>
                <Link
                  to="/#menu"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-lg"
                >
                  <span>Browse Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.favorites.map((favId) => {
                  const dish = getItemById(favId);
                  if (!dish) return null;
                  return (
                    <div
                      key={dish.id}
                      className="bg-[#181a20] rounded-xl border border-stone-800 overflow-hidden p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                            {dish.category}
                          </span>
                          <button
                            onClick={() => toggleFavorite(dish.id)}
                            className="text-rose-500 hover:text-rose-400 p-1"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <h4 className="font-bold text-white text-base mb-1">{dish.name}</h4>
                        {dish.description && (
                          <p className="text-xs text-stone-400 line-clamp-2 mb-3">{dish.description}</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                        <span className="font-serif-brand text-base font-bold text-amber-400">
                          Rs. {dish.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            addItem({
                              id: dish.id,
                              name: dish.name,
                              price: dish.price,
                              category: dish.category,
                            });
                          }}
                          className="px-3.5 py-1.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
