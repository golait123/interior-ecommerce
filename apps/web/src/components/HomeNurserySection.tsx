import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product } from '../api/products';
import { 
  Wind, 
  Droplets, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  ChevronRight, 
  ShoppingBag, 
  Eye, 
  Heart, 
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeNurserySectionProps {
  onSelectSpace: (spaceSlug: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HomeNurserySection: React.FC<HomeNurserySectionProps> = ({
  onSelectSpace,
  onQuickView,
  onAddToCart
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'balcony' | 'lawn' | 'tools'>('all');

  // Fetch products under home-nursery
  const { data: nurseryProductsData, isLoading } = useQuery({
    queryKey: ['products', { space: 'home-nursery' }],
    queryFn: () => productsApi.list({ space: 'home-nursery', limit: 20 })
  });

  const allItems = nurseryProductsData?.items || [];

  // Filter items by sub-category tab
  const filteredItems = allItems.filter(p => {
    if (activeTab === 'all') return true;
    const text = `${p.name} ${p.description} ${p.material || ''}`.toLowerCase();
    if (activeTab === 'balcony') return text.includes('balcony') || text.includes('macrame') || text.includes('pothos') || text.includes('ivy') || text.includes('herb');
    if (activeTab === 'lawn') return text.includes('lawn') || text.includes('birdbath') || text.includes('sandstone') || text.includes('urn') || text.includes('bench');
    if (activeTab === 'tools') return text.includes('watering can') || text.includes('trowel') || text.includes('tool') || text.includes('stand') || text.includes('mural');
    return true;
  });

  const handleExploreInShop = (spaceSlug = 'home-nursery') => {
    onSelectSpace(spaceSlug);
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="nursery" className="nursery-section page pt-12 pb-16">
      {/* SECTION HEADER */}
      <div className="nursery-header text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef5eb] text-[#345d2d] rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-[#cde0c7]">
          <span>🌱</span>
          <span>Botanical Living & Home Nursery</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-playfair font-normal text-dark mb-3">
          Lawn & Balcony Sanctuaries: Breathe Natural Freshness
        </h2>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          Harness the biophilic power of living botanicals, unglazed Haryana terracotta planters, 
          and artisan gardening decor to turn city balconies and open lawns into oxygen-rich sanctuaries.
        </p>
      </div>

      {/* THE 4 PILLARS OF BOTANICAL FRESHNESS & WELLNESS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* Benefit 1 */}
        <div className="benefit-card bg-white p-5 rounded-lg border border-[#ded9d0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#eef7ee] text-[#2e5926] flex items-center justify-center text-lg mb-3">
              <Wind size={20} />
            </div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
              Active Purification
            </div>
            <h3 className="font-playfair text-base font-bold text-dark mb-2">
              Oxygenation & VOC Trap
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Foliage like English Ivy and Golden Pothos naturally trap airborne toxins, releasing fresh oxygen for crisp morning balcony air.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-[11px] font-semibold text-[#2e5926]">
            <span>+45% Air Freshness</span>
            <span>🌬️ Cleans Air</span>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="benefit-card bg-white p-5 rounded-lg border border-[#ded9d0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#fbf3e8] text-[#915e24] flex items-center justify-center text-lg mb-3">
              <Droplets size={20} />
            </div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
              Thermal Balance
            </div>
            <h3 className="font-playfair text-base font-bold text-dark mb-2">
              Evaporative Clay Cooling
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Hand-thrown porous terracotta planters breathe through capillary action, reducing ambient microclimate temperature by 2°C to 4°C.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-[11px] font-semibold text-[#915e24]">
            <span>-3°C Verandah Cooling</span>
            <span>💧 Breathable Clay</span>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="benefit-card bg-white p-5 rounded-lg border border-[#ded9d0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#eef4f7] text-[#2c617b] flex items-center justify-center text-lg mb-3">
              <Sun size={20} />
            </div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
              Biophilic Calm
            </div>
            <h3 className="font-playfair text-base font-bold text-dark mb-2">
              Stress Relief & Focus
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Living green textures and natural stone basins lower cortisol, relieve digital eye strain, and inspire mindful morning grounding.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-[11px] font-semibold text-[#2c617b]">
            <span>Lowers Cortisol</span>
            <span>🌿 Mindful Living</span>
          </div>
        </div>

        {/* Benefit 4 */}
        <div className="benefit-card bg-white p-5 rounded-lg border border-[#ded9d0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#fdf5eb] text-[#8c672b] flex items-center justify-center text-lg mb-3">
              <Sparkles size={20} />
            </div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
              Organic Defense
            </div>
            <h3 className="font-playfair text-base font-bold text-dark mb-2">
              Aromatherapy & Pest Shield
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Herbal planters of lemongrass, tulsi, and vetiver perfume the evening breeze while creating an organic barrier against mosquitoes.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-[11px] font-semibold text-[#8c672b]">
            <span>Chemical-Free</span>
            <span>🍋 Citrus Aroma</span>
          </div>
        </div>
      </div>

      {/* BOTANICAL & GARDENING SHOWCASE */}
      <div className="bg-[#fbf9f4] border rounded-xl p-6 md:p-8 mb-12" style={{ borderColor: '#ded9d0' }}>
        
        {/* Showcase Header & Tab Switchers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: '#ded9d0' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🪴</span>
              <h3 className="text-xl md:text-2xl font-playfair font-normal text-dark m-0">
                Curated Nursery & Gardening Accents
              </h3>
            </div>
            <p className="text-xs text-muted m-0">
              Handcrafted planters, live greenery displays, and artisan tools designed for indoor & outdoor spaces
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Curations' },
              { id: 'balcony', label: '🪴 Balcony Greens' },
              { id: 'lawn', label: '🌳 Lawn & Stone' },
              { id: 'tools', label: '✂️ Garden Decor & Tools' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-all border ${
                  activeTab === tab.id
                    ? 'bg-[#2d2a27] text-white border-[#2d2a27] shadow-xs'
                    : 'bg-white text-dark border-[#ded9d0] hover:border-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="loading-spinner mx-auto my-12"></div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredItems.slice(0, 8).map(product => {
              const curPrice = Number(product.discountPrice || product.price);
              const origPrice = Number(product.price);
              const hasDiscount = product.discountPrice !== null && Number(product.discountPrice) < origPrice;

              return (
                <div 
                  key={product.id}
                  className="nursery-product-card bg-white rounded-lg border border-[#ded9d0] overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div>
                    {/* Media / Gradient */}
                    <div className="relative h-52 bg-[#f4eee4] overflow-hidden">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full gradient-bg gradient-${product.type.toLowerCase()}`} />
                      )}

                      <span className="absolute top-2.5 left-2.5 badge badge-green text-[10px] font-bold shadow-xs">
                        🌱 BOTANICAL FRESH
                      </span>

                      {/* Quick view button overlay */}
                      <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-dark text-xs font-semibold py-1 px-3 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer border border-[#ded9d0]"
                      >
                        <Eye size={12} className="text-accent" />
                        <span>Quick View</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="text-[11px] text-accent font-semibold mb-1 flex items-center gap-1">
                        <span>{product.category?.name}</span>
                        {product.material && <span>• {product.material}</span>}
                      </div>

                      <h4 className="font-playfair text-sm font-bold text-dark m-0 mb-2 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>

                      {/* Primary Botanical Benefit Pill */}
                      {product.botanicalBenefits && product.botanicalBenefits.length > 0 && (
                        <div className="mb-3">
                          <span className="inline-block text-[10px] font-semibold bg-[#edf5ec] text-[#2c5525] px-2 py-0.5 rounded border border-[#cbe1c7] truncate max-w-full">
                            {product.botanicalBenefits[0]}
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] text-muted line-clamp-2 m-0 mb-3">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Price */}
                  <div className="p-4 pt-0 border-t border-[#f7f4ee] flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-sm font-bold text-dark font-playfair">
                        ₹{curPrice.toLocaleString('en-IN')}
                      </div>
                      {hasDiscount && (
                        <div className="text-[10px] text-muted line-through">
                          ₹{origPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      className="btn btn-primary btn-sm py-1 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted text-xs">
            No products found in this filter.
          </div>
        )}

        {/* CTA Bar */}
        <div className="mt-8 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: '#ded9d0' }}>
          <div className="text-xs text-muted flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
            <span>
              All botanical planters and garden decor are crafted from high-fired natural clays, cast brass, and seasoned woods.
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleExploreInShop('home-nursery')}
            className="btn btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Explore All Nursery & Garden Pieces ({allItems.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* PLANT STYLING & FRESHNESS TIPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="styling-tip-card bg-white p-6 rounded-lg border border-[#ded9d0] flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f2ecde] text-[#795b3d] flex items-center justify-center flex-shrink-0 text-xl">
            🪴
          </div>
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
              Balcony Micro-Gardening
            </span>
            <h4 className="font-playfair text-base font-bold text-dark mt-0.5 mb-1.5">
              Vertical Layering for Small Verandahs
            </h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              When floor space is limited, use wrought iron tiered plant stands and hanging brass macrame planters. 
              Placing taller leafy plants against walls and hanging trailing ivy creates a thermal cushion that cools your living room.
            </p>
          </div>
        </div>

        <div className="styling-tip-card bg-white p-6 rounded-lg border border-[#ded9d0] flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#edf5ec] text-[#36612f] flex items-center justify-center flex-shrink-0 text-xl">
            🌳
          </div>
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
              Lawn & Open Terrace Styling
            </span>
            <h4 className="font-playfair text-base font-bold text-dark mt-0.5 mb-1.5">
              The Water & Sandstone Cooling Anchor
            </h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              Anchor open lawns with hand-chiseled pink sandstone birdbaths and aquatic lily basins. 
              The gentle water surface attracts hummingbirds and butterflies while increasing ambient humidity during dry afternoons.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
