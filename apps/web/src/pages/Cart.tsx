import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, itemCount, subtotal, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page my-8">
        <h1 className="mb-8">Your Cart ({itemCount})</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <p className="mb-4">Your cart is empty.</p>
            <Link to="/#shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item-card flex gap-4 p-4 border mb-4">
                  <div className="cart-item-img w-24 h-24 bg-gray-100 flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-bg"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="font-medium">{item.product.name}</h3>
                      </Link>
                      <span className="price">₹{item.product.discountPrice ?? item.product.price}</span>
                    </div>
                    
                    {item.customization && (
                      <div className="text-sm text-muted mt-2">
                        <p>Custom Size: {item.customization.width}x{item.customization.height} {item.customization.unit}</p>
                        <p>Walls: {item.customization.walls}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      {!item.customization ? (
                        <div className="qty-control">
                          <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>-</button>
                          <input type="text" value={item.quantity} readOnly />
                          <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">Qty: {item.quantity}</span>
                      )}
                      
                      <button className="text-danger p-2 hover:bg-gray-50 rounded" onClick={() => removeItem(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary p-6 border bg-white h-fit sticky top-24">
              <h3 className="mb-4 font-playfair text-xl">Order Summary</h3>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b">
                <span>Tax (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6 font-medium text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary w-full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
