import React, { useState } from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemeMode } from '../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-switcher-wrapper">
      {/* Floating Pill Trigger */}
      <button
        type="button"
        className="theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Visual Theme"
        aria-label="Theme Switcher"
      >
        <div className="theme-indicator-dots">
          <span style={{ backgroundColor: themeConfig.colors.primary }} />
          <span style={{ backgroundColor: themeConfig.colors.secondary }} />
          <span style={{ backgroundColor: themeConfig.colors.accent }} />
        </div>
        <span className="theme-name-label">{themeConfig.name}</span>
        <Palette size={16} className="theme-palette-icon" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="theme-switcher-modal">
          <div className="theme-modal-header">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              <h4 className="theme-modal-title">Select Aesthetic Theme</h4>
            </div>
            <button
              type="button"
              className="theme-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme menu"
            >
              <X size={16} />
            </button>
          </div>
          <p className="theme-modal-desc">
            Customize the InteriorG look across Wallpapers, 360° Studio, and Nursery.
          </p>

          <div className="theme-options-grid">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`theme-card ${isSelected ? 'theme-card-selected' : ''}`}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="theme-card-preview">
                    <div
                      className="theme-color-chip"
                      style={{ backgroundColor: opt.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="theme-color-chip"
                      style={{ backgroundColor: opt.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="theme-color-chip"
                      style={{ backgroundColor: opt.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="theme-color-chip"
                      style={{ backgroundColor: opt.colors.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                      title="Canvas"
                    />
                  </div>
                  <div className="theme-card-info">
                    <div className="flex items-center justify-between">
                      <span className="theme-card-name">{opt.name}</span>
                      {isSelected && <Check size={14} className="text-success" />}
                    </div>
                    <span className="theme-card-tagline">{opt.tagline}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
