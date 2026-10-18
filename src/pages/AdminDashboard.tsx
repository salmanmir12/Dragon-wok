import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  LogOut,
  ArrowLeft,
  X,
  ChefHat,
  ShieldCheck,
  Calendar,
  Eye,
  Check,
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useMenu, DynamicMenuItem } from '../context/MenuContext';
import { StoredOrder } from './CustomerAccount';
import { Link } from 'react-router-dom';

type AdminTab = 'overview' | 'orders' | 'menu' | 'customers' | 'reports' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, logout, setAuthModalOpen } = useAuth();
  const {
    menuItems,
    settings,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    updateSettings,
    seedDefaultMenu,
  } = useMenu();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);

  // Menu management state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
  const [editingItem, setEditingItem] = useState<DynamicMenuItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'Noodles',
    price: 0,
    familyPrice: 0,
    description: '',
    image: '/images/dish_chowmein.jpg',
    available: true,
    badge: '',
  });

  // Settings form state
  const [announcement, setAnnouncement] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Reports date range filter
  const [reportRange, setReportRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Sync settings into form
  useEffect(() => {
    if (settings) {
      setAnnouncement(settings.announcement || '');
      setDeliveryFee(settings.deliveryFee || 150);
      setOpenOverride(settings.isOpenOverride);
    }
  }, [settings]);

  // Real-time listener for orders
  useEffect(() => {
    if (!user || !isAdmin) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const q = query(collection(db, 'orders'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: StoredOrder[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<StoredOrder, 'id'>) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
      setLoadingOrders(false);
    }, (err) => {
      console.warn('Admin orders error:', err.message);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [user, isAdmin]);

  // Load customers & staff lists
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Load customers
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: any[] = [];
      snapshot.forEach((docSnap) => uList.push({ id: docSnap.id, ...docSnap.data() }));
      setCustomers(uList);
    }, (err) => console.warn('Customer load err:', err));

    // Load staff
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const sList: any[] = [];
      snapshot.forEach((docSnap) => sList.push({ id: docSnap.id, ...docSnap.data() }));
      setStaffList(sList);
    }, (err) => console.warn('Staff load err:', err));

    return () => {
      unsubUsers();
      unsubStaff();
    };
  }, [user, isAdmin]);

  // Analytics Metrics Calculation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const todayOrdersList = orders.filter((o) => o.createdAt?.startsWith(todayStr));
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const preparingOrders = orders.filter((o) => ['Confirmed', 'Preparing'].includes(o.status)).length;
    const outForDelivery = orders.filter((o) => o.status === 'Out for Delivery').length;

    return {
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      preparingOrders,
      outForDelivery,
    };
  }, [orders]);

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: StoredOrder['status']) => {
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        status,
        updatedAt: new Date().toISOString(),
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Menu Form Handlers
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: itemFormData.name,
          category: itemFormData.category,
          price: Number(itemFormData.price),
          familyPrice: itemFormData.familyPrice ? Number(itemFormData.familyPrice) : undefined,
          description: itemFormData.description,
          image: itemFormData.image,
          badge: itemFormData.badge || undefined,
          available: itemFormData.available,
        });
      } else {
        await addMenuItem({
          name: itemFormData.name,
          category: itemFormData.category,
          price: Number(itemFormData.price),
          familyPrice: itemFormData.familyPrice ? Number(itemFormData.familyPrice) : undefined,
          description: itemFormData.description,
          image: itemFormData.image,
          badge: itemFormData.badge || undefined,
          available: itemFormData.available,
        });
      }
      setIsNewItemModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(`Error saving menu item: ${err.message}`);
    }
  };

  // Staff creation
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim()) return;
    try {
      const staffDocId = newStaffEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'staff', staffDocId), {
        email: newStaffEmail.trim().toLowerCase(),
        name: newStaffName.trim() || 'Staff Member',
        role: 'staff',
        createdAt: new Date().toISOString(),
      });
      setNewStaffEmail('');
      setNewStaffName('');
      setSettingsNotice('Staff member authorized successfully!');
    } catch (err: any) {
      setSettingsNotice(`Failed to add staff: ${err.message}`);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!window.confirm('Revoke staff access for this user?')) return;
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (err: any) {
      alert(`Failed to revoke staff: ${err.message}`);
    }
  };

  // Auth Guard
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#121316] text-white pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 p-8 text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-[#b91c1c] mx-auto mb-4" />
          <h2 className="font-serif-brand text-2xl font-bold mb-2">Admin Portal Restricted</h2>
          <p className="text-stone-400 text-sm mb-6">
            This dashboard is securely restricted to authorized administrators of Dragon Wok.
          </p>
          {!user ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition shadow-lg"
            >
              Sign In as Administrator
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs mb-4 text-left space-y-2">
              <p className="font-bold">Access Denied for: {user.email}</p>
              <p>
                To authorize the first administrator, sign in with the official owner account (<strong>dragonwok74@gmail.com</strong>) which is automatically configured with full admin permissions.
              </p>
            </div>
          )}
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline mt-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dragon Wok Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    if (!matchesSearch) return false;
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Filtered menu items
  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#121316] text-[#e5e7eb] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-stone-800 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white">
                  Dragon Wok Admin
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#991b1b]/30 text-rose-300 border border-[#b91c1c]/50 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Operating in Asia/Karachi (PKT) • Logged in as {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/staff"
              className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 transition flex items-center gap-1.5"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen Staff View</span>
            </Link>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-rose-950/50 hover:text-rose-400 border border-stone-800 text-xs font-semibold text-stone-300 transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar border-b border-stone-800/80">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: BarChart3 },
            { id: 'orders', label: `Live Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'menu', label: `Menu Catalog (${menuItems.length})`, icon: UtensilsCrossed },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'reports', label: 'Sales Reports', icon: TrendingUp },
            { id: 'settings', label: 'Restaurant Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-[#991b1b] text-white shadow-md'
                    : 'bg-stone-900/70 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Today's Revenue */}
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Today's Sales</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-serif-brand text-white">
                  Rs. {metrics.todayRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  From {metrics.todayOrders} orders placed today
                </p>
              </div>

              {/* Total Revenue */}
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Total Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-serif-brand text-amber-400">
                  Rs. {metrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Across all {metrics.totalOrders} recorded orders
                </p>
              </div>

              {/* Pending Orders */}
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Pending Action</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-serif-brand text-amber-300">
                  {metrics.pendingOrders}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Orders waiting for kitchen acceptance
                </p>
              </div>

              {/* In Preparation / On the Way */}
              <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">In Progress</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                    <ChefHat className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-serif-brand text-purple-300">
                  {metrics.preparingOrders + metrics.outForDelivery}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  {metrics.preparingOrders} cooking • {metrics.outForDelivery} out for delivery
                </p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-brand text-lg font-bold text-white">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-stone-500 py-8 text-center">No orders received yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2.5">Order ID</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Type</th>
                        <th className="py-2.5">Total (PKR)</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-900/50">
                          <td className="py-3 font-mono font-bold text-amber-400">{o.orderId}</td>
                          <td className="py-3 text-white">
                            <div>{o.customerName}</div>
                            <div className="text-[11px] text-stone-500">{o.customerPhone}</div>
                          </td>
                          <td className="py-3 capitalize text-stone-300">{o.orderType}</td>
                          <td className="py-3 font-bold text-white">Rs. {o.total?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 border border-stone-700 text-amber-300">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setActiveTab('orders');
                              }}
                              className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#181a20] border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#181a20] border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
              {loadingOrders ? (
                <div className="p-16 text-center text-stone-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
                  <p>Loading live order stream...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                  <p>No orders found matching the filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-900/80 border-b border-stone-800 text-stone-400 font-semibold">
                        <th className="p-4">Order ID & Date</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Current Status</th>
                        <th className="p-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {filteredOrders.map((order) => {
                        const dateStr = new Date(order.createdAt).toLocaleString('en-US', {
                          timeZone: 'Asia/Karachi',
                          dateStyle: 'short',
                          timeStyle: 'short',
                        });

                        return (
                          <tr key={order.id} className="hover:bg-stone-900/40">
                            <td className="p-4">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="font-mono font-bold text-amber-400 hover:underline block text-left"
                              >
                                {order.orderId}
                              </button>
                              <span className="text-[11px] text-stone-500">{dateStr}</span>
                            </td>

                            <td className="p-4 text-white">
                              <div className="font-bold">{order.customerName}</div>
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="text-[11px] text-amber-400 hover:underline block"
                              >
                                {order.customerPhone}
                              </a>
                              <span className="text-[10px] text-stone-400 uppercase">
                                {order.orderType === 'delivery' ? '🛵 Delivery' : '🥡 Pickup'}
                              </span>
                            </td>

                            <td className="p-4 text-stone-300 max-w-xs">
                              <div className="line-clamp-2">
                                {(order.items || []).map((i) => `${i.quantity || 1}x ${i.name || 'Dish'}`).join(', ') || 'No items listed'}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-white text-sm">
                                Rs. {(order.total ?? order.subtotal ?? 0).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-stone-500 uppercase">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Counter'}
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  order.status === 'Pending'
                                    ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 animate-pulse'
                                    : order.status === 'Preparing'
                                    ? 'bg-purple-950/70 border-purple-600/60 text-purple-300'
                                    : order.status === 'Completed'
                                    ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-950/70 border-rose-600/60 text-rose-300'
                                    : 'bg-stone-900 border-stone-700 text-stone-200'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value as StoredOrder['status'])
                                }
                                className="px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready">Ready</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Single Order Details Modal */}
            {selectedOrder && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
                onClick={() => setSelectedOrder(null)}
              >
                <div
                  className="relative max-w-lg w-full bg-[#181a20] rounded-2xl border border-stone-800 p-6 text-left shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-lg font-bold text-amber-400">
                      {selectedOrder.orderId}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({selectedOrder.status})
                    </span>
                  </div>

                  <div className="py-3 border-y border-stone-800 text-xs space-y-2 mb-4">
                    <div><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                    <div><strong>Fulfillment:</strong> {selectedOrder.orderType.toUpperCase()}</div>
                    {selectedOrder.deliveryAddress && (
                      <div><strong>Address:</strong> {selectedOrder.deliveryAddress}</div>
                    )}
                    {selectedOrder.notes && (
                      <div><strong>Notes:</strong> {selectedOrder.notes}</div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-stone-800/50">
                        <span>{item.quantity}x {item.name} {item.portionLabel && `(${item.portionLabel})`}</span>
                        <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right text-xs space-y-1 mb-6">
                    <div>Subtotal: Rs. {selectedOrder.subtotal?.toLocaleString()}</div>
                    <div>Delivery Fee: Rs. {selectedOrder.deliveryFee}</div>
                    <div className="text-sm font-bold text-amber-400">Total: Rs. {selectedOrder.total?.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`https://wa.me/923100968734?text=${encodeURIComponent(
                        `Dragon Wok Order Update: ${selectedOrder.orderId} for ${selectedOrder.customerName}. Current Status: ${selectedOrder.status}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DYNAMIC MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Top Bar with Add and Seed Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="px-3.5 py-2 bg-[#181a20] border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 bg-[#181a20] border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (window.confirm('Seed all default Dragon Wok official menu items to Firestore?')) {
                      const count = await seedDefaultMenu();
                      alert(`Successfully initialized ${count} menu dishes in Firestore!`);
                    }
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sync/Seed Default Menu</span>
                </button>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemFormData({
                      name: '',
                      category: 'Noodles',
                      price: 0,
                      familyPrice: 0,
                      description: '',
                      image: '/images/dish_chowmein.jpg',
                      available: true,
                      badge: '',
                    });
                    setIsNewItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#181a20] rounded-xl border ${
                    item.available ? 'border-stone-800' : 'border-stone-800/40 opacity-60'
                  } p-5 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                        {item.category}
                      </span>

                      <button
                        onClick={() => toggleAvailability(item.id, item.available)}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded transition ${
                          item.available
                            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                            : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                        }`}
                      >
                        {item.available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>

                    <h4 className="font-bold text-white text-base mb-1">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-stone-400 line-clamp-2 mb-3">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-amber-400 font-serif-brand">
                        Rs. {item.price.toLocaleString()}
                      </div>
                      {item.familyPrice && (
                        <div className="text-[10px] text-stone-400">
                          Family: Rs. {item.familyPrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setItemFormData({
                            name: item.name,
                            category: item.category,
                            price: item.price,
                            familyPrice: item.familyPrice || 0,
                            description: item.description || '',
                            image: item.image || '/images/dish_chowmein.jpg',
                            available: item.available,
                            badge: item.badge || '',
                          });
                          setIsNewItemModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete "${item.name}" from the menu?`)) {
                            await deleteMenuItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded bg-stone-900 hover:bg-rose-950 text-stone-300 hover:text-rose-400"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Dish Modal */}
            {isNewItemModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
                onClick={() => setIsNewItemModalOpen(false)}
              >
                <div
                  className="relative max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 p-6 text-left shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsNewItemModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-serif-brand text-lg font-bold text-white mb-4">
                    {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
                  </h3>

                  <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-medium mb-1">Dish Name</label>
                      <input
                        type="text"
                        required
                        value={itemFormData.name}
                        onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                        placeholder="e.g. Dragon Special Chowmein"
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">Category</label>
                        <select
                          value={itemFormData.category}
                          onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                        >
                          <option value="Starters">Starters</option>
                          <option value="Soups">Soups</option>
                          <option value="Chicken">Chicken</option>
                          <option value="Beef">Beef</option>
                          <option value="Fish">Fish</option>
                          <option value="Noodles">Noodles</option>
                          <option value="Momos">Momos</option>
                          <option value="Szechwan Hot Pot">Szechwan Hot Pot</option>
                          <option value="Drinks">Drinks</option>
                          <option value="Deals">Deals</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-300 font-medium mb-1">Price (PKR)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={itemFormData.price}
                          onChange={(e) => setItemFormData({ ...itemFormData, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-medium mb-1">Family Price (Optional)</label>
                        <input
                          type="number"
                          min={0}
                          value={itemFormData.familyPrice}
                          onChange={(e) => setItemFormData({ ...itemFormData, familyPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-300 font-medium mb-1">Badge (e.g. Popular)</label>
                        <input
                          type="text"
                          value={itemFormData.badge}
                          onChange={(e) => setItemFormData({ ...itemFormData, badge: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-medium mb-1">Description / Notes</label>
                      <textarea
                        rows={2}
                        value={itemFormData.description}
                        onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="avail-check"
                        checked={itemFormData.available}
                        onChange={(e) => setItemFormData({ ...itemFormData, available: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="avail-check" className="text-stone-300">Available for ordering</label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md mt-4"
                    >
                      Save Menu Item
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-xl">
            <h3 className="font-serif-brand text-lg font-bold text-white mb-2">
              Registered Customers ({customers.length})
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Customers who have registered for Dragon Wok ordering accounts.
            </p>

            {customers.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No registered customers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="py-2.5">Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5">Saved Addresses</th>
                      <th className="py-2.5">Member Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-900/50">
                        <td className="py-3 font-bold text-white">{c.name || 'Anonymous'}</td>
                        <td className="py-3 text-stone-300">{c.email}</td>
                        <td className="py-3 text-amber-400 font-mono">{c.phone || '—'}</td>
                        <td className="py-3 text-stone-400">{c.addresses?.length || 0} saved</td>
                        <td className="py-3 text-stone-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SALES REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif-brand text-lg font-bold text-white">Sales & Order Reports</h3>
                  <p className="text-xs text-stone-400">Financial summary across orders placed on Dragon Wok.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['today', '7days', '30days', 'all'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportRange(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        reportRange === r
                          ? 'bg-[#991b1b] text-white'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {r === '7days' ? 'Last 7 Days' : r === '30days' ? 'Last 30 Days' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
                <div>
                  <span className="text-xs text-stone-400">Total Valid Orders</span>
                  <div className="text-2xl font-bold font-serif-brand text-white mt-1">
                    {orders.filter((o) => o.status !== 'Cancelled').length}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-stone-400">Gross Sales</span>
                  <div className="text-2xl font-bold font-serif-brand text-amber-400 mt-1">
                    Rs. {metrics.totalRevenue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-stone-400">Average Order Value</span>
                  <div className="text-2xl font-bold font-serif-brand text-emerald-400 mt-1">
                    Rs. {orders.length ? Math.round(metrics.totalRevenue / orders.length).toLocaleString() : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RESTAURANT SETTINGS & STAFF */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Restaurant Operational Controls */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 sm:p-8">
              <h3 className="font-serif-brand text-lg font-bold text-white mb-2">
                Operational Settings
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Configure opening hours override, delivery fee, and customer announcements.
              </p>

              {settingsNotice && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                  {settingsNotice}
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Store Open Status (Override)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenOverride(null)}
                      className={`py-2 rounded-lg border font-semibold ${
                        openOverride === null
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      Auto (12PM-2AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenOverride(true)}
                      className={`py-2 rounded-lg border font-semibold ${
                        openOverride === true
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      Force Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenOverride(false)}
                      className={`py-2 rounded-lg border font-semibold ${
                        openOverride === false
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      Force Closed
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Standard Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Announcement Banner
                  </label>
                  <input
                    type="text"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="e.g. Fresh wok dishes tossed to order • Delivery across Abbottabad"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await updateSettings({
                        isOpenOverride: openOverride,
                        deliveryFee,
                        announcement,
                      });
                      setSettingsNotice('Settings saved successfully!');
                    } catch (err: any) {
                      setSettingsNotice(`Error: ${err.message}`);
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  className="w-full py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Apply Settings'}
                </button>
              </div>
            </div>

            {/* Staff Accounts Management */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 sm:p-8">
              <h3 className="font-serif-brand text-lg font-bold text-white mb-2">
                Staff Authorization
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Grant kitchen staff access to the `/staff` order queue. Staff members cannot access the admin panel or edit prices.
              </p>

              <div className="space-y-3 mb-6">
                {staffList.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No additional staff members authorized yet.</p>
                ) : (
                  staffList.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{st.name || 'Staff'}</div>
                        <div className="text-stone-400">{st.email}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveStaff(st.id)}
                        className="text-stone-500 hover:text-rose-400 p-1"
                        title="Revoke Staff Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Staff Member Form */}
              <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Staff Member Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Tariq Kitchen Lead"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Staff Member Email</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authorize Staff Member</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
