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
  Palette,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Camera,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useMenu, DynamicMenuItem } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import { uploadDishImage, deleteDishImage, validateImageFile } from '../utils/imageUpload';
import { StoredOrder } from './CustomerAccount';
import { Link } from 'react-router-dom';

const getAdminDishPhoto = (name: string, category?: string, customImage?: string, itemId?: string): string => {
  if (customImage && customImage.trim() !== '' && !customImage.includes('hero_wok_fire')) {
    return customImage;
  }
  return '/images/dishes/chicken_chowmein.jpg';
};

type AdminTab = 'overview' | 'orders' | 'menu' | 'appearance' | 'customers' | 'reports' | 'settings';

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

  // Order filters & pending confirmation state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [deliveryFeeInputs, setDeliveryFeeInputs] = useState<Record<string, string>>({});
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

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

  // Food Image Upload state for Menu Management
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [itemUploadProgress, setItemUploadProgress] = useState<Record<string, number>>({});
  const [itemUploadNotice, setItemUploadNotice] = useState<string | null>(null);

  // Modal Image state
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState(0);
  const [modalUploadError, setModalUploadError] = useState<string | null>(null);

  // Theme settings state
  const { theme, updateTheme, resetToDefault } = useTheme();
  const [themeForm, setThemeForm] = useState(theme);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  useEffect(() => {
    setThemeForm(theme);
  }, [theme]);

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

  // Analytics Metrics Calculation - Step 5 & Section 7:
  // Only confirmed/completed orders count toward sales. pending_confirmation and Cancelled orders are excluded.
  // Unconfirmed delivery charges are excluded from sales.
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const confirmedStatuses = ['Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'];

    const totalRevenue = orders
      .filter((o) => confirmedStatuses.includes(o.status))
      .reduce((sum, o) => {
        const itemSum = (o.items || []).reduce(
          (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
          0
        );
        const fee = o.orderType === 'delivery' && o.deliveryFee != null ? Number(o.deliveryFee) || 0 : 0;
        const orderTotal = o.total != null && o.total > 0 ? o.total : itemSum + fee;
        return sum + orderTotal;
      }, 0);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const todayOrdersList = orders.filter((o) => o.createdAt?.startsWith(todayStr));
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList
      .filter((o) => confirmedStatuses.includes(o.status))
      .reduce((sum, o) => {
        const itemSum = (o.items || []).reduce(
          (acc, i) => acc + (Math.max(0, Number(i.price)) || 0) * Math.max(1, Number(i.quantity) || 1),
          0
        );
        const fee = o.orderType === 'delivery' && o.deliveryFee != null ? Number(o.deliveryFee) || 0 : 0;
        const orderTotal = o.total != null && o.total > 0 ? o.total : itemSum + fee;
        return sum + orderTotal;
      }, 0);

    const pendingOrders = orders.filter((o) => ['pending_confirmation', 'Pending'].includes(o.status)).length;
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

  // Step 5: Confirm Order & Set Delivery Fee, sending ticket to kitchen
  const handleConfirmOrder = async (order: StoredOrder) => {
    try {
      setConfirmingOrderId(order.id);
      const itemsSum = (order.items || []).reduce(
        (sum, item) => sum + (Math.max(0, Number(item.price)) || 0) * Math.max(1, Number(item.quantity) || 1),
        0
      );
      const subtotal = order.subtotal && order.subtotal > 0 ? order.subtotal : itemsSum;

      const enteredFee = deliveryFeeInputs[order.id];
      const deliveryFee = order.orderType === 'delivery'
        ? (enteredFee !== undefined && enteredFee !== '' ? Math.max(0, Number(enteredFee) || 0) : 0)
        : 0;

      const recalculatedTotal = subtotal + deliveryFee;

      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Confirmed',
        deliveryFee,
        total: recalculatedTotal,
        confirmedAt: new Date().toISOString(),
        confirmedBy: user?.email || 'Admin Staff',
        updatedAt: new Date().toISOString(),
      });

      // Clear the fee input
      setDeliveryFeeInputs((prev) => {
        const copy = { ...prev };
        delete copy[order.id];
        return copy;
      });

      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'Confirmed',
                deliveryFee,
                total: recalculatedTotal,
                confirmedAt: new Date().toISOString(),
                confirmedBy: user?.email || 'Admin Staff',
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleCancelPendingOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel / reject this order?')) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'Cancelled',
        updatedAt: new Date().toISOString(),
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

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

  // Direct Image Upload Handler for Menu Cards
  const handleDirectImageUpload = async (item: DynamicMenuItem, file: File) => {
    const val = validateImageFile(file);
    if (!val.valid) {
      alert(val.error);
      return;
    }

    setUploadingItemId(item.id);
    setItemUploadProgress((prev) => ({ ...prev, [item.id]: 0 }));
    setItemUploadNotice(null);

    try {
      const downloadUrl = await uploadDishImage(file, item.id, (progress) => {
        setItemUploadProgress((prev) => ({ ...prev, [item.id]: progress }));
      });

      // Update in Firestore
      await updateMenuItem(item.id, {
        image: downloadUrl,
      });

      setItemUploadNotice(`Photo for "${item.name}" uploaded successfully!`);
      setTimeout(() => setItemUploadNotice(null), 4000);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleRemoveItemImage = async (item: DynamicMenuItem) => {
    if (!window.confirm(`Remove custom image for "${item.name}"? It will revert to the default dish photo.`)) {
      return;
    }

    try {
      if (item.image && item.image.includes('firebasestorage.googleapis.com')) {
        await deleteDishImage(item.image);
      }
      await updateMenuItem(item.id, {
        image: '',
      });
      setItemUploadNotice(`Custom photo removed for "${item.name}". Reverted to default.`);
      setTimeout(() => setItemUploadNotice(null), 4000);
    } catch (err: any) {
      alert(`Failed to remove image: ${err.message}`);
    }
  };

  // Modal Image File Selection
  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateImageFile(file);
    if (!val.valid) {
      setModalUploadError(val.error || 'Invalid file format or file too large');
      return;
    }

    setModalUploadError(null);
    setModalImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setModalImagePreview(objectUrl);
  };

  // Menu Form Handlers
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = itemFormData.image;

      // If user selected a new file in modal, upload it to Firebase Storage
      if (modalImageFile) {
        setModalUploading(true);
        setModalUploadProgress(5);
        const targetId = editingItem ? editingItem.id : itemFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        finalImageUrl = await uploadDishImage(modalImageFile, targetId, (p) => {
          setModalUploadProgress(p);
        });
        setModalUploading(false);
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: itemFormData.name,
          category: itemFormData.category,
          price: Number(itemFormData.price),
          familyPrice: itemFormData.familyPrice ? Number(itemFormData.familyPrice) : undefined,
          description: itemFormData.description,
          image: finalImageUrl,
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
          image: finalImageUrl,
          badge: itemFormData.badge || undefined,
          available: itemFormData.available,
        });
      }
      setIsNewItemModalOpen(false);
      setEditingItem(null);
      setModalImageFile(null);
      setModalImagePreview(null);
      setModalUploadProgress(0);
      setModalUploadError(null);
    } catch (err: any) {
      alert(`Error saving menu item: ${err.message}`);
    } finally {
      setModalUploading(false);
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
              to="/kitchen"
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition flex items-center gap-1.5"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen Voice Terminal</span>
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
            { id: 'menu', label: `Menu & Photos (${menuItems.length})`, icon: UtensilsCrossed },
            { id: 'appearance', label: 'Website Appearance / Theme', icon: Palette },
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
            {/* STEP 5: DEDICATED PENDING CONFIRMATION ORDERS SECTION */}
            {(() => {
              const pendingConfirmationOrders = orders.filter(
                (o) => o.status === 'pending_confirmation' || o.status === 'Pending'
              );

              return (
                <div className="bg-[#181a20] rounded-2xl border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-brand text-lg font-bold text-white">
                            Pending Confirmation Orders
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {pendingConfirmationOrders.length} Waiting
                          </span>
                        </div>
                        <p className="text-xs text-stone-400">
                          Customer orders received via WhatsApp. Inspect items, enter agreed Abbottabad delivery charges, and confirm to send directly into the Kitchen.
                        </p>
                      </div>
                    </div>
                  </div>

                  {pendingConfirmationOrders.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-semibold text-white">All caught up!</p>
                      <p className="text-stone-500">No pending orders awaiting review. All orders are confirmed or completed.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pendingConfirmationOrders.map((order) => {
                        const itemsSum = (order.items || []).reduce(
                          (sum, item) => sum + (Math.max(0, Number(item.price)) || 0) * Math.max(1, Number(item.quantity) || 1),
                          0
                        );
                        const subtotal = order.subtotal && order.subtotal > 0 ? order.subtotal : itemsSum;
                        const enteredFeeStr = deliveryFeeInputs[order.id] ?? (order.orderType === 'delivery' ? '' : '0');
                        const enteredFeeNum = order.orderType === 'delivery' ? (Number(enteredFeeStr) || 0) : 0;
                        const previewTotal = subtotal + enteredFeeNum;
                        const isConfirming = confirmingOrderId === order.id;

                        return (
                          <div
                            key={order.id}
                            className="bg-[#121316] rounded-xl border border-amber-500/30 p-4 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-500/60 transition"
                          >
                            {/* Header */}
                            <div>
                              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-base font-extrabold text-amber-400">
                                    {order.orderId}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wide">
                                    {order.orderType === 'delivery' ? '🛵 Delivery' : '🥡 Pickup'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-400">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {/* Customer & Location */}
                              <div className="pt-3 text-xs space-y-1 text-stone-300">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">{order.customerName}</span>
                                  <a
                                    href={`tel:${order.customerPhone}`}
                                    className="font-mono text-amber-400 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{order.customerPhone}</span>
                                  </a>
                                </div>

                                {order.orderType === 'delivery' && (
                                  <div className="flex items-start gap-1 text-[11px] text-stone-400 bg-stone-900/60 p-2 rounded-lg border border-stone-800 mt-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span className="text-stone-300 font-medium">{order.deliveryAddress || 'Address not specified'}</span>
                                  </div>
                                )}

                                {order.notes && (
                                  <div className="text-[11px] text-stone-400 bg-stone-900/40 p-2 rounded-lg border border-stone-800/80 italic">
                                    "{order.notes}"
                                  </div>
                                )}
                              </div>

                              {/* Items Breakdown */}
                              <div className="mt-3 pt-2 border-t border-stone-800/80 space-y-1 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                                  Ordered Items ({(order.items || []).length}):
                                </span>
                                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                  {(order.items || []).map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-stone-300 py-0.5">
                                      <span className="truncate pr-2">
                                        <span className="font-bold text-amber-400 mr-1">{it.quantity}x</span>
                                        {it.name} {it.portionLabel ? `(${it.portionLabel})` : ''}
                                      </span>
                                      <span className="font-mono text-stone-300 shrink-0 font-medium">
                                        Rs. {(it.price * it.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Financials & Delivery Fee Input */}
                            <div className="pt-3 border-t border-stone-800 space-y-2.5">
                              <div className="flex justify-between text-xs text-stone-400">
                                <span>Food Subtotal:</span>
                                <span className="font-mono font-bold text-white">Rs. {subtotal.toLocaleString()}</span>
                              </div>

                              {order.orderType === 'delivery' ? (
                                <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                                      Agreed Delivery Charges (PKR):
                                    </label>
                                    <span className="text-[10px] text-stone-400">Mandian / Abbottabad</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-stone-400">Rs.</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="10"
                                      placeholder="e.g. 150"
                                      value={deliveryFeeInputs[order.id] ?? ''}
                                      onChange={(e) =>
                                        setDeliveryFeeInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                                      }
                                      className="flex-1 bg-black/60 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {[100, 150, 200, 250, 300].map((fee) => (
                                      <button
                                        key={fee}
                                        type="button"
                                        onClick={() =>
                                          setDeliveryFeeInputs((prev) => ({ ...prev, [order.id]: String(fee) }))
                                        }
                                        className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-[10px] font-mono text-stone-300"
                                      >
                                        Rs. {fee}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between text-xs text-stone-400">
                                  <span>Delivery Fee:</span>
                                  <span className="font-mono text-emerald-400 font-semibold">Free (Pickup)</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-stone-800/80">
                                <span className="text-amber-400 uppercase tracking-wider text-xs">Total Bill:</span>
                                <span className="text-base font-mono font-extrabold text-amber-400">
                                  Rs. {previewTotal.toLocaleString()}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <a
                                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Salam ${order.customerName}, Dragon Wok Mandian here regarding your order #${order.orderId}. Food Subtotal: Rs. ${subtotal}. Delivery to ${order.deliveryAddress || 'your address'}: Rs. ${enteredFeeNum}. Total Bill: Rs. ${previewTotal}. Confirming your order now!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                  title="Chat with Customer on WhatsApp"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleCancelPendingOrder(order.id)}
                                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded-xl text-xs font-bold transition"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={isConfirming}
                                  onClick={() => handleConfirmOrder(order)}
                                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5"
                                >
                                  {isConfirming ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Confirming...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Confirm & Send to Kitchen</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

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
                <option value="pending_confirmation">Awaiting Confirmation</option>
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
                                  order.status === 'pending_confirmation'
                                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse'
                                    : order.status === 'Pending'
                                    ? 'bg-amber-950/70 border-amber-600/60 text-amber-300'
                                    : order.status === 'Confirmed'
                                    ? 'bg-blue-950/70 border-blue-600/60 text-blue-300'
                                    : order.status === 'Preparing'
                                    ? 'bg-purple-950/70 border-purple-600/60 text-purple-300'
                                    : order.status === 'Completed'
                                    ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-950/70 border-rose-600/60 text-rose-300'
                                    : 'bg-stone-900 border-stone-700 text-stone-200'
                                }`}
                              >
                                {order.status === 'pending_confirmation' ? 'Awaiting Confirmation' : order.status}
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
                                <option value="pending_confirmation">Awaiting Confirmation</option>
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
                    <div>Food Subtotal: Rs. {(selectedOrder.subtotal || 0).toLocaleString()}</div>
                    <div>
                      Delivery Fee: {selectedOrder.orderType === 'delivery'
                        ? selectedOrder.deliveryFee != null
                          ? `Rs. ${selectedOrder.deliveryFee}`
                          : 'To be confirmed on WhatsApp'
                        : 'Free (Pickup)'}
                    </div>
                    <div className="text-sm font-bold text-amber-400">
                      Total: Rs. {(selectedOrder.total || selectedOrder.subtotal || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Salam ${selectedOrder.customerName}, Dragon Wok Mandian update on Order #${selectedOrder.orderId}: Status is now ${selectedOrder.status}.`
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
                      image: '',
                      available: true,
                      badge: '',
                    });
                    setModalImageFile(null);
                    setModalImagePreview(null);
                    setModalUploadError(null);
                    setIsNewItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Menu Upload Notification */}
            {itemUploadNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{itemUploadNotice}</span>
              </div>
            )}

            {/* Menu Items Grid with Real-Time Photos and Upload Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => {
                const isCustomPhoto = Boolean(item.image && (item.image.includes('firebasestorage.googleapis.com') || item.image.startsWith('http')));
                const photoSrc = getAdminDishPhoto(item.name, item.category, item.image, item.id);
                const isUploading = uploadingItemId === item.id;
                const progress = itemUploadProgress[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#181a20] rounded-xl border ${
                      item.available ? 'border-stone-800' : 'border-stone-800/40 opacity-60'
                    } p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg hover:border-stone-700 transition`}
                  >
                    <div>
                      {/* Visual Photo Header on Card */}
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-stone-900 mb-3 border border-stone-800/80 group">
                        <img
                          src={photoSrc}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('chicken_chowmein.jpg')) {
                              target.src = '/images/dishes/chicken_chowmein.jpg';
                            }
                          }}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Photo Status Pill */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {isCustomPhoto ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-900/90 text-emerald-200 border border-emerald-700/80 shadow">
                              Custom Photo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-900/90 text-stone-400 border border-stone-700/80 shadow">
                              System Photo
                            </span>
                          )}
                        </div>

                        {/* Upload overlay / progress if uploading */}
                        {isUploading ? (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center">
                            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mb-1.5" />
                            <span className="text-[11px] font-bold text-white">Uploading {progress}%</span>
                            <div className="w-24 h-1.5 bg-stone-800 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 transition-all duration-200"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label
                              className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg transition"
                              title="Change or upload new photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleDirectImageUpload(item, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {isCustomPhoto && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemImage(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg transition"
                                title="Remove custom photo and revert to default"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Reset</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

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
                              image: item.image || '',
                              available: item.available,
                              badge: item.badge || '',
                            });
                            setModalImageFile(null);
                            setModalImagePreview(item.image || getAdminDishPhoto(item.name, item.category, item.image, item.id));
                            setModalUploadError(null);
                            setIsNewItemModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white"
                          title="Edit Dish & Image"
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
                );
              })}
            </div>

            {/* Add / Edit Dish Modal with Complete Image Management */}
            {isNewItemModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
                onClick={() => !modalUploading && setIsNewItemModalOpen(false)}
              >
                <div
                  className="relative max-w-lg w-full bg-[#181a20] rounded-2xl border border-stone-800 p-6 text-left shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={modalUploading}
                    onClick={() => setIsNewItemModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white disabled:opacity-30"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-serif-brand text-lg font-bold text-white mb-4">
                    {editingItem ? 'Edit Menu Dish & Image' : 'Add New Menu Dish & Image'}
                  </h3>

                  <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                    {/* Food Image Upload Management Section */}
                    <div className="p-3.5 bg-stone-900/90 rounded-xl border border-stone-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-stone-300 font-bold text-xs flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          <span>Food Photograph / Image</span>
                        </label>
                        {modalImagePreview && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            {modalImageFile ? 'New file selected' : 'Current photo'}
                          </span>
                        )}
                      </div>

                      {/* Image Preview Window */}
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center">
                        {modalImagePreview ? (
                          <img
                            src={modalImagePreview}
                            alt="Food preview"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-500 py-6">
                            <ImageIcon className="w-8 h-8 mb-1 text-stone-600" />
                            <span className="text-[11px]">No image uploaded yet</span>
                          </div>
                        )}

                        {/* Uploading Status Overlay */}
                        {modalUploading && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                            <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-2" />
                            <span className="text-xs font-bold text-white">
                              Saving & Uploading to Firebase Storage... {modalUploadProgress}%
                            </span>
                            <div className="w-full max-w-xs h-1.5 bg-stone-800 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 transition-all duration-150"
                                style={{ width: `${modalUploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {modalUploadError && (
                        <div className="text-[11px] text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-800/80">
                          {modalUploadError}
                        </div>
                      )}

                      {/* Upload & Remove Controls */}
                      <div className="flex items-center gap-2 pt-1">
                        <label className="flex-1 cursor-pointer py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{modalImagePreview ? 'Change / Replace Image' : 'Upload Food Image'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleModalFileSelect}
                          />
                        </label>

                        {modalImagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setModalImageFile(null);
                              setModalImagePreview(null);
                              setItemFormData((prev) => ({ ...prev, image: '' }));
                            }}
                            className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-rose-950 hover:text-rose-300 text-stone-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] text-stone-500">
                        Supports JPG, PNG, WEBP (Max 5 MB). Uploads securely and permanently to Firebase Storage.
                      </p>
                    </div>

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
                      disabled={modalUploading}
                      className="w-full py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {modalUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading & Saving Dish...</span>
                        </>
                      ) : (
                        <span>Save Menu Item</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: WEBSITE APPEARANCE / THEME SETTINGS */}
        {activeTab === 'appearance' && (
          <div className="space-y-8">
            {/* Top Overview Header */}
            <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-white">
                      Website Appearance / Theme Settings
                    </h2>
                  </div>
                  <p className="text-xs text-stone-400 max-w-2xl">
                    Customize your brand colors, background, card surfaces, and buttons. Changes save permanently in Firestore and automatically update the live ordering website for all customers.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Reset all website colors back to official Dragon Wok defaults?')) {
                        await resetToDefault();
                        setThemeNotice('Colors reset to official Dragon Wok defaults!');
                        setTimeout(() => setThemeNotice(null), 4000);
                      }
                    }}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>

                  <button
                    type="button"
                    disabled={savingTheme}
                    onClick={async () => {
                      setSavingTheme(true);
                      setThemeNotice(null);
                      try {
                        await updateTheme(themeForm);
                        setThemeNotice('Theme colors saved permanently and applied across the entire website!');
                        setTimeout(() => setThemeNotice(null), 5000);
                      } catch (err: any) {
                        alert(`Failed to save theme: ${err.message}`);
                      } finally {
                        setSavingTheme(false);
                      }
                    }}
                    className="px-5 py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/60 flex items-center gap-2"
                  >
                    {savingTheme ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Theme Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {themeNotice && (
                <div className="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{themeNotice}</span>
                </div>
              )}
            </div>

            {/* Grid: Color Pickers (Left) & Real-time Live Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Color Configuration Controls (7 cols on lg) */}
              <div className="lg:col-span-7 bg-[#181a20] rounded-2xl border border-stone-800 p-6 space-y-6">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-stone-800 pb-3">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Color Controls (Color Picker & HEX Input)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'primaryColor', label: 'Primary Brand Color', desc: 'Main brand elements & badges' },
                    { key: 'secondaryColor', label: 'Secondary Color', desc: 'Wok accent and highlights' },
                    { key: 'accentColor', label: 'Accent Color', desc: 'Price tags, stars & special alerts' },
                    { key: 'bgColor', label: 'Website Background Color', desc: 'Main customer page backdrop' },
                    { key: 'cardBgColor', label: 'Menu Card Background Color', desc: 'Food item surface cards' },
                    { key: 'textColor', label: 'Text Color', desc: 'Body paragraphs & ingredients' },
                    { key: 'headingColor', label: 'Heading Color', desc: 'Dish titles & main section headers' },
                    { key: 'buttonColor', label: 'Button Color', desc: 'Add to Cart & Checkout buttons' },
                    { key: 'buttonTextColor', label: 'Button Text Color', desc: 'Text inside primary buttons' },
                    { key: 'headerColor', label: 'Header & Navigation Color', desc: 'Sticky top navbar background' },
                    { key: 'footerColor', label: 'Footer Color', desc: 'Customer website footer bar' },
                  ].map((field) => {
                    const colorValue = (themeForm as any)[field.key] || '#000000';
                    return (
                      <div
                        key={field.key}
                        className="p-3.5 rounded-xl bg-stone-900 border border-stone-800/80 hover:border-stone-700 transition"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white block">
                            {field.label}
                          </label>
                          <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">
                            {colorValue}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 mb-2.5">{field.desc}</p>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorValue}
                            onChange={(e) => {
                              const updated = { ...themeForm, [field.key]: e.target.value };
                              setThemeForm(updated);
                            }}
                            className="w-10 h-9 p-0.5 rounded bg-stone-800 border border-stone-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorValue}
                            onChange={(e) => {
                              const updated = { ...themeForm, [field.key]: e.target.value };
                              setThemeForm(updated);
                            }}
                            className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                            placeholder="#HEX"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Interactive Live Preview Box (5 cols on lg) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-white text-sm">Live Preview</h3>
                    </div>
                    <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                      Real-Time Simulation
                    </span>
                  </div>

                  {/* Simulated Customer Device Frame */}
                  <div
                    className="rounded-xl border border-stone-700 overflow-hidden shadow-2xl transition-colors duration-300"
                    style={{ backgroundColor: themeForm.bgColor }}
                  >
                    {/* Simulated Header */}
                    <div
                      className="px-4 py-3 flex items-center justify-between border-b border-white/10 transition-colors duration-300"
                      style={{ backgroundColor: themeForm.headerColor }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src="/images/dragon_wok_logo.jpg"
                          alt="Logo"
                          className="w-6 h-6 rounded-full object-cover border border-white/20"
                        />
                        <span className="font-serif-brand text-xs font-bold tracking-wider" style={{ color: themeForm.headingColor }}>
                          DRAGON WOK
                        </span>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                        style={{ backgroundColor: themeForm.buttonColor, color: themeForm.buttonTextColor }}
                      >
                        Cart (2)
                      </span>
                    </div>

                    {/* Simulated Main Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: themeForm.secondaryColor }}>
                          Popular Chinese Wok
                        </span>
                        <h4 className="text-sm font-bold leading-tight" style={{ color: themeForm.headingColor }}>
                          Dragon Wok Specials
                        </h4>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: themeForm.textColor }}>
                          Wok-tossed fresh dishes with authentic Chinese seasonings.
                        </p>
                      </div>

                      {/* Simulated Food Menu Card */}
                      <div
                        className="rounded-lg border border-white/10 overflow-hidden shadow-md transition-colors duration-300"
                        style={{ backgroundColor: themeForm.cardBgColor }}
                      >
                        <div className="aspect-[16/9] bg-stone-800 overflow-hidden relative">
                          <img
                            src="/images/dishes/chicken_chowmein.jpg"
                            alt="Sample Dish"
                            className="w-full h-full object-cover"
                          />
                          <span
                            className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded uppercase"
                            style={{ backgroundColor: themeForm.primaryColor, color: '#ffffff' }}
                          >
                            Signature
                          </span>
                        </div>
                        <div className="p-3">
                          <h5 className="font-bold text-xs mb-1" style={{ color: themeForm.headingColor }}>
                            Special Chicken Chowmein
                          </h5>
                          <p className="text-[10px] line-clamp-1 mb-2" style={{ color: themeForm.textColor }}>
                            Hand-pulled noodles with tender poultry and garden vegetables.
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div>
                              <span className="text-[9px] block text-stone-400">Price</span>
                              <span className="text-xs font-extrabold" style={{ color: themeForm.accentColor }}>
                                Rs. 849
                              </span>
                            </div>
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded text-[10px] font-bold uppercase shadow transition"
                              style={{ backgroundColor: themeForm.buttonColor, color: themeForm.buttonTextColor }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Footer */}
                    <div
                      className="px-4 py-2.5 text-[9px] text-center border-t border-white/10 transition-colors duration-300"
                      style={{ backgroundColor: themeForm.footerColor, color: themeForm.textColor }}
                    >
                      Dragon Wok Abbottabad • Mandian Jadoon Plaza Phase 1
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
