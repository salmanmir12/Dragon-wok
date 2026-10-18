import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

export type UserRole = 'admin' | 'staff' | 'customer';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  favorites: string[];
  role?: UserRole;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalView: 'login' | 'register' | 'forgot-password';
  setAuthModalView: (view: 'login' | 'register' | 'forgot-password') => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavorite: (itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Owner email from runtime metadata
const ADMIN_EMAILS = ['dragonwok74@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setRole('customer');
        setLoading(false);
        return;
      }

      // 1. Check if user is in Admins collection or has verified owner email
      const isOwnerEmail = currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
      let userRole: UserRole = 'customer';

      try {
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminSnap = await getDoc(adminDocRef);

        if (adminSnap.exists() || isOwnerEmail) {
          userRole = 'admin';
          // Ensure admin record exists in Firestore
          if (!adminSnap.exists()) {
            await setDoc(adminDocRef, {
              email: currentUser.email || '',
              role: 'admin',
              createdAt: new Date().toISOString(),
            }, { merge: true }).catch(() => {});
          }
        } else {
          // Check Staff collection
          const staffDocRef = doc(db, 'staff', currentUser.uid);
          const staffSnap = await getDoc(staffDocRef);
          if (staffSnap.exists()) {
            userRole = 'staff';
          }
        }
      } catch (err) {
        console.warn('Could not determine elevated role from DB, falling back to email check', err);
        if (isOwnerEmail) {
          userRole = 'admin';
        }
      }

      setRole(userRole);

      // 2. Fetch or initialize User Profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            userId: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Customer',
            email: currentUser.email || '',
            phone: '',
            addresses: [],
            favorites: [],
            role: userRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile).catch(() => {});
          setProfile(newProfile);
        }
      } catch (err) {
        console.warn('Error loading user profile:', err);
      }

      // Attach real-time listener to user profile
      const unsubProfile = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      }, (err) => {
        console.warn('Profile listener snapshot error:', err);
      });

      setLoading(false);
      return () => unsubProfile();
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    setAuthModalOpen(false);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateFirebaseProfile(cred.user, { displayName: name });
      const userDocRef = doc(db, 'users', cred.user.uid);
      const isOwner = ADMIN_EMAILS.includes(email.trim().toLowerCase());
      const newProfile: UserProfile = {
        userId: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        addresses: [],
        favorites: [],
        role: isOwner ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
    }
    setAuthModalOpen(false);
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userDocRef = doc(db, 'users', result.user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const isOwner = result.user.email && ADMIN_EMAILS.includes(result.user.email.toLowerCase());
          const newProfile: UserProfile = {
            userId: result.user.uid,
            name: result.user.displayName || 'Google User',
            email: result.user.email || '',
            phone: '',
            addresses: [],
            favorites: [],
            role: isOwner ? 'admin' : 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile).catch(() => {});
          setProfile(newProfile);
        }
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setRole('customer');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      setProfile((prev) => prev ? { ...prev, ...data } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    if (!user || !profile) {
      setAuthModalOpen(true);
      return;
    }
    const currentFavs = profile.favorites || [];
    const updated = currentFavs.includes(itemId)
      ? currentFavs.filter((id) => id !== itemId)
      : [...currentFavs, itemId];
    await updateCustomerProfile({ favorites: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === 'admin',
        isStaff: role === 'staff' || role === 'admin',
        loading,
        authModalOpen,
        setAuthModalOpen,
        authModalView,
        setAuthModalView,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        updateCustomerProfile,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
