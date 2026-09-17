import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface Props {
  pricePerSqFt?: string | null;
  product?: Product;
}

export function WallpaperCalculator({ pricePerSqFt = '5.00', product }: Props) {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(8);
  const [unit, setUnit] = useState('ft');
  const [wastage, setWastage] = useState(10);
  const [walls, setWalls] = useState(1);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const calculateArea = () => {
    let w = width;
    let h = height;
    if (unit === 'in') { w /= 12; h /= 12; }
    else if (unit === 'm') { w *= 3.28084; h *= 3.28084; }
    else if (unit === 'cm') { w *= 0.0328084; h *= 0.0328084; }
    
    const baseArea = w * h * walls;
    const withWastage = baseArea * (1 + wastage / 100);
    const materialCost = withWastage * Number(pricePerSqFt || 0);
    const tax = materialCost * 0.18;
    return {
      baseArea: baseArea.toFixed(2),
      billableArea: withWastage.toFixed(2),
      materialCost: materialCost.toFixed(2),
      tax: tax.toFixed(2),
      total: (materialCost + tax).toFixed(2)
    };
  };

  const results = calculateArea();

  const handleAddToCart = async () => {
    if (!product) {
      navigate('/#shop'); // or somewhere to select product
      return;
    }
    try {
      await addItem(product.id, 1, { width, height, unit, walls, wastage, ...results });
      toast.success('Custom dimensions added to cart!');
    } catch (e) {
      toast.error('Failed to add to cart. Please log in.');
    }
  };

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <Calculator size={24} />
        <h3>Custom Wall Calculator</h3>
      </div>
      
      <div className="calculator-grid">
        <div className="form-group">
          <label className="form-label">Width</label>
          <input type="number" className="input" value={width} onChange={e => setWidth(Number(e.target.value))} min={1} />
        </div>
        <div className="form-group">
          <label className="form-label">Height</label>
          <input type="number" className="input" value={height} onChange={e => setHeight(Number(e.target.value))} min={1} />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="select" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value="ft">Feet</option>
            <option value="in">Inches</option>
            <option value="m">Meters</option>
            <option value="cm">Centimeters</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Number of Walls</label>
          <input type="number" className="input" value={walls} onChange={e => setWalls(Number(e.target.value))} min={1} />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label d-flex justify-between">
          <span>Wastage Allowance ({wastage}%)</span>
          <small className="text-muted">Recommended: 10-15%</small>
        </label>
        <input type="range" min="0" max="25" step="1" value={wastage} onChange={e => setWastage(Number(e.target.value))} className="slider" />
      </div>

      <div className="calculator-results mt-6">
        <div className="result-row">
          <span>Base Area</span>
          <span>{results.baseArea} sq ft</span>
        </div>
        <div className="result-row">
          <span>Billable Area (incl. wastage)</span>
          <span>{results.billableArea} sq ft</span>
        </div>
        <div className="result-row">
          <span>Material Cost</span>
          <span>₹{results.materialCost}</span>
        </div>
        <div className="result-row">
          <span>Tax (18%)</span>
          <span>₹{results.tax}</span>
        </div>
        <div className="result-row total-row">
          <span>Estimated Total</span>
          <span className="price">₹{results.total}</span>
        </div>
      </div>

      <button className="btn btn-primary w-full mt-4" onClick={handleAddToCart}>
        {product ? 'Add Estimate to Cart' : 'Select Product for Estimate'}
      </button>
    </div>
  );
}
