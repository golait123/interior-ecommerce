import React, { useState } from 'react';
import { Order, OrderItem, ordersApi } from '../api/orders';
import { 
  Leaf, 
  Layers, 
  MapPin, 
  Package, 
  Truck, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
  onStatusChange?: (orderId: string, status: string) => void;
  onOrderUpdated?: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  CONFIRMED: 'badge-blue',
  PROCESSING: 'badge-indigo',
  SHIPPED: 'badge-purple',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
};

export function OrdersTable({ orders, showActions, onStatusChange, onOrderUpdated }: OrdersTableProps) {
  // Modal / Drawer state for customizing item tracking
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

  // Form state for editing customization tracking fields
  const [editFulfillmentStatus, setEditFulfillmentStatus] = useState<string>('');
  const [editTrackingNumber, setEditTrackingNumber] = useState<string>('');
  const [editNurseryNotes, setEditNurseryNotes] = useState<string>('');
  const [editDispatchEta, setEditDispatchEta] = useState<string>('');
  const [editAdjustments, setEditAdjustments] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleOpenCustomizationModal = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    const cust = item.customization || {};
    setEditFulfillmentStatus(cust.fulfillmentStatus || 'Commission Confirmed');
    setEditTrackingNumber(cust.trackingNumber || '');
    setEditNurseryNotes(cust.nurseryNotes || '');
    setEditDispatchEta(cust.dispatchEta || '3–5 Days');
    setEditAdjustments(cust.adjustments || '');
  };

  const handleSaveCustomization = async () => {
    if (!selectedOrder || !selectedItem) return;

    setIsSaving(true);
    try {
      const updatedFields = {
        fulfillmentStatus: editFulfillmentStatus,
        trackingNumber: editTrackingNumber,
        nurseryNotes: editNurseryNotes,
        dispatchEta: editDispatchEta,
        adjustments: editAdjustments
      };

      await ordersApi.updateItemCustomization(selectedOrder.id, selectedItem.id, updatedFields);
      toast.success('✨ Customization & nursery tracking updated successfully!');
      
      // Update local item customization state
      setSelectedItem(prev => prev ? {
        ...prev,
        customization: { ...prev.customization, ...updatedFields }
      } : null);

      if (onOrderUpdated) {
        onOrderUpdated();
      }
      setSelectedOrder(null);
      setSelectedItem(null);
    } catch {
      toast.error('Failed to update customization. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!orders?.length) return <div className="empty-state">No orders found.</div>;

  return (
    <div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Destination (City, State)</th>
              <th>Date</th>
              <th>Items & Specs</th>
              <th>Total</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const hasBespokeNursery = o.items?.some(i => i.customization?.spaceName || i.customization?.bespokeType === 'Nursery Architectural Commission');
              const hasCustomMural = o.items?.some(i => i.customization?.wallpaperName || i.customization?.billableAreaSqFt);

              return (
                <tr key={o.id}>
                  <td className="font-semibold">
                    <div>{o.orderNumber}</div>
                    {hasBespokeNursery && (
                      <span className="badge badge-green text-[10px] mt-1 inline-flex items-center gap-1">
                        <Leaf size={10} /> Bespoke Nursery
                      </span>
                    )}
                    {hasCustomMural && (
                      <span className="badge badge-blue text-[10px] mt-1 inline-flex items-center gap-1">
                        <Layers size={10} /> Made-to-Measure
                      </span>
                    )}
                  </td>
                  <td>
                    {o.user ? (
                      <div>
                        <span className="font-medium text-sm">{o.user.name}</span>
                        <span className="text-xs text-muted block">{o.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted text-sm">Customer</span>
                    )}
                  </td>
                  <td>
                    {o.address ? (
                      <span className="text-sm font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--accent)' }}>📍</span> {o.address.city}, {o.address.state}
                      </span>
                    ) : (
                      <span className="text-muted text-xs">Standard Shipping</span>
                    )}
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{o.items?.length || 0} items</div>
                      {o.items?.map(it => (
                        <div key={it.id} className="text-xs text-muted flex items-center justify-between gap-2">
                          <span className="truncate max-w-[180px]">
                            {it.customization?.spaceName ? `🌿 ${it.customization.spaceName}` : it.product?.name}
                          </span>
                          {it.customization && (
                            <button
                              type="button"
                              onClick={() => handleOpenCustomizationModal(o, it)}
                              className="text-[11px] text-[#0f492c] hover:underline font-semibold flex items-center gap-1 bg-[#f0fdf4] px-1.5 py-0.5 rounded border border-[#bbf7d0]"
                              title="Customize specs and tracking"
                            >
                              <Edit3 size={10} /> Track/Edit
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-bold text-dark font-mono">₹{o.total}</td>
                  <td>
                    <span className={`badge ${statusColors[o.status] || 'badge-gray'}`}>
                      {o.status}
                    </span>
                  </td>
                  {showActions && (
                    <td>
                      <select 
                        className="select select-sm" 
                        value={o.status}
                        onChange={(e) => onStatusChange?.(o.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* STORE MANAGER & ADMIN CUSTOMIZATION & TRACKING MODAL                       */}
      {/* ========================================================================= */}
      {selectedOrder && selectedItem && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid #dce8dd',
              padding: 24
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #edf4ee', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0f492c', letterSpacing: '0.06em' }}>
                  Store Manager & Admin Tracking Portal
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Order #{selectedOrder.orderNumber} — Item Customization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedOrder(null); setSelectedItem(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer & Destination Summary */}
            <div style={{ backgroundColor: '#f8faf8', padding: 14, borderRadius: 12, border: '1px solid #e2ede4', marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span><strong>Customer:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})</span>
                <span><strong>Total:</strong> ₹{selectedOrder.total}</span>
              </div>
              {selectedOrder.address && (
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  📍 <strong>Delivery Address:</strong> {selectedOrder.address.line1}, {selectedOrder.address.city}, {selectedOrder.address.state} — {selectedOrder.address.postalCode}
                </div>
              )}
            </div>

            {/* Configured Item Details */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f2c1d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClipboardList size={15} color="#0f492c" />
                <span>Client Configured Specifications</span>
              </h4>

              {selectedItem.customization ? (
                <div style={{ fontSize: 12, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Living Space:</span>
                    <strong>{selectedItem.customization.spaceName || 'Custom'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Dimensions / Area:</span>
                    <strong>{selectedItem.customization.dimensions || `${selectedItem.customization.width}×${selectedItem.customization.height} ft`}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Botanical Plant Pack:</span>
                    <strong>{selectedItem.customization.plantPack || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Planter Pottery:</span>
                    <strong>{selectedItem.customization.planterType || 'N/A'}</strong>
                  </div>
                  {selectedItem.customization.includedPlants && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Included Botanical Species:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                        {selectedItem.customization.includedPlants.map((p: string, idx: number) => (
                          <span key={idx} style={{ fontSize: 10.5, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4 }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.customization.addonsSelected?.length > 0 && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Care Add-ons Selected:</span>
                      <span style={{ color: '#0f492c', fontWeight: 600 }}>{selectedItem.customization.addonsSelected.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Unit Price / Item Subtotal:</span>
                    <strong style={{ color: '#0f492c', fontFamily: 'monospace' }}>₹{selectedItem.unitPrice}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Destination PIN:</span>
                    <strong>{selectedItem.customization.shippingPincode || selectedOrder.address?.postalCode || 'Pan-India'}</strong>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#64748b' }}>No custom specifications for this piece.</p>
              )}
            </div>

            {/* Editable Fields for Store Manager and Admin Tracking */}
            <div style={{ borderTop: '1px solid #edf4ee', paddingTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f492c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={15} color="#0f492c" />
                <span>Customizable Tracking Fields (Manager & Admin Editable)</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#334155', display: 'block', marginBottom: 4 }}>
                    Nursery / Fabrication Stage
                  </label>
                  <select
                    value={editFulfillmentStatus}
                    onChange={(e) => setEditFulfillmentStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="Commission Confirmed">Commission Confirmed</option>
                    <option value="Acclimating at Polyhouse">Acclimating at Polyhouse</option>
                    <option value="Potted & Root-Treated">Potted & Root-Treated</option>
                    <option value="Packaging with Moisture Locks">Packaging with Moisture Locks</option>
                    <option value="Dispatched for White-Glove Transit">Dispatched for White-Glove Transit</option>
                    <option value="Delivered & Installed">Delivered & Installed</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#334155', display: 'block', marginBottom: 4 }}>
                    Courier AWB / Delivery Tracking #
                  </label>
                  <input
                    type="text"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-99201948"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#334155', display: 'block', marginBottom: 4 }}>
                    Dispatch / Delivery ETA
                  </label>
                  <input
                    type="text"
                    value={editDispatchEta}
                    onChange={(e) => setEditDispatchEta(e.target.value)}
                    placeholder="e.g. 3–5 Business Days"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#334155', display: 'block', marginBottom: 4 }}>
                    Plant / Pot Custom Adjustments
                  </label>
                  <input
                    type="text"
                    value={editAdjustments}
                    onChange={(e) => setEditAdjustments(e.target.value)}
                    placeholder="e.g. Upgraded to Ivory Glazed Ceramic per phone call"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#334155', display: 'block', marginBottom: 4 }}>
                  Nursery Manager Notes & Acclimation Log
                </label>
                <textarea
                  rows={3}
                  value={editNurseryNotes}
                  onChange={(e) => setEditNurseryNotes(e.target.value)}
                  placeholder="Record moisture levels, polyhouse inspection details, or special handling notes visible to customer."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, resize: 'vertical' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setSelectedOrder(null); setSelectedItem(null); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCustomization}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0f492c',
                    color: '#ffffff',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Customization & Tracking'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
