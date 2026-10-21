import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'nature-luxe' | 'urban-modern' | 'warm-minimal' | 'dark-premium';

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
    id: 'nature-luxe',
    name: 'Nature Luxe',
    tagline: 'Default • Organic Green & Stone',
    colors: {
      primary: '#2D5A27',
      secondary: '#6B8F71',
      accent: '#C5A880',
      bg: '#F8F7F4'
    }
  },
  {
    id: 'urban-modern',
    name: 'Urban Modern',
    tagline: 'Architectural Slate & Crisp Steel',
    colors: {
      primary: '#1A1A1A',
      secondary: '#4A5568',
      accent: '#2B6CB0',
      bg: '#F7FAFC'
    }
  },
  {
    id: 'warm-minimal',
    name: 'Warm Minimal',
    tagline: 'Earthy Terracotta & Warm Beige',
    colors: {
      primary: '#8C533C',
      secondary: '#A07855',
      accent: '#C5A880',
      bg: '#F4EBE1'
    }
  },
  {
    id: 'dark-premium',
    name: 'Dark Premium',
    tagline: 'Onyx Black & Metallic Gold',
    colors: {
      primary: '#121212',
      secondary: '#1B4D3E',
      accent: '#D4AF37',
      bg: '#181818'
    }
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'nature-luxe',
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
    return 'nature-luxe';
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
