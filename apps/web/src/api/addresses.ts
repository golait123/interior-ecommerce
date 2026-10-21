import { api, unwrap } from './client';

export type AddressTag = 'Home' | 'Office' | 'Villa' | 'Studio' | 'Other';

export type Address = {
  id: string;
  name?: string;
  phone?: string;
  tag?: AddressTag;
  line1: string; // Street name, home name, building, apartment
  line2?: string; // Landmark, locality, area
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
};

const STORAGE_KEY = 'interiorg_saved_addresses';

export const addressesApi = {
  list: async (): Promise<Address[]> => {
    try {
      const res = await api.get('/addresses').then(unwrap<Address[]>);
      if (res && res.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
        return res;
      }
    } catch {
      // fallback to localStorage
    }
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  },

  create: async (d: Partial<Address>): Promise<Address> => {
    let created: Address | null = null;
    try {
      created = await api.post('/addresses', {
        line1: d.line1,
        line2: d.line2,
        city: d.city,
        state: d.state,
        postalCode: d.postalCode,
        country: d.country || 'India'
      }).then(unwrap<Address>);
    } catch {
      // offline fallback
    }

    const local = localStorage.getItem(STORAGE_KEY);
    const list: Address[] = local ? JSON.parse(local) : [];
    const newAddress: Address = {
      id: created?.id || 'addr_' + Date.now(),
      name: d.name || 'Resident',
      phone: d.phone || '',
      tag: d.tag || 'Home',
      line1: d.line1 || '',
      line2: d.line2 || '',
      city: d.city || '',
      state: d.state || '',
      postalCode: d.postalCode || '',
      country: d.country || 'India',
      isDefault: d.isDefault ?? (list.length === 0),
      latitude: d.latitude,
      longitude: d.longitude
    };

    if (newAddress.isDefault) {
      list.forEach(a => { a.isDefault = false; });
    }
    list.unshift(newAddress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newAddress;
  },

  update: async (id: string, d: Partial<Address>): Promise<Address> => {
    try {
      await api.put(`/addresses/${id}`, d);
    } catch {
      // offline fallback
    }

    const local = localStorage.getItem(STORAGE_KEY);
    let list: Address[] = local ? JSON.parse(local) : [];
    if (d.isDefault) {
      list = list.map(a => ({ ...a, isDefault: false }));
    }
    list = list.map(a => a.id === id ? { ...a, ...d } : a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list.find(a => a.id === id) || (d as Address);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/addresses/${id}`);
    } catch {
      // offline fallback
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Address[] = JSON.parse(local);
      const filtered = list.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  }
};
