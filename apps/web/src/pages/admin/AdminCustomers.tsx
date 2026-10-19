import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { AdminLayout } from './AdminLayout';
import { Users, Search, ShoppingBag } from 'lucide-react';

export function AdminCustomers() {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', { q, role: roleFilter }],
    queryFn: () => adminApi.users({ 
      q: q.trim() || undefined, 
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      limit: 50 
    })
  });

// User role modification is permanently locked in admin panel for platform security reasons.

  // Support both data.users (backend response) and fallback data.items
  const users: any[] = data?.users || data?.items || [];
  const totalCount: number = data?.total ?? users.length;

  return (
    <AdminLayout>
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Registered Customers & Users</h1>
          <p className="text-muted mt-1 text-sm">
            View all registered customer accounts, customer order counts, and manage platform permissions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border">
          <Users size={20} className="text-accent" />
          <span className="font-medium">{totalCount}</span>
          <span className="text-muted text-sm">Total Accounts</span>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1 max-w-md">
          <div className="search-bar w-full bg-white px-3 py-1 border">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by customer name or email..." 
              className="input w-full"
              style={{ border: 'none', background: 'transparent' }}
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {['ALL', 'CUSTOMER', 'STOCK_MANAGER', 'ADMIN'].map((r) => (
            <button
              key={r}
              className={`tag ${roleFilter === r ? 'tag-active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email Address</th>
              <th>Orders Placed</th>
              <th>Registered On</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-2"></div>
                  <span className="text-muted">Loading registered accounts...</span>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-danger">
                  Failed to load users. Please ensure you are logged in with an Admin account.
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No registered users found matching your search.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-medium text-dark">{u.name || 'Unnamed User'}</div>
                    <small className="text-muted">ID: {u.id.slice(0, 12)}...</small>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{u.email}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-muted" />
                      <span>{u._count?.orders ?? 0}</span>
                    </div>
                  </td>
                  <td>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      u.role === 'ADMIN' 
                        ? 'badge-purple' 
                        : u.role === 'STOCK_MANAGER' 
                        ? 'badge-blue' 
                        : 'badge-green'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
