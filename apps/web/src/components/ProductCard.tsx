import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/products';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const isDiscounted = product.discountPrice !== null;
  const curPrice = Number(product.discountPrice || product.price);
  const origPrice = Number(product.price);
  const discountPct = isDiscounted && origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : null;

  return (
    <div className="product-card group relative">
      <div className="product-card-image-wrapper relative">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <div className="product-image-placeholder">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className={`gradient-bg gradient-${product.type.toLowerCase()}`}></div>
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="product-badges">
          <span className={`badge ${product.isCustomizable ? 'badge-blue' : 'badge-yellow'}`}>
            {product.isCustomizable ? 'CUSTOM' : 'CURATED'}
          </span>
          {product.primaryDomain && (
            <span className={`badge ${product.primaryDomain === 'outdoor' ? 'badge-green' : product.primaryDomain === 'both' ? 'badge-purple' : 'badge-orange'} font-semibold text-[10px]`}>
              {product.primaryDomain === 'outdoor' ? '🌿 OUTDOOR' : product.primaryDomain === 'both' ? '🏠🌿 ALL-SPACE' : '🏠 INDOOR'}
            </span>
          )}
          {isDiscounted && discountPct && (
            <span className="badge badge-red font-bold">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* Floating Quick View Overlay Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-dark text-xs font-semibold py-1.5 px-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 border border-[#ded9d0] cursor-pointer"
            title="Quick view product details"
          >
            <Eye size={13} className="text-accent" />
            <span>Quick View</span>
          </button>
        )}
      </div>
      
      <div className="product-card-content">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="product-category m-0">{product.category?.name}</p>
            {product.spaces && product.spaces.length > 0 ? (
              <span className="text-[11px] text-accent font-medium flex items-center gap-1">
                <span>{product.spaces[0].icon}</span>
                <span>{product.spaces[0].name}</span>
              </span>
            ) : product.rooms && product.rooms.length > 0 ? (
              <span className="text-[11px] text-accent font-medium">
                {product.rooms[0]}
              </span>
            ) : null}
          </div>
          <Link to={`/products/${product.id}`}>
            <h3 className="product-name">{product.name}</h3>
          </Link>
          {product.botanicalBenefits && product.botanicalBenefits.length > 0 && (
            <div className="mb-1.5">
              <span className="text-[10px] bg-[#edf6ec] text-[#2e5926] px-1.5 py-0.5 rounded font-semibold truncate block border border-[#d2e7cf]">
                {product.botanicalBenefits[0]}
              </span>
            </div>
          )}
          {product.spaces && product.spaces.length > 1 ? (
            <p className="text-[11px] text-muted m-0 mb-2 truncate">
              Spaces: {product.spaces.map(s => `${s.icon} ${s.name}`).slice(0, 3).join(' • ')}
            </p>
          ) : product.rooms && product.rooms.length > 1 ? (
            <p className="text-[11px] text-muted m-0 mb-2 truncate">
              Ideal for: {product.rooms.join(' • ')}
            </p>
          ) : null}
        </div>

        <div className="product-card-footer">
          <div className="product-price-container">
            {isDiscounted ? (
              <>
                <span className="price-original">₹{product.price}</span>
                <span className="price">₹{product.discountPrice}</span>
              </>
            ) : (
              <span className="price">₹{product.price}</span>
            )}
            <span className="unit-label">/{product.unit}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onQuickView && (
              <button 
                type="button"
                className="btn btn-ghost p-1.5 text-muted hover:text-dark md:hidden cursor-pointer" 
                onClick={() => onQuickView(product)}
                aria-label="Quick View"
                title="Quick View"
              >
                <Eye size={18} />
              </button>
            )}

            {product.isCustomizable ? (
              <a
                href="#custom"
                className="btn btn-sm py-1 px-2.5 text-xs font-semibold rounded bg-[#f5efe6] text-accent hover:bg-[#8c6f52] hover:text-white transition-colors"
                title="Customize this wallpaper with your room dimensions"
              >
                <Sparkles size={13} className="inline mr-1" />
                <span>Customize</span>
              </a>
            ) : onAddToCart ? (
              <button 
                type="button"
                className="btn btn-ghost add-to-cart-btn" 
                onClick={() => onAddToCart(product)}
                aria-label="Add to cart"
                title="Add to cart"
              >
                <ShoppingBag size={20} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
