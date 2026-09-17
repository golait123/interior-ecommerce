import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ordersApi } from '../api/orders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Paintbrush, 
  MapPin, 
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { cart, itemCount } = useCart();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list
  });

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length || 0;
  const deliveredOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;
  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="page-wrapper">
      <Header />

      <main className="page my-8">
        {/* Header banner */}
        <div className="p-6 bg-white border mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderRadius: '6px' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-green text-xs font-semibold">CUSTOMER ACCOUNT</span>
              <span className="text-xs text-muted">ID: {user?.id.slice(-8)}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}!</h1>
            <p className="text-muted text-sm">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/#shop" className="btn btn-secondary text-sm">
              Continue Shopping
            </Link>
            <Link to="/#custom" className="btn btn-primary text-sm flex items-center gap-2">
              <Paintbrush size={16} /> Custom Wallpaper
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border flex items-center gap-4" style={{ borderRadius: '6px' }}>
            <div style={{ padding: '12px', background: '#f5f0e8', borderRadius: '50%', color: 'var(--accent)' }}>
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Total Orders</p>
              <h2 className="text-2xl font-bold">{isLoading ? '...' : totalOrders}</h2>
            </div>
          </div>

          <div className="bg-white p-5 border flex items-center gap-4" style={{ borderRadius: '6px' }}>
            <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '50%', color: 'var(--orange)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">In Progress</p>
              <h2 className="text-2xl font-bold">{isLoading ? '...' : pendingOrders}</h2>
            </div>
          </div>

          <div className="bg-white p-5 border flex items-center gap-4" style={{ borderRadius: '6px' }}>
            <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '50%', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Completed</p>
              <h2 className="text-2xl font-bold">{isLoading ? '...' : deliveredOrders}</h2>
            </div>
          </div>

          <div className="bg-white p-5 border flex items-center gap-4" style={{ borderRadius: '6px' }}>
            <div style={{ padding: '12px', background: '#f5f0e8', borderRadius: '50%', color: 'var(--dark)' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Cart Items</p>
              <h2 className="text-2xl font-bold">{itemCount}</h2>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders section */}
          <div className="lg:col-span-2 bg-white p-6 border" style={{ borderRadius: '6px' }}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/orders" className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
                View all orders <ArrowRight size={16} />
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted">Loading your orders...</div>
            ) : !orders?.length ? (
              <div className="text-center py-10">
                <Package size={40} className="mx-auto text-muted mb-3" />
                <p className="text-base font-medium mb-1">No orders yet</p>
                <p className="text-sm text-muted mb-4">Start designing your customized wallpaper or browse our decor collections.</p>
                <div className="flex justify-center gap-3">
                  <Link to="/#shop" className="btn btn-primary text-sm">Browse Shop</Link>
                  <Link to="/#custom" className="btn btn-secondary text-sm">Design Wallpaper</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="border p-4 hover:border-dark transition-colors" style={{ borderRadius: '4px' }}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                      <div>
                        <span className="font-semibold text-base">Order #{order.orderNumber}</span>
                        <span className="text-xs text-muted ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{order.total}</span>
                        <span className={`badge ${
                          order.status === 'DELIVERED' ? 'badge-green' :
                          order.status === 'CANCELLED' ? 'badge-red' :
                          order.status === 'SHIPPED' ? 'badge-blue' : 'badge-orange'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2 pt-2 border-t text-sm">
                      {order.items.slice(0, 2).map(item => (
                        <div key={item.id} className="flex justify-between items-center text-muted">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span>₹{item.unitPrice}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted italic">+{order.items.length - 2} more item(s)</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Shortcuts & Account Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 border" style={{ borderRadius: '6px' }}>
              <h3 className="font-bold text-lg mb-4 pb-2 border-b">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <Link to="/#custom" className="p-3 border flex items-center justify-between hover:bg-light transition" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center gap-3">
                    <Paintbrush size={20} className="text-accent" />
                    <div>
                      <p className="font-medium text-sm">Custom Wallpaper Calculator</p>
                      <p className="text-xs text-muted">Estimate dimensions & billable rolls</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </Link>

                <Link to="/cart" className="p-3 border flex items-center justify-between hover:bg-light transition" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className="text-accent" />
                    <div>
                      <p className="font-medium text-sm">My Shopping Cart</p>
                      <p className="text-xs text-muted">{itemCount} items ready for checkout</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </Link>

                <Link to="/orders" className="p-3 border flex items-center justify-between hover:bg-light transition" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-accent" />
                    <div>
                      <p className="font-medium text-sm">Order History & Tracking</p>
                      <p className="text-xs text-muted">Track deliveries and receipts</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 border" style={{ borderRadius: '6px' }}>
              <h3 className="font-bold text-lg mb-4 pb-2 border-b">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted text-xs block uppercase">Full Name</span>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <span className="text-muted text-xs block uppercase">Email Address</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-muted text-xs block uppercase">Account Role</span>
                  <span className="badge badge-gray text-xs mt-1">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
