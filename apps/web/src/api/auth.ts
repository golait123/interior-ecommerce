import { api, unwrap } from './client';
export const authApi = {
  register: (d: { name: string; email: string; password: string }) =>
    api.post('/auth/register', d).then(unwrap<{ user: User; accessToken: string }>),
  login: (d: { email: string; password: string }) =>
    api.post('/auth/login', d).then(unwrap<{ user: User; accessToken: string }>),
  me: () => api.get('/auth/me').then(unwrap<User>),
  googleUrl: () => `/api/v1/auth/google?returnTo=${encodeURIComponent(window.location.origin)}`,
};
export type User = { id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN' | 'STOCK_MANAGER' | 'DESIGNER' };
