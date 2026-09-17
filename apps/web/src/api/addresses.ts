import { api, unwrap } from './client';
export const addressesApi = {
  list: () => api.get('/addresses').then(unwrap<Address[]>),
  create: (d: { line1: string; line2?: string; city: string; state: string; postalCode: string; country?: string }) =>
    api.post('/addresses', d).then(unwrap<Address>),
};
export type Address = { id: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
