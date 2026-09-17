import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { OrdersTable } from '../components/OrdersTable';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page my-8">
        <h1 className="mb-8">My Orders</h1>
        
        {isLoading ? (
          <div>Loading orders...</div>
        ) : !orders?.length ? (
          <div className="empty-state">You haven't placed any orders yet.</div>
        ) : (
          <div className="orders-list space-y-4">
            {orders.map(order => (
              <div key={order.id} className="order-card border bg-white p-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div>
                    <h3 className="font-medium mb-1">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">₹{order.total}</span>
                    <span className="badge badge-gray">{order.status}</span>
                    {expandedId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3 text-sm text-muted uppercase">Items</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full gradient-bg"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted">{item.quantity} × ₹{item.unitPrice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
