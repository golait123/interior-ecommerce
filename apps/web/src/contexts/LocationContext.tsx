import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  badgeColor?: 'navy' | 'green' | 'yellow' | 'orange' | 'purple';
  iconType: 'upi' | 'card' | 'apple_google_pay' | 'paypal' | 'klarna' | 'bank' | 'truck';
  isRecommended?: boolean;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: {
    code: string;
    symbol: string;
    rateToInr: number;
    name: string;
  };
  tax: {
    name: string;
    rate: number; // 0.18 for 18% GST
  };
  deliveryNotice: string;
  freeShippingThreshold: number; // in INR
  freeShippingThresholdFormatted: string;
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  defaultStatePlaceholder: string;
  paymentMethods: PaymentMethodConfig[];
}

export const INDIA_COUNTRY: CountryConfig = {
  code: 'IN',
  name: 'India',
  flag: '🇮🇳',
  currency: {
    code: 'INR',
    symbol: '₹',
    rateToInr: 1,
    name: 'Indian Rupee'
  },
  tax: {
    name: 'GST (18%)',
    rate: 0.18
  },
  deliveryNotice: 'Complimentary white-glove delivery, unboxing & structural assembly across India.',
  freeShippingThreshold: 4999,
  freeShippingThresholdFormatted: '₹4,999',
  postalCodeLabel: 'Postal PIN Code',
  postalCodePlaceholder: '122002',
  defaultStatePlaceholder: 'e.g. Haryana',
  paymentMethods: [
    {
      id: 'upi',
      name: 'UPI Instant Settlement',
      subtitle: 'Google Pay, PhonePe, Paytm, BHIM or any UPI App',
      badge: 'Instant & 0% Fee',
      badgeColor: 'navy',
      iconType: 'upi',
      isRecommended: true
    },
    {
      id: 'card',
      name: 'Credit & Debit Cards',
      subtitle: 'Visa, Mastercard, RuPay & Amex with 3D Secure OTP',
      badge: 'Visa • MC • RuPay',
      badgeColor: 'green',
      iconType: 'card'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      subtitle: 'HDFC, ICICI, SBI, Axis, Kotak & 50+ Indian Banks',
      badge: 'Direct Bank Pay',
      badgeColor: 'navy',
      iconType: 'bank'
    },
    {
      id: 'cod',
      name: 'White-Glove Pay on Delivery',
      subtitle: 'Inspect your pieces upon delivery before completing payment via UPI, Card, or Cash',
      badge: 'Doorstep Inspection',
      badgeColor: 'yellow',
      iconType: 'truck'
    }
  ]
};

export const SUPPORTED_COUNTRIES: CountryConfig[] = [INDIA_COUNTRY];

interface LocationContextType {
  currentCountry: CountryConfig;
  availableCountries: CountryConfig[];
  setCountry: (code: string) => void;
  detectLocation: () => { detected: boolean; country: CountryConfig; message: string };
  formatPrice: (inrAmount: number, options?: { showCode?: boolean; roundDecimals?: boolean }) => string;
  convertPrice: (inrAmount: number) => number;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // Exclusively locked to India
  const [currentCountry] = useState<CountryConfig>(INDIA_COUNTRY);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Clear any legacy foreign country code stored in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('interiorg_user_location');
    } catch {
      // ignore
    }
  }, []);

  const setCountry = (_code: string) => {
    // Platform is India specific
  };

  const detectLocation = () => ({
    detected: true,
    country: INDIA_COUNTRY,
    message: 'Delivery region is set to India.'
  });

  const convertPrice = (inrAmount: number): number => {
    if (!inrAmount || isNaN(inrAmount)) return 0;
    return inrAmount;
  };

  const formatPrice = (inrAmount: number, options?: { showCode?: boolean; roundDecimals?: boolean }): string => {
    if (inrAmount === undefined || inrAmount === null || isNaN(inrAmount)) return '₹0';
    const { showCode = false, roundDecimals = false } = options || {};
    const formattedNumber = roundDecimals
      ? Math.round(inrAmount).toLocaleString('en-IN')
      : inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return showCode ? `₹${formattedNumber} INR` : `₹${formattedNumber}`;
  };

  return (
    <LocationContext.Provider
      value={{
        currentCountry,
        availableCountries: SUPPORTED_COUNTRIES,
        setCountry,
        detectLocation,
        formatPrice,
        convertPrice,
        isLocationModalOpen,
        setIsLocationModalOpen
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
