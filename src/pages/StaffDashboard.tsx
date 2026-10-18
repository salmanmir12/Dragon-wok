import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  ChefHat,
  Bike,
  PackageCheck,
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { StoredOrder } from './CustomerAccount';
import { Link } from 'react-router-dom';

export const StaffDashboard: React.FC = () => {
  const { user, isStaff, isAdmin, logout, setAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Real-time listener for all orders
  useEffect(() => {
    if (!user || !isStaff) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'orders'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: StoredOrder[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<StoredOrder, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.warn('Staff orders listener error:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, [user, isStaff]);

  // Update order status in Firestore
  const handleUpdateStatus = async (orderDocId: string, newStatus: StoredOrder['status']) => {
    setUpdatingId(orderDocId);
    try {
      const orderRef = doc(db, 'orders', orderDocId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderDocId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#121316] text-white pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 p-8 text-center shadow-2xl">
          <ChefHat className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="font-serif-brand text-2xl font-bold mb-2">Staff Kitchen Portal</h2>
          <p className="text-stone-400 text-sm mb-6">
            Authorized Dragon Wok kitchen and delivery staff login required.
          </p>
          {!user ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition shadow-lg"
            >
              Sign In as Staff
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs mb-4">
              Your account ({user.email}) is currently registered as a customer and does not have staff permissions.
              Please contact the restaurant manager to authorize your staff account.
            </div>
          )}
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline mt-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'active') {
      return ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.status);
    }
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#121316] text-[#e5e7eb] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
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
                  Kitchen & Staff Board
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Staff View
                </span>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase hover:underline"
                  >
                    Open Admin
                  </Link>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Live preparation and order dispatch tracker • Dragon Wok Abbottabad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {[
            { id: 'active', label: 'Active Kitchen Orders' },
            { id: 'Pending', label: '🟡 New / Pending' },
            { id: 'Preparing', label: '🍳 In Wok / Preparing' },
            { id: 'Ready', label: '🥡 Ready' },
            { id: 'Out for Delivery', label: '🛵 Dispatched' },
            { id: 'Completed', label: '✅ Completed' },
            { id: 'all', label: 'All Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-[#991b1b] text-white shadow-md'
                  : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="p-16 text-center text-stone-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
            <p>Loading live kitchen orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <h3 className="font-serif-brand text-lg font-bold text-white mb-1">
              No orders matching this filter
            </h3>
            <p className="text-xs text-stone-400">
              Kitchen queue is currently clear for the selected status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const orderTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Karachi',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className={`bg-[#181a20] rounded-xl border ${
                    order.status === 'Pending'
                      ? 'border-amber-500 animate-pulse'
                      : order.status === 'Preparing'
                      ? 'border-purple-500/70'
                      : 'border-stone-800'
                  } p-5 flex flex-col justify-between shadow-xl`}
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {order.orderId}
                      </span>
                      <span className="text-stone-400">{orderTime}</span>
                    </div>

                    {/* Customer Info */}
                    <div className="py-3 border-b border-stone-800/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </div>
                      <div className="text-stone-400">
                        {order.orderType === 'delivery' ? (
                          <span className="text-amber-300 font-medium flex items-center gap-1">
                            <Bike className="w-3 h-3" /> Delivery: {order.deliveryAddress}
                          </span>
                        ) : (
                          <span className="text-cyan-300 font-medium">🥡 Pickup / Takeaway</span>
                        )}
                      </div>
                      {order.notes && (
                        <div className="p-2 rounded bg-stone-900 border border-stone-800 text-stone-300 italic">
                          "{order.notes}"
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="py-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Kitchen Items ({order.items.length})
                      </span>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between text-xs bg-stone-900/60 p-2 rounded border border-stone-800/80"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-white">{item.name}</span>
                            {item.portionLabel && (
                              <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded">
                                {item.portionLabel}
                              </span>
                            )}
                          </div>
                          <span className="text-stone-400">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Status Transitions */}
                  <div className="pt-4 border-t border-stone-800">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-stone-400">Current Status:</span>
                      <span className="font-bold text-amber-300">{order.status}</span>
                    </div>

                    <div className="space-y-2">
                      {order.status === 'Pending' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                          className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Start Cooking (Wok)</span>
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'Ready')}
                          className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark Food Ready & Packed</span>
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, order.orderType === 'delivery' ? 'Out for Delivery' : 'Completed')}
                          className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          {order.orderType === 'delivery' ? (
                            <>
                              <Bike className="w-3.5 h-3.5" />
                              <span>Dispatch (Out for Delivery)</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Handover to Customer</span>
                            </>
                          )}
                        </button>
                      )}

                      {order.status === 'Out for Delivery' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'Completed')}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Successfully Delivered</span>
                        </button>
                      )}

                      {/* Cancel option */}
                      {!['Completed', 'Cancelled'].includes(order.status) && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel order ${order.orderId}?`)) {
                              handleUpdateStatus(order.id, 'Cancelled');
                            }
                          }}
                          className="w-full py-1.5 bg-stone-900 hover:bg-rose-950/40 text-stone-500 hover:text-rose-400 rounded-lg text-[11px] font-medium transition"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
