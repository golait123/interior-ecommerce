import React from 'react';
import { Order } from '../api/orders';

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
  onStatusChange?: (orderId: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  CONFIRMED: 'badge-blue',
  PROCESSING: 'badge-indigo',
  SHIPPED: 'badge-purple',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
};

export function OrdersTable({ orders, showActions, onStatusChange }: OrdersTableProps) {
  if (!orders?.length) return <div className="empty-state">No orders found.</div>;

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Destination (City, State)</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-semibold">{o.orderNumber}</td>
              <td>
                {o.user ? (
                  <div>
                    <span className="font-medium text-sm">{o.user.name}</span>
                    <span className="text-xs text-muted block">{o.user.email}</span>
                  </div>
                ) : (
                  <span className="text-muted text-sm">Customer</span>
                )}
              </td>
              <td>
                {o.address ? (
                  <span className="text-sm font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--accent)' }}>📍</span> {o.address.city}, {o.address.state}
                  </span>
                ) : (
                  <span className="text-muted text-xs">Standard Shipping</span>
                )}
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>{o.items?.length || 0} items</td>
              <td>₹{o.total}</td>
              <td>
                <span className={`badge ${statusColors[o.status] || 'badge-gray'}`}>
                  {o.status}
                </span>
              </td>
              {showActions && (
                <td>
                  <select 
                    className="select select-sm" 
                    value={o.status}
                    onChange={(e) => onStatusChange?.(o.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
