import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, SpaceDomainItem, SpaceLeafItem } from '../api/products';
import { 
  FolderTree, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  X,
  Compass
} from 'lucide-react';

interface SpaceTreeFilterProps {
  selectedSpace: string;
  onSelectSpace: (slug: string) => void;
}

export const SpaceTreeFilter: React.FC<SpaceTreeFilterProps> = ({
  selectedSpace,
  onSelectSpace
}) => {
  const [isTreeModalOpen, setIsTreeModalOpen] = useState<boolean>(false);

  const { data: spacesData } = useQuery({
    queryKey: ['spaces-tree'],
    queryFn: productsApi.spacesTree
  });

  const domains = spacesData?.domains || [];
  const totalProducts = spacesData?.totalProducts || 0;

  // Identify active node in tree
  const activeDomain = domains.find(d => d.slug === selectedSpace);
  let activeLeaf: SpaceLeafItem | undefined;
  let activeLeafParentDomain: SpaceDomainItem | undefined;

  for (const d of domains) {
    const leaf = d.children.find(c => c.slug === selectedSpace);
    if (leaf) {
      activeLeaf = leaf;
      activeLeafParentDomain = d;
      break;
    }
  }

  // Active domain tab for sub-space pills ('all' | 'indoor' | 'outdoor')
  const [activeTabDomain, setActiveTabDomain] = useState<'all' | 'indoor' | 'outdoor'>('all');

  // Keep tab in sync with selectedSpace
  React.useEffect(() => {
    if (activeLeafParentDomain) {
      setActiveTabDomain(activeLeafParentDomain.slug as 'indoor' | 'outdoor');
    } else if (activeDomain) {
      setActiveTabDomain(activeDomain.slug as 'indoor' | 'outdoor');
    } else if (!selectedSpace) {
      setActiveTabDomain('all');
    }
  }, [selectedSpace, activeDomain, activeLeafParentDomain]);

  const handleTabClick = (tab: 'all' | 'indoor' | 'outdoor') => {
    setActiveTabDomain(tab);
    if (tab === 'all') {
      onSelectSpace('');
    } else {
      onSelectSpace(tab);
    }
  };

  const handleLeafClick = (leafSlug: string) => {
    if (selectedSpace === leafSlug) {
      // Step back to parent domain
      if (activeLeafParentDomain) {
        onSelectSpace(activeLeafParentDomain.slug);
      } else {
        onSelectSpace('');
      }
    } else {
      onSelectSpace(leafSlug);
    }
  };

  const indoorDomain = domains.find(d => d.slug === 'indoor');
  const outdoorDomain = domains.find(d => d.slug === 'outdoor');

  // Quick popular spaces for "All Spaces" tab
  const quickPopularLeaves = [
    { slug: 'living-room', name: 'Living Room', icon: '🛋️', count: 32 },
    { slug: 'bedroom', name: 'Bedroom', icon: '🛏️', count: 26 },
    { slug: 'lawn-garden', name: 'Lawn & Garden', icon: '🌱', count: 12 },
    { slug: 'balcony', name: 'Balcony', icon: '☕', count: 18 },
    { slug: 'nursery', name: 'Home Nursery', icon: '🪴', count: 8 },
    { slug: 'dining-room', name: 'Dining', icon: '🍽️', count: 14 }
  ];

  return (
    <div className="space-filter-wrapper mb-5">
      {/* 1. PRIMARY SEGMENTED DOMAIN CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: '#ded9d0' }}>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* All Spaces Segment */}
          <button
            type="button"
            onClick={() => handleTabClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all border flex items-center gap-2 whitespace-nowrap ${
              activeTabDomain === 'all' && !selectedSpace
                ? 'bg-[#2d2a27] text-white border-[#2d2a27] shadow-xs'
                : 'bg-white text-[#2d2a27] border-[#ded9d0] hover:bg-[#faf8f5]'
            }`}
          >
            <Sparkles size={13} className={activeTabDomain === 'all' && !selectedSpace ? 'text-[#c4a982]' : 'text-gray-400'} />
            <span>All Spaces</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTabDomain === 'all' && !selectedSpace ? 'bg-[#8c6f52] text-white' : 'bg-[#eee8df] text-[#63574b]'
            }`}>
              {totalProducts}
            </span>
          </button>

          {/* Indoor Domain Segment */}
          {indoorDomain && (
            <button
              type="button"
              onClick={() => handleTabClick('indoor')}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all border flex items-center gap-2 whitespace-nowrap ${
                activeTabDomain === 'indoor'
                  ? 'bg-[#2d2a27] text-white border-[#2d2a27] shadow-xs'
                  : 'bg-white text-[#2d2a27] border-[#ded9d0] hover:bg-[#faf8f5]'
              }`}
            >
              <span>🏠</span>
              <span>Indoor Spaces</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTabDomain === 'indoor' ? 'bg-[#8c6f52] text-white' : 'bg-[#eee8df] text-[#63574b]'
              }`}>
                {indoorDomain.count}
              </span>
            </button>
          )}

          {/* Outdoor Domain Segment */}
          {outdoorDomain && (
            <button
              type="button"
              onClick={() => handleTabClick('outdoor')}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all border flex items-center gap-2 whitespace-nowrap ${
                activeTabDomain === 'outdoor'
                  ? 'bg-[#2d2a27] text-white border-[#2d2a27] shadow-xs'
                  : 'bg-white text-[#2d2a27] border-[#ded9d0] hover:bg-[#faf8f5]'
              }`}
            >
              <span>🌿</span>
              <span>Outdoor & Garden</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTabDomain === 'outdoor' ? 'bg-[#6a8c6f] text-white' : 'bg-[#eee8df] text-[#63574b]'
              }`}>
                {outdoorDomain.count}
              </span>
            </button>
          )}
        </div>

        {/* Tree Taxonomy Exploration Button (subtle, clean) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTreeModalOpen(!isTreeModalOpen)}
            className="text-[11px] text-muted hover:text-dark font-medium border-none bg-transparent cursor-pointer flex items-center gap-1.5 transition-colors py-1"
            title="Inspect architectural room hierarchy"
          >
            <Compass size={13} className="text-accent" />
            <span>Room Hierarchy</span>
            {isTreeModalOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {selectedSpace && (
            <button
              type="button"
              onClick={() => onSelectSpace('')}
              className="text-xs text-accent font-semibold hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1 pl-2 border-l"
              style={{ borderColor: '#ded9d0' }}
            >
              <X size={12} />
              <span>Clear Space</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CONTEXTUAL SUB-SPACES CHIP ROW */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted mr-1 whitespace-nowrap flex items-center gap-1">
          {activeTabDomain === 'indoor' && <span>Rooms:</span>}
          {activeTabDomain === 'outdoor' && <span>Zones:</span>}
          {activeTabDomain === 'all' && <span>Quick Spaces:</span>}
        </span>

        {/* When 'indoor' tab is selected */}
        {activeTabDomain === 'indoor' && indoorDomain && (
          <>
            <button
              type="button"
              onClick={() => onSelectSpace('indoor')}
              className={`space-leaf-pill ${selectedSpace === 'indoor' ? 'active' : ''}`}
            >
              <span>All Indoor</span>
              <span className="space-leaf-count">{indoorDomain.count}</span>
            </button>
            {indoorDomain.children.map(leaf => (
              <button
                key={leaf.slug}
                type="button"
                onClick={() => handleLeafClick(leaf.slug)}
                className={`space-leaf-pill ${selectedSpace === leaf.slug ? 'active' : ''}`}
                title={leaf.description}
              >
                <span>{leaf.icon}</span>
                <span>{leaf.name}</span>
                <span className="space-leaf-count">{leaf.count}</span>
              </button>
            ))}
          </>
        )}

        {/* When 'outdoor' tab is selected */}
        {activeTabDomain === 'outdoor' && outdoorDomain && (
          <>
            <button
              type="button"
              onClick={() => onSelectSpace('outdoor')}
              className={`space-leaf-pill ${selectedSpace === 'outdoor' ? 'active' : ''}`}
            >
              <span>All Outdoor</span>
              <span className="space-leaf-count">{outdoorDomain.count}</span>
            </button>
            {outdoorDomain.children.map(leaf => (
              <button
                key={leaf.slug}
                type="button"
                onClick={() => handleLeafClick(leaf.slug)}
                className={`space-leaf-pill ${selectedSpace === leaf.slug ? 'active' : ''}`}
                title={leaf.description}
              >
                <span>{leaf.icon}</span>
                <span>{leaf.name}</span>
                <span className="space-leaf-count">{leaf.count}</span>
              </button>
            ))}
          </>
        )}

        {/* When 'all' tab is selected */}
        {activeTabDomain === 'all' && (
          <>
            {quickPopularLeaves.map(leaf => {
              const isSelected = selectedSpace === leaf.slug;
              return (
                <button
                  key={leaf.slug}
                  type="button"
                  onClick={() => handleLeafClick(leaf.slug)}
                  className={`space-leaf-pill ${isSelected ? 'active' : ''}`}
                >
                  <span>{leaf.icon}</span>
                  <span>{leaf.name}</span>
                  <span className="space-leaf-count">{leaf.count}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* 3. ACTIVE LEAF SPOTLIGHT (Only shows if a specific sub-space is active) */}
      {activeLeaf && (
        <div className="mt-1.5 px-3 py-2 rounded bg-[#faf8f5] border flex flex-wrap items-center justify-between gap-2 text-xs" style={{ borderColor: '#ded9d0' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{activeLeaf.icon}</span>
            <div>
              <span className="font-bold text-dark">{activeLeaf.name}</span>
              <span className="text-muted ml-2 text-[11px] hidden sm:inline">{activeLeaf.description}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeLeaf.craftHighlights && activeLeaf.craftHighlights.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {activeLeaf.craftHighlights.map((craft, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-[#ede4d8] text-[#63513f] font-medium rounded-full">
                    {craft}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => onSelectSpace('')}
              className="text-accent hover:underline text-xs font-semibold border-none bg-transparent cursor-pointer p-0 ml-1"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. OPTIONAL COLLAPSIBLE TAXONOMY VIEWER (Completely clean drawer) */}
      {isTreeModalOpen && (
        <div className="mt-3 p-4 bg-white border rounded shadow-sm text-xs" style={{ borderColor: '#ded9d0' }}>
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b" style={{ borderColor: '#ded9d0' }}>
            <div className="flex items-center gap-1.5 font-bold text-dark uppercase tracking-wider text-[11px]">
              <FolderTree size={14} className="text-accent" />
              <span>Full Architectural Space Hierarchy</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTreeModalOpen(false)}
              className="text-muted hover:text-dark border-none bg-transparent cursor-pointer text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {domains.map(domain => (
              <div key={domain.slug} className="p-3 bg-[#fbf9f6] rounded border" style={{ borderColor: '#ded9d0' }}>
                <div 
                  onClick={() => { onSelectSpace(domain.slug); setIsTreeModalOpen(false); }}
                  className="font-bold text-dark cursor-pointer flex items-center justify-between hover:text-accent mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{domain.icon}</span>
                    <span>{domain.name}</span>
                  </span>
                  <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded font-mono font-bold" style={{ borderColor: '#ded9d0' }}>
                    {domain.count} pieces
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {domain.children.map(leaf => (
                    <button
                      key={leaf.slug}
                      type="button"
                      onClick={() => { onSelectSpace(leaf.slug); setIsTreeModalOpen(false); }}
                      className={`text-left p-1.5 rounded border text-[11px] cursor-pointer transition-all flex items-center justify-between ${
                        selectedSpace === leaf.slug 
                          ? 'bg-[#2d2a27] text-white border-[#2d2a27]' 
                          : 'bg-white text-dark hover:border-gray-400 border-[#ded9d0]'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1">
                        <span>{leaf.icon}</span>
                        <span>{leaf.name}</span>
                      </span>
                      <span className="text-[10px] font-bold opacity-75">{leaf.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
