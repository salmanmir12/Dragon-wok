import React, { useState, useEffect, useRef } from 'react';
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
  ChefHat,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Check,
  Bike,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { StoredOrder } from './CustomerAccount';
import { Link } from 'react-router-dom';
import { kitchenAudioAlert } from '../utils/kitchenAlertSound';
import { triggerOrderConfirmation } from '../utils/notificationService';

export const KitchenDashboard: React.FC = () => {
  const { user, isStaff, isAdmin, logout, setAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Audio state
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => kitchenAudioAlert.getUnlocked());
  const [activeAlarmOrderId, setActiveAlarmOrderId] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);

  // Track initial snapshot vs real new orders
  const isFirstLoadRef = useRef(true);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const announcedOrderIdsRef = useRef<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  // Request browser desktop notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  // Unlock browser audio restrictions on overlay click
  const handleEnableAudio = () => {
    kitchenAudioAlert.unlock();
    setAudioUnlocked(true);
    // Request notification permission if not yet decided
    if (notificationPermission === 'default') {
      handleRequestNotificationPermission();
    }
    // Play a gentle confirmation test chime
    kitchenAudioAlert.playChime(0.4);
  };

  // Test Voice & Chime manually
  const handleTestAudio = () => {
    kitchenAudioAlert.unlock();
    setAudioUnlocked(true);
    kitchenAudioAlert.playChime(0.6);
    setTimeout(() => {
      kitchenAudioAlert.speakOrder('888', 1400);
    }, 400);
  };

  // Mute / Stop current ringing alarm
  const handleSilenceAlarm = () => {
    kitchenAudioAlert.stopOrderAlarm();
    setActiveAlarmOrderId(null);
  };

  // Real-time Firestore orders listener with loud chime + TTS on new Pending order
  useEffect(() => {
    if (!user || (!isStaff && !isAdmin)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'orders'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: StoredOrder[] = [];
        const currentBatchIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<StoredOrder, 'id'>;
          const order: StoredOrder = { id: docSnap.id, ...data };
          list.push(order);
          currentBatchIds.add(order.orderId || docSnap.id);
        });

        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
        setLoading(false);

        // Detect newly arrived orders in real-time
        if (!isFirstLoadRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrder = change.doc.data() as StoredOrder;
              const orderId = newOrder.orderId || change.doc.id;

              // Rule: only genuinely new Pending orders not yet in known list and not yet announced
              if (
                newOrder.status === 'Pending' &&
                !knownOrderIdsRef.current.has(orderId) &&
                !announcedOrderIdsRef.current.has(orderId)
              ) {
                announcedOrderIdsRef.current.add(orderId);
                if (!soundMuted) {
                  setActiveAlarmOrderId(orderId);
                  kitchenAudioAlert.startOrderAlarm(orderId, newOrder.total, newOrder.customerName);
                }
              }
            }
          });
        } else {
          // On first load, record existing orders without playing sound (Requirement 4: Do not play for old orders on first load)
          currentBatchIds.forEach((id) => announcedOrderIdsRef.current.add(id));
          isFirstLoadRef.current = false;
        }

        // Update known IDs
        knownOrderIdsRef.current = currentBatchIds;
      },
      (err) => {
        console.warn('Kitchen orders listener error:', err.message);
        setLoading(false);
      }
    );

    return () => {
      unsub();
      kitchenAudioAlert.stopOrderAlarm();
    };
  }, [user, isStaff, isAdmin, soundMuted]);

  // Order status progression
  const handleUpdateStatus = async (
    orderDocId: string,
    newStatus: StoredOrder['status'],
    orderData?: StoredOrder
  ) => {
    setUpdatingId(orderDocId);
    try {
      // Stop reminder alarm immediately for this accepted order
      kitchenAudioAlert.stopOrderAlarm(orderData?.orderId || orderDocId);
      if (activeAlarmOrderId === orderData?.orderId || activeAlarmOrderId === orderDocId) {
        setActiveAlarmOrderId(null);
      }

      const orderRef = doc(db, 'orders', orderDocId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Auto-trigger customer confirmation notification when kitchen accepts order
      if (newStatus === 'Confirmed' && orderData) {
        const itemsSum = (orderData.items || []).reduce(
          (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
          0
        );
        const deliveryFee = orderData.orderType === 'delivery' ? (Number(orderData.deliveryFee) || 0) : 0;
        const expectedTotal = itemsSum + deliveryFee;
        const calculatedTotal =
          orderData.total && orderData.total > 0 && !(orderData.total === 150 && expectedTotal > 150)
            ? orderData.total
            : expectedTotal;

        triggerOrderConfirmation({
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          orderType: orderData.orderType,
          total: calculatedTotal,
          deliveryAddress: orderData.deliveryAddress,
          newStatus: 'Confirmed',
          itemsSummary: (orderData.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', '),
        }).catch((e) => console.warn('Customer confirmation error:', e));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderDocId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // If not logged in as staff/admin, display pleasant staff login gate
  if (!user || (!isStaff && !isAdmin)) {
    return (
      <div className="min-h-screen bg-[#101216] text-white pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#181a22] rounded-3xl border border-stone-800 p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#991b1b] to-amber-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-700/60 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
            <ChefHat className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
            Dragon Wok Abbottabad
          </span>
          <h2 className="font-serif-brand text-2xl font-bold mb-2">Kitchen Staff Dashboard</h2>
          <p className="text-stone-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Live order queue, dual-tone audio alerts & Text-to-Speech order announcements for kitchen wok chefs and counter staff.
          </p>

          {!user ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3.5 px-6 bg-[#991b1b] hover:bg-[#b91c1c] active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-xl shadow-red-950/60"
            >
              Sign In as Staff / Kitchen
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-4 text-left">
              <p className="font-semibold text-white mb-1">Authorization Notice</p>
              Signed in as <span className="font-mono text-amber-300">{user.email}</span>. To view live kitchen tickets, your account must have Staff or Admin permissions.
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Ordering Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (o.orderId || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter === 'active') {
      return ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.status);
    }
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const cookingCount = orders.filter((o) => ['Confirmed', 'Preparing'].includes(o.status)).length;
  const readyCount = orders.filter((o) => ['Ready', 'Out for Delivery'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e5e7eb] pt-24 pb-20">
      
      {/* AUTOPLAY RESTRICTION OVERLAY */}
      {!audioUnlocked && (
        <div
          onClick={handleEnableAudio}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-[#181a22] border-2 border-amber-500 rounded-3xl p-8 text-center shadow-2xl relative space-y-5">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-400 animate-bounce">
              <BellRing className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                Kitchen Terminal Alert Setup
              </span>
              <h2 className="font-serif-brand text-2xl font-bold text-white mb-2">
                Click Anywhere to Enable Audio Alerts
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Web browsers require one initial tap to unlock loud sound alarms and voice announcements for Dragon Wok kitchen orders.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-300 text-left space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Volume2 className="w-4 h-4 shrink-0" />
                <span>Continuous Kitchen Chime Bell</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ChefHat className="w-4 h-4 shrink-0" />
                <span>Text-to-Speech: "New Order Received! Order Number: [ID]"</span>
              </div>
            </div>

            <button
              onClick={handleEnableAudio}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#991b1b] hover:from-amber-400 hover:to-[#b91c1c] text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition shadow-xl shadow-red-950/60 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Tap to Enable Kitchen Speaker</span>
            </button>
            <p className="text-[11px] text-stone-500">Tap anywhere on this screen to start</p>
          </div>
        </div>
      )}

      {/* CONTINUOUS RINGING ALARM BANNER */}
      {activeAlarmOrderId && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse border-b-2 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center shadow-lg font-bold">
              <BellRing className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-100 block">
                🚨 INCOMING NEW ORDER ALARM
              </span>
              <p className="font-bold text-sm sm:text-base">
                Order #{activeAlarmOrderId} Received! Audio chime & voice alert ringing...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSilenceAlarm}
              className="px-4 py-2 bg-stone-900/90 hover:bg-black text-amber-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
            >
              <VolumeX className="w-4 h-4" />
              <span>Silence Alarm</span>
            </button>
            <button
              onClick={() => {
                const target = orders.find((o) => o.orderId === activeAlarmOrderId);
                if (target) {
                  handleUpdateStatus(target.id, 'Confirmed', target);
                } else {
                  handleSilenceAlarm();
                }
              }}
              className="px-5 py-2 bg-white text-red-700 hover:bg-amber-100 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Order #{activeAlarmOrderId}</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-800">
          <div className="flex items-center gap-3.5">
            <Link
              to="/"
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition border border-stone-800"
              title="Return to Digital Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-amber-500" />
                <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  Kitchen Display & Voice Alerts
                </h1>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Dragon Wok Abbottabad • Mandian Branch • Live Orders Station
              </p>
            </div>
          </div>

          {/* Audio Controls & Status Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Audio Status Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                audioUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  audioUnlocked ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{audioUnlocked ? 'Voice & Chimes Active' : 'Audio Pending Click'}</span>
            </div>

            {/* Test Voice Button */}
            <button
              onClick={handleTestAudio}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
              title="Test chime bell and Text-to-Speech speaker"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Audio</span>
            </button>

            {/* Desktop Notifications Permission Button */}
            {typeof window !== 'undefined' && 'Notification' in window && (
              <button
                onClick={handleRequestNotificationPermission}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  notificationPermission === 'granted'
                    ? 'bg-stone-900 border-stone-800 text-emerald-400'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                }`}
                title="Enable desktop notifications when tab is backgrounded"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{notificationPermission === 'granted' ? 'Desktop Alerts Active' : 'Allow Background Alerts'}</span>
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={() => {
                if (!soundMuted) {
                  kitchenAudioAlert.stopOrderAlarm();
                  setSoundMuted(true);
                } else {
                  setSoundMuted(false);
                }
              }}
              className={`p-2 rounded-xl border text-xs transition ${
                soundMuted
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title={soundMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Logout / Switch */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/60 border border-stone-800 text-stone-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div
            onClick={() => setStatusFilter('Pending')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'Pending'
                ? 'bg-amber-500/15 border-amber-500 text-white'
                : 'bg-[#15171e] border-stone-800/80 hover:border-stone-700 text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="uppercase tracking-wider text-amber-400">Needs Acceptance</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{pendingCount}</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Pending kitchen review</p>
          </div>

          <div
            onClick={() => setStatusFilter('active')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'active'
                ? 'bg-blue-500/15 border-blue-500 text-white'
                : 'bg-[#15171e] border-stone-800/80 hover:border-stone-700 text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="uppercase tracking-wider text-blue-400">In Preparation</span>
              <Flame className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{cookingCount}</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Accepted & in wok</p>
          </div>

          <div
            onClick={() => setStatusFilter('Ready')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'Ready'
                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                : 'bg-[#15171e] border-stone-800/80 hover:border-stone-700 text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="uppercase tracking-wider text-emerald-400">Ready / Delivery</span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{readyCount}</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Ready for rider / pickup</p>
          </div>

          <div
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'all'
                ? 'bg-stone-800 border-stone-600 text-white'
                : 'bg-[#15171e] border-stone-800/80 hover:border-stone-700 text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="uppercase tracking-wider text-stone-400">Total Today</span>
              <Clock className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{orders.length}</div>
            <p className="text-[11px] text-stone-400 mt-0.5">All tickets</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-[#15171e] p-3 rounded-2xl border border-stone-800">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'active', label: 'All Active' },
              { id: 'Pending', label: `Pending (${pendingCount})` },
              { id: 'Confirmed', label: 'Accepted' },
              { id: 'Preparing', label: 'In Wok' },
              { id: 'Ready', label: 'Ready' },
              { id: 'Completed', label: 'Completed' },
              { id: 'all', label: 'All Orders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? 'bg-[#991b1b] text-white shadow-md'
                    : 'bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, phone, name..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400 font-mono">Syncing live kitchen orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[#15171e] rounded-3xl border border-stone-800/80 p-8">
            <ChefHat className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Orders in this view</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {searchQuery ? 'No tickets matched your search query.' : 'Kitchen tickets will automatically appear and ring when placed.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const isPending = order.status === 'Pending';
              const isAlarming = activeAlarmOrderId === order.orderId;

              // Calculate item total dynamically to safeguard against any legacy data mismatch
              const itemsSum = (order.items || []).reduce(
                (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
                0
              );
              const deliveryFee = order.orderType === 'delivery' ? (Number(order.deliveryFee) || 0) : 0;
              const expectedTotal = itemsSum + deliveryFee;
              const calculatedSubtotal = itemsSum > 0 ? itemsSum : (Number(order.subtotal) || 0);
              const calculatedTotal =
                order.total && order.total > 0 && !(order.total === 150 && expectedTotal > 150)
                  ? order.total
                  : expectedTotal;

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                    isAlarming
                      ? 'bg-[#1f191b] border-red-500 ring-2 ring-red-500 animate-pulse'
                      : isPending
                      ? 'bg-[#181a22] border-amber-500/60 shadow-amber-950/20'
                      : 'bg-[#15171e] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-stone-800/80 bg-[#191c25]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-amber-400">
                          #{order.orderId}
                        </span>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase animate-pulse">
                            <Bell className="w-3 h-3" />
                            <span>New</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                          order.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : order.status === 'Confirmed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : order.status === 'Preparing'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : order.status === 'Ready'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : order.status === 'Out for Delivery'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : order.status === 'Completed'
                            ? 'bg-stone-800 text-stone-400'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span className="font-semibold text-stone-300">
                        {order.orderType === 'delivery' ? '🛵 Delivery (Abbottabad)' : '🥡 Self-Pickup'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="p-5 space-y-2.5 border-b border-stone-800/80 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">Customer</span>
                        <span className="text-sm font-bold text-white block">{order.customerName || 'Guest Customer'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 transition"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${(order.customerPhone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-stone-300 font-mono">
                      <span>Phone: {order.customerPhone}</span>
                    </div>

                    <div className="flex items-start gap-1.5 text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-stone-300 text-[11px] leading-tight line-clamp-2">
                        {order.orderType === 'delivery'
                          ? order.deliveryAddress || 'Abbottabad, Pakistan'
                          : 'Counter Pickup (Mandian Jadoon Plaza)'}
                      </span>
                    </div>

                    {order.notes && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] italic">
                        "Notes: {order.notes}"
                      </div>
                    )}
                  </div>

                  {/* Itemized Order Items */}
                  <div className="p-5 flex-1 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Dishes & Wok Items ({(order.items || []).length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(order.items || []).map((item, idx) => {
                        const price = Number(item.price) || 0;
                        const qty = Math.max(1, Number(item.quantity) || 1);
                        return (
                          <div
                            key={idx}
                            className="bg-[#111318] p-2.5 rounded-xl border border-stone-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-stone-900 border border-stone-700 flex items-center justify-center font-bold text-amber-400 font-mono shrink-0">
                                {qty}
                              </span>
                              <div className="min-w-0">
                                <span className="font-semibold text-white block truncate">
                                  {item.name || 'Dish'}
                                </span>
                                {item.portionLabel && (
                                  <span className="text-[10px] text-amber-300">
                                    Portion: {item.portionLabel}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="font-mono text-stone-300 font-medium shrink-0 ml-2">
                              Rs. {(price * qty).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-3 border-t border-stone-800 space-y-1 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Subtotal:</span>
                        <span className="font-mono text-stone-200">Rs. {calculatedSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Delivery Fee:</span>
                        <span className="font-mono text-stone-200">
                          {order.orderType === 'delivery'
                            ? `Rs. ${Number(order.deliveryFee) || 150}`
                            : 'Free (Pickup)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-stone-800/60">
                        <span className="text-amber-400 uppercase tracking-wider text-[11px]">Total Bill:</span>
                        <span className="text-base font-mono text-amber-400">Rs. {calculatedTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="p-5 pt-3 bg-[#13151b] border-t border-stone-800">
                    {order.status === 'Pending' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Confirmed', order)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order & Notify Customer</span>
                      </button>
                    )}

                    {order.status === 'Confirmed' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Preparing', order)}
                        className="w-full py-3 px-4 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/60 flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-amber-300" />
                        <span>Start Cooking (Wok)</span>
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Ready', order)}
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Mark Order as Ready</span>
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <div className="flex items-center gap-2">
                        {order.orderType === 'delivery' ? (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'Out for Delivery', order)}
                            className="flex-1 py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <Bike className="w-4 h-4" />
                            <span>Out for Delivery</span>
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'Completed', order)}
                            className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Complete Pickup</span>
                          </button>
                        )}
                      </div>
                    )}

                    {order.status === 'Out for Delivery' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Completed', order)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Delivered & Paid (COD)</span>
                      </button>
                    )}

                    {order.status === 'Completed' && (
                      <div className="text-center py-2 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>Order Completed & Delivered</span>
                      </div>
                    )}
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
