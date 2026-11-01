import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  headingColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headerColor: string;
  footerColor: string;
  updatedAt?: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#991b1b', // Dragon Red
  secondaryColor: '#d97706', // Wok Amber
  accentColor: '#f59e0b', // Gold Accent
  bgColor: '#101216', // Website Deep Charcoal Dark
  cardBgColor: '#181a20', // Food Card Dark Surface
  textColor: '#e5e7eb', // Crisp Body Text
  headingColor: '#ffffff', // Clean Pure White Headings
  buttonColor: '#991b1b', // Brand Order Button
  buttonTextColor: '#ffffff', // Button Text
  headerColor: '#0f1115', // Sticky Navigation Bar
  footerColor: '#0c0d10', // Footer Base
};

const THEME_STORAGE_KEY = 'dragon_wok_custom_theme_v1';

interface ThemeContextType {
  theme: ThemeSettings;
  loading: boolean;
  updateTheme: (newTheme: Partial<ThemeSettings>) => Promise<void>;
  resetToDefault: () => Promise<void>;
  applyThemeToDOM: (t: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial state loads immediately from cached localStorage to prevent flash
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      const cached = localStorage.getItem(THEME_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_THEME, ...JSON.parse(cached) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_THEME;
  });

  const [loading, setLoading] = useState(true);

  // Apply CSS custom variables dynamically to document.documentElement
  const applyThemeToDOM = (t: ThemeSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primaryColor);
    root.style.setProperty('--color-secondary', t.secondaryColor);
    root.style.setProperty('--color-accent', t.accentColor);
    root.style.setProperty('--color-bg', t.bgColor);
    root.style.setProperty('--color-card-bg', t.cardBgColor);
    root.style.setProperty('--color-text', t.textColor);
    root.style.setProperty('--color-heading', t.headingColor);
    root.style.setProperty('--color-button', t.buttonColor);
    root.style.setProperty('--color-button-text', t.buttonTextColor);
    root.style.setProperty('--color-header', t.headerColor);
    root.style.setProperty('--color-footer', t.footerColor);
  };

  // Sync to DOM on initial render and whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Real-time Firestore listener for /restaurant_settings/theme
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'restaurant_settings', 'theme'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ThemeSettings>;
          const merged: ThemeSettings = {
            ...DEFAULT_THEME,
            ...data,
          };
          setTheme(merged);
          try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          applyThemeToDOM(merged);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Theme listener warning:', err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const updateTheme = async (newTheme: Partial<ThemeSettings>) => {
    const merged: ThemeSettings = {
      ...theme,
      ...newTheme,
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update local state & DOM immediately
    setTheme(merged);
    applyThemeToDOM(merged);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }

    // Persist permanently in Firestore
    const docRef = doc(db, 'restaurant_settings', 'theme');
    try {
      await setDoc(docRef, merged, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurant_settings/theme');
    }
  };

  const resetToDefault = async () => {
    const resetTheme: ThemeSettings = {
      ...DEFAULT_THEME,
      updatedAt: new Date().toISOString(),
    };

    setTheme(resetTheme);
    applyThemeToDOM(resetTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(resetTheme));
    } catch {
      // ignore
    }

    const docRef = doc(db, 'restaurant_settings', 'theme');
    try {
      await setDoc(docRef, resetTheme);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurant_settings/theme');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        updateTheme,
        resetToDefault,
        applyThemeToDOM,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
