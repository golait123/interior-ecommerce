import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'navy-sky' | 'black-red' | 'white-orange' | 'nature-green';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'navy-sky',
    name: 'White + Navy & Sky Blue',
    tagline: 'Deep Royal Navy, Crisp White & Sky Blue Accents',
    colors: {
      primary: '#0F2444',
      secondary: '#0284C7',
      accent: '#38BDF8',
      bg: '#FFFFFF'
    }
  },
  {
    id: 'black-red',
    name: 'Black + Crimson Red',
    tagline: 'High-Fashion Onyx Black, Crisp White & Bold Red',
    colors: {
      primary: '#0F172A',
      secondary: '#DC2626',
      accent: '#EF4444',
      bg: '#FFFFFF'
    }
  },
  {
    id: 'white-orange',
    name: 'White + Terracotta Orange',
    tagline: 'Artisanal Charcoal, Warm White & Sunset Orange',
    colors: {
      primary: '#1C1917',
      secondary: '#EA580C',
      accent: '#F97316',
      bg: '#FFFFFF'
    }
  },
  {
    id: 'nature-green',
    name: 'White + Botanical Green',
    tagline: 'Biophilic Forest Emerald, Soft Mint & Crisp White',
    colors: {
      primary: '#0C3B24',
      secondary: '#15803D',
      accent: '#10B981',
      bg: '#FFFFFF'
    }
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'navy-sky',
  setTheme: () => {},
  themeConfig: THEME_OPTIONS[0]
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('interiorg_theme') as ThemeMode;
      if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
        return saved;
      }
    } catch {}
    return 'navy-sky';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('interiorg_theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeConfig = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}
