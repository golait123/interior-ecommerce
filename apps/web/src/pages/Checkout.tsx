import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { addressesApi } from '../api/addresses';
import { ordersApi } from '../api/orders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New address form
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const { data: addresses, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.list
  });

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) return;
    
    let finalAddressId = addressId;
    setIsSubmitting(true);

    try {
      if (!finalAddressId) {
        if (!line1 || !city || !state || !postalCode) {
          toast.error('Please provide a complete shipping address');
          setIsSubmitting(false);
          return;
        }
        const newAddr = await addressesApi.create({ line1, city, state, postalCode, country: 'India' });
        finalAddressId = newAddr.id;
      }

      const orderItems = cart.items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        customization: i.customization
      }));

      await ordersApi.create({ addressId: finalAddressId, items: orderItems });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="page-wrapper checkout-layout">
      <Header />
      <main className="page my-8">
        <h1 className="mb-8">Checkout</h1>
        <div className="checkout-grid flex gap-8 flex-col md:flex-row">
          
          <div className="checkout-form flex-1">
            <h3 className="mb-4">Shipping Address</h3>
            
            {addresses && addresses.length > 0 && (
              <div className="mb-6">
                <select className="select w-full mb-4" value={addressId} onChange={e => setAddressId(e.target.value)}>
                  <option value="">-- Add New Address --</option>
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>{a.line1}, {a.city}, {a.state} {a.postalCode}</option>
                  ))}
                </select>
              </div>
            )}

            {!addressId && (
              <div className="address-form space-y-4">
                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input type="text" className="input" value={line1} onChange={e => setLine1(e.target.value)} required />
                </div>
                <div className="flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">City</label>
                    <input type="text" className="input" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">State</label>
                    <input type="text" className="input" value={state} onChange={e => setState(e.target.value)} required />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">ZIP</label>
                    <input type="text" className="input" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary w-full md:w-96 p-6 border bg-white h-fit">
            <h3 className="mb-4 font-playfair text-xl">Order Summary</h3>
            <div className="mb-4 max-h-60 overflow-y-auto pr-2">
              {cart?.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <span className="truncate pr-4">{item.quantity}x {item.product.name}</span>
                  <span>₹{(item.quantity * Number(item.product.discountPrice ?? item.product.price)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between mb-4"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between mb-6 font-medium text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !cart?.items.length}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
