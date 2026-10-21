import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Home, 
  Briefcase, 
  Building, 
  Compass, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { Address, AddressTag } from '../api/addresses';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Partial<Address>) => void;
  initialData?: Address | null;
}

const PRESET_LOCATIONS = [
  { name: 'Indiranagar 100ft Road', home: 'Palm Grove Manor, Flat 3B', city: 'Bengaluru', state: 'Karnataka', pin: '560038', lat: 12.9784, lng: 77.6408 },
  { name: 'Bandra West, Pali Hill', home: 'Sea Breeze Villa 12', city: 'Mumbai', state: 'Maharashtra', pin: '400050', lat: 19.0596, lng: 72.8295 },
  { name: 'Defence Colony, Ring Road', home: 'Kailash Heights, Block C', city: 'New Delhi', state: 'Delhi', pin: '110024', lat: 28.5727, lng: 77.2348 },
  { name: 'Jubilee Hills Road No. 36', home: 'Oakwood Penthouse 501', city: 'Hyderabad', state: 'Telangana', pin: '500033', lat: 17.4319, lng: 78.4073 }
];

export function AddressMapPickerModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [tag, setTag] = useState<AddressTag>(initialData?.tag || 'Home');
  const [homeName, setHomeName] = useState(initialData?.line1?.split(',')[0] || '');
  const [streetName, setStreetName] = useState(initialData?.line1?.split(',').slice(1).join(',').trim() || (initialData?.line1 || ''));
  const [landmark, setLandmark] = useState(initialData?.line2 || '');
  const [city, setCity] = useState(initialData?.city || 'Bengaluru');
  const [state, setState] = useState(initialData?.state || 'Karnataka');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '560038');
  const [name, setName] = useState(initialData?.name || 'Patron Resident');
  const [phone, setPhone] = useState(initialData?.phone || '+91 98765 43210');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  // Map simulated pin coordinates
  const [pinPos, setPinPos] = useState({ x: 50, y: 45 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTag(initialData.tag || 'Home');
      const parts = (initialData.line1 || '').split(',');
      if (parts.length > 1) {
        setHomeName(parts[0].trim());
        setStreetName(parts.slice(1).join(',').trim());
      } else {
        setStreetName(initialData.line1 || '');
      }
      setLandmark(initialData.line2 || '');
      setCity(initialData.city || 'Bengaluru');
      setState(initialData.state || 'Karnataka');
      setPostalCode(initialData.postalCode || '560038');
      setName(initialData.name || 'Patron Resident');
      setPhone(initialData.phone || '+91 98765 43210');
      setIsDefault(initialData.isDefault ?? false);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setPinPos({ x: 52, y: 48 });
          setStreetName('Royal Palms Boulevard, Sector 4');
          setLandmark('Opposite Botanical Nursery Garden');
          setCity('Bengaluru');
          setState('Karnataka');
          setPostalCode('560068');
          toast.success('Pinpointed exact GPS coordinates via Google Maps location');
        },
        () => {
          setIsLocating(false);
          // Fallback simulation
          setPinPos({ x: 54, y: 42 });
          setStreetName('Koramangala 4th Block, 80ft Road');
          setLandmark('Near Sony World Junction');
          setCity('Bengaluru');
          toast.success('Detected approximate city location');
        },
        { timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      toast('Geolocation not supported in browser, using default coordinates');
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setStreetName(preset.name);
    setHomeName(preset.home);
    setCity(preset.city);
    setState(preset.state);
    setPostalCode(preset.pin);
    setSearchQuery('');
    setPinPos({
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30
    });
    toast.success(`Location set: ${preset.name}`);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPinPos({ x, y });
    
    // Auto-update street variation based on click zone
    const streets = [
      'Gulmohar Avenue, Green Park Enclave',
      'Lavender Blossom Lane, Cross 5',
      'Cypress Boulevard, Block B',
      'Magnolia Park Road, 2nd Stage',
      'Teakwood Residency Street'
    ];
    const pickedStreet = streets[Math.floor(Math.random() * streets.length)];
    if (!streetName || streetName.includes('Road') || streetName.includes('Street') || streetName.includes('Lane')) {
      setStreetName(pickedStreet);
    }
    toast('Delivery pin marker updated on Google Map', { icon: '📍' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName.trim()) {
      toast.error('Please specify the street name or road');
      return;
    }
    const combinedLine1 = homeName.trim() 
      ? `${homeName.trim()}, ${streetName.trim()}`
      : streetName.trim();

    onSave({
      id: initialData?.id,
      tag,
      name,
      phone,
      line1: combinedLine1,
      line2: landmark.trim(),
      city,
      state,
      postalCode,
      country: 'India',
      isDefault,
      latitude: 12.9716 + (pinPos.y - 50) * 0.001,
      longitude: 77.5946 + (pinPos.x - 50) * 0.001
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#ded9d0] overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800 m-0">
                {initialData ? 'Edit Sanctuary Address' : 'Add New Address & Map Pin'}
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Locate your residence with street name, home title, or Google Maps pin
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* MAP SEARCH & GPS LOCATOR */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search street name, building or locality on map..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Pinpointing...' : 'GPS Detect'}</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            {searchQuery && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Suggested Locations:</span>
                {PRESET_LOCATIONS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase())).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-1.5 hover:bg-white rounded flex items-center justify-between text-slate-700 hover:text-sky-700 transition-colors"
                  >
                    <span>{preset.name}, {preset.city}</span>
                    <span className="text-[10px] text-slate-400">{preset.pin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INTERACTIVE GOOGLE MAP CANVAS SIMULATION */}
          <div className="relative">
            <div 
              onClick={handleMapClick}
              className="w-full h-44 rounded-xl border border-slate-300 overflow-hidden relative cursor-crosshair select-none bg-[#e8ece9]"
              title="Click anywhere to move the delivery pin"
            >
              {/* Map Canvas Background: Stylized Road & Park Grid */}
              <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                {/* Park Zone */}
                <rect x="10%" y="15%" width="25%" height="45%" fill="#cde5d3" rx="8" />
                <rect x="65%" y="45%" width="30%" height="45%" fill="#cde5d3" rx="8" />
                {/* Water Body */}
                <path d="M 0 90 Q 150 70 300 85 T 600 75 L 600 120 L 0 120 Z" fill="#bae6fd" />
                {/* Highways / Arterial Roads */}
                <line x1="0" y1="40" x2="100%" y2="40" stroke="#ffffff" strokeWidth="12" />
                <line x1="0" y1="40" x2="100%" y2="40" stroke="#f1c40f" strokeWidth="2" strokeDasharray="6 4" />
                <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#ffffff" strokeWidth="14" />
                {/* Residential Streets */}
                <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#ffffff" strokeWidth="6" />
                <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#ffffff" strokeWidth="6" />
                <line x1="0" y1="120" x2="100%" y2="120" stroke="#ffffff" strokeWidth="8" />
                {/* Landmark Labels */}
                <text x="12%" y="28%" fontSize="9" fill="#15803d" fontWeight="bold">Botanical Sanctuary Park</text>
                <text x="68%" y="60%" fontSize="9" fill="#15803d" fontWeight="bold">Eco Nursery Reserve</text>
                <text x="48%" y="25%" fontSize="9" fill="#475569" fontWeight="bold">Grand Palm Avenue</text>
              </svg>

              {/* Draggable/Clickable Google Map Pin */}
              <div 
                className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
                style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap mb-0.5 border border-white">
                    📍 {homeName || 'Delivery Pin'}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <MapPin size={16} />
                  </div>
                  <div className="w-3 h-1.5 bg-black/30 rounded-full blur-[1px] mt-0.5" />
                </div>
              </div>

              {/* Map Footer Overlay Hint */}
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-md text-[11px] text-slate-600 flex items-center justify-between border border-slate-200">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-sky-600" />
                  <span>Click anywhere on the map to drop the delivery marker</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {pinPos.x.toFixed(1)}°E, {pinPos.y.toFixed(1)}°N
                </span>
              </div>
            </div>
          </div>

          {/* ADDRESS TAG SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Address Category / Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: 'Home' as AddressTag, icon: Home },
                { tag: 'Office' as AddressTag, icon: Briefcase },
                { tag: 'Villa' as AddressTag, icon: Building },
                { tag: 'Studio' as AddressTag, icon: Compass },
                { tag: 'Other' as AddressTag, icon: MapPin }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = tag === item.tag;
                return (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setTag(item.tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                      isSelected 
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{item.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DETAILED STREET & HOME INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name of Home / Villa / Flat No. <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                placeholder="e.g. Silver Oak Residence, Flat 402"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Name / Road / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="e.g. 14th Main Road, Indiranagar"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Nearby Feature
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Metro Pillar 42, Near Botanical Garden Gate"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient / Patron Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone for Delivery
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* DEFAULT CHECKBOX */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="font-medium">Set as primary default address for all commissions</span>
            </label>
          </div>

          {/* FORM ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check size={14} />
              <span>Save Address</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
