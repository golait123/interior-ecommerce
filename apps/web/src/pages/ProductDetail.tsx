import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WallpaperCalculator } from '../components/WallpaperCalculator';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);

  const { data: p, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!)
  });

  const handleAddToCart = async () => {
    if (!p) return;
    try {
      await addItem(p.id, qty);
      toast.success('Added to cart!');
    } catch (e) {
      toast.error('Please login to add items to cart.');
    }
  };

  if (isLoading) return <div className="page text-center py-12">Loading...</div>;
  if (!p) return <div className="page text-center py-12">Product not found.</div>;

  const currentImage = p.images?.[activeImage] || p.images?.[0];

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page product-detail mt-8">
        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="main-image-wrapper border overflow-hidden bg-white mb-3" style={{ height: '420px', borderRadius: '4px' }}>
              {currentImage ? (
                <img src={currentImage} alt={p.name} className="product-main-image w-full h-full object-cover" />
              ) : (
                <div className={`gradient-bg gradient-${p.type.toLowerCase()} product-main-image w-full h-full`}></div>
              )}
            </div>

            {/* Multiple thumbnails strip (up to 5) */}
            {p.images && p.images.length > 1 && (
              <div className="flex gap-2">
                {p.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className="border overflow-hidden p-0 cursor-pointer"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '4px',
                      borderColor: activeImage === idx ? 'var(--accent)' : 'var(--border)',
                      borderWidth: activeImage === idx ? '2px' : '1px',
                      opacity: activeImage === idx ? 1 : 0.7,
                      transition: 'all 0.2s',
                    }}
                    title={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="product-info">
            <div className="mb-2">
              <span className="badge badge-gray mr-2">{p.category?.name}</span>
              <span className={`badge ${p.isCustomizable ? 'badge-blue' : 'badge-yellow'}`}>
                {p.isCustomizable ? 'CUSTOM' : 'CURATED'}
              </span>
            </div>
            
            <h1 className="text-4xl mb-4">{p.name}</h1>
            
            <div className="product-price-container text-2xl mb-6">
              {p.discountPrice ? (
                <><span className="price-original">₹{p.price}</span> <span className="price">₹{p.discountPrice}</span></>
              ) : (
                <span className="price">₹{p.price}</span>
              )}
              <span className="unit-label text-base">/{p.unit}</span>
            </div>
            
            <p className="mb-8 text-muted leading-relaxed">{p.description}</p>
            
            <div className="product-specs mb-8">
              {p.material && <p><strong>Material:</strong> {p.material}</p>}
              {p.finish && <p><strong>Finish:</strong> {p.finish}</p>}
            </div>

            {p.isCustomizable ? (
              <div className="mb-8">
                <WallpaperCalculator pricePerSqFt={p.pricePerSqFt} product={p} />
              </div>
            ) : (
              <div className="add-to-cart-section">
                <div className="qty-control mb-4">
                  <label className="mr-4 font-medium">Quantity</label>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <input type="number" value={qty} readOnly />
                  <button onClick={() => setQty(qty + 1)}>+</button>
                </div>
                
                <button className="btn btn-primary w-full" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                
                {p.inventory && (
                  <p className={`mt-4 text-sm ${p.inventory.totalQuantity - p.inventory.reservedQuantity > 5 ? 'text-green' : 'text-orange'}`}>
                    {p.inventory.totalQuantity - p.inventory.reservedQuantity > 0 
                      ? `${p.inventory.totalQuantity - p.inventory.reservedQuantity} in stock` 
                      : 'Out of stock'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
