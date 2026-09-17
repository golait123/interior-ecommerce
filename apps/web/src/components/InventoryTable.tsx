import React from 'react';
import { InventoryRow } from '../api/inventory';

interface InventoryTableProps {
  inventory: InventoryRow[];
  onMutate?: (productId: string, type: string) => void;
}

export function InventoryTable({ inventory, onMutate }: InventoryTableProps) {
  if (!inventory?.length) return <div className="empty-state">No inventory records found.</div>;

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product / SKU</th>
            <th>Location</th>
            <th>Total</th>
            <th>Reserved</th>
            <th>Damaged</th>
            <th>Available</th>
            <th>Status</th>
            {onMutate && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {inventory.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="font-medium">{row.product?.name}</div>
                <small className="text-muted">{row.product?.sku}</small>
              </td>
              <td>{row.warehouseLocation || 'Main'}</td>
              <td>{row.totalQuantity}</td>
              <td>{row.reservedQuantity}</td>
              <td>{row.damagedQuantity}</td>
              <td className="font-medium">{row.available}</td>
              <td>
                <span className={`badge ${row.isLowStock ? 'badge-orange' : 'badge-green'}`}>
                  {row.isLowStock ? 'Low Stock' : 'In Stock'}
                </span>
              </td>
              {onMutate && (
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => onMutate(row.productId, 'STOCK_IN')}>In</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onMutate(row.productId, 'STOCK_OUT')}>Out</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onMutate(row.productId, 'DAMAGE')}>Dmg</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
