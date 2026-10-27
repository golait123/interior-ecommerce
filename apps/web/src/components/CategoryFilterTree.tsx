import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { FilterCategoryTree, FilterSubCategory, FilterColorOption } from '../data/categoryHierarchy';

interface CategoryFilterTreeProps {
  categories: FilterCategoryTree[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedSubCategory: string | null;
  onSelectSubCategory: (slug: string | null, keywords: string[]) => void;
  selectedColor: string | null;
  onSelectColor: (colorId: string | null, keyword: string | null) => void;
}

export function CategoryFilterTree({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubCategory,
  onSelectSubCategory,
  selectedColor,
  onSelectColor,
}: CategoryFilterTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // Expanded category dropdowns (default open the selected category, or seeds/plants)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    seeds: true,
    'custom-wallpapers': true,
    plants: true,
    furniture: true,
  });

  // Expanded subcategory dropdowns (e.g. seeds-by-flower-color)
  const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>({
    'seeds-by-flower-color': true,
    'wallpapers-by-color': true,
    'flowering-plants': true,
  });

  const toggleCategoryExpand = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCats(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const toggleSubCategoryExpand = (subId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedSubCats(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };

  // Filter categories by search term
  const filteredCats = (categories || []).filter(cat => {
    if (!cat) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    if (cat.name?.toLowerCase().includes(term)) return true;
    return (cat.subcategories || []).some(sub => 
      sub?.name?.toLowerCase().includes(term) ||
      (sub?.keywords || []).some(k => k?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="pt-2 pl-1 space-y-1">
      {/* Category Filter Internal Search Box */}
      <input
        type="text"
        placeholder="Search categories & sub-sections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="nursery-filter-subsearch"
      />

      {/* "All Categories" Root Option */}
      <label className="nursery-checkbox-item cursor-pointer">
        <input
          type="radio"
          name="hierarchical-cat-radio"
          checked={!selectedCategory && !selectedSubCategory && !selectedColor}
          onChange={() => {
            onSelectCategory('');
            onSelectSubCategory(null, []);
            onSelectColor(null, null);
          }}
          className="accent-[var(--navy)]"
        />
        <span className="font-semibold text-stone-900">All Categories</span>
      </label>

      {/* Hierarchical Categories Accordion List */}
      <div className="space-y-1 mt-1">
        {filteredCats.map(cat => {
          const isCatSelected = selectedCategory === cat.slug;
          const isExpanded = expandedCats[cat.id] ?? isCatSelected;

          return (
            <div key={cat.id} className="border-b border-stone-100 pb-1 mb-1">
              {/* Category Parent Row */}
              <div 
                className={`nursery-nested-parent-item ${isCatSelected ? 'active' : ''}`}
                onClick={() => {
                  onSelectCategory(isCatSelected ? '' : cat.slug);
                  // Auto expand when chosen
                  setExpandedCats(prev => ({ ...prev, [cat.id]: true }));
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="radio"
                    name="hierarchical-cat-radio"
                    checked={isCatSelected}
                    onChange={() => {}}
                    className="accent-[var(--navy)] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="truncate">{cat?.name || 'Category'}</span>
                </div>

                {cat.subcategories.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => toggleCategoryExpand(cat.id, e)}
                    className="nursery-nested-toggle-btn"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Nested Subcategories List */}
              {isExpanded && cat.subcategories.length > 0 && (
                <div className="nursery-nested-children-list">
                  {cat.subcategories.map(sub => {
                    const isSubSelected = selectedSubCategory === sub.slug;
                    const hasColors = Boolean(sub.colors && sub.colors.length > 0);
                    const isSubExpanded = expandedSubCats[sub.id] ?? isSubSelected;

                    return (
                      <div key={sub.id} className="space-y-1">
                        <div
                          className={`nursery-nested-child-item ${isSubSelected ? 'active' : ''}`}
                          onClick={() => {
                            if (isSubSelected) {
                              onSelectSubCategory(null, []);
                            } else {
                              onSelectCategory(cat.slug);
                              onSelectSubCategory(sub.slug, sub.keywords);
                            }
                            if (hasColors) {
                              setExpandedSubCats(prev => ({ ...prev, [sub.id]: true }));
                            }
                          }}
                        >
                          <span className="truncate flex-1 font-medium">{sub?.name || 'Subcategory'}</span>
                          
                          {hasColors && (
                            <button
                              type="button"
                              onClick={(e) => toggleSubCategoryExpand(sub.id, e)}
                              className="p-0.5 text-stone-400 hover:text-stone-700 bg-transparent border-none cursor-pointer"
                            >
                              {isSubExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                          )}
                        </div>

                        {/* Nested Color Swatches Grid (e.g. Seeds by Flower Color, Wallpaper by Color) */}
                        {hasColors && isSubExpanded && sub.colors && (
                          <div className="nursery-color-swatches-grid">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 w-full mb-0.5 block">
                              Select Color:
                            </span>
                            {sub.colors.map(color => {
                              const isColorActive = selectedColor === color.id;
                              return (
                                <button
                                  key={color.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isColorActive) {
                                      onSelectColor(null, null);
                                    } else {
                                      onSelectCategory(cat.slug);
                                      onSelectSubCategory(sub.slug, sub.keywords);
                                      onSelectColor(color.id, color.keyword);
                                    }
                                  }}
                                  className={`nursery-color-swatch-btn ${isColorActive ? 'active' : ''}`}
                                  title={`Filter by ${color?.name || 'Color'}`}
                                >
                                  <span 
                                    className="swatch-color-dot" 
                                    style={{ backgroundColor: color?.hex || '#cccccc' }} 
                                  />
                                  <span>{color?.name || ''}</span>
                                  {isColorActive && <Check size={11} className="ml-0.5 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
