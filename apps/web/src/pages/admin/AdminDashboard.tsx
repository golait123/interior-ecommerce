import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, FinancialAnalyticsResponse } from '../../api/admin';
import { AdminLayout } from './AdminLayout';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts';
import { 
  DollarSign, TrendingUp, Calendar, Download, FileSpreadsheet, 
  Receipt, ArrowUpRight, Percent, ShoppingBag, Users, CheckCircle, 
  AlertCircle, ShieldCheck, Layers, Landmark, Filter, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<'monthly' | 'quarterly' | 'annual' | 'categories'>('monthly');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Fetch complete financial analytics
  const { data: fin, isLoading, refetch, isFetching } = useQuery<FinancialAnalyticsResponse>({
    queryKey: ['admin-financial-analytics', selectedYear],
    queryFn: () => adminApi.financialAnalytics(selectedYear),
  });

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await adminApi.downloadCsvDirect(selectedYear);
      toast.success(`Financial Report for ${selectedYear} downloaded successfully (.csv)!`);
    } catch (err: any) {
      toast.error('Failed to export CSV report');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = fin?.summary;
  const annual = fin?.annual || [];
  const quarterly = fin?.quarterly || [];
  const monthly = fin?.monthly || [];
  const categoryBreakdown = fin?.categoryBreakdown || [];
  const recentTransactions = fin?.recentFinancialTransactions || [];

  // Current month financial entry
  const currentMonthIdx = new Date().getMonth();
  const currentMonthData = monthly[currentMonthIdx] || { revenue: 0, orders: 0, aov: 0 };

  // Current quarter data
  const currentQuarterIdx = Math.floor(currentMonthIdx / 3);
  const currentQuarterData = quarterly[currentQuarterIdx] || { revenue: 0, orders: 0, sharePercent: 0 };

  // Colors for category distribution chart
  const COLORS = ['#8c6f52', '#2d2a27', '#c4a982', '#4a6b82', '#6b824a', '#824a6b'];

  return (
    <AdminLayout>
      {/* 1. Executive Top Bar & Actions */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
              <Landmark size={13} />
              <span>Revenue Management System</span>
            </span>
            <span className="text-xs text-muted font-medium">Fiscal Year {selectedYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d2a27]">Financial & Revenue Dashboard</h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Annual, quarterly, and monthly revenue statements, average revenue values (AOV/ARPU), and tax analytics.
          </p>
        </div>

        {/* Action Controls: Year selector + CSV Export button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#ded9d0] rounded-lg px-2.5 py-1.5 text-xs font-semibold">
            <Calendar size={14} className="text-[#8c6f52]" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-semibold text-[#2d2a27] focus:outline-none cursor-pointer"
            >
              <option value={2026}>FY 2026</option>
              <option value={2025}>FY 2025</option>
              <option value={2024}>FY 2024</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn btn-ghost btn-sm p-2 text-muted hover:text-dark border border-[#ded9d0]"
            title="Refresh Financials"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="btn btn-primary flex items-center gap-2 shadow-xs py-2 px-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>{isExporting ? 'Generating CSV...' : 'Download Report (.csv)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        
        {/* Card 1: Overall Net Revenue */}
        <div className="p-4 bg-white border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6f52]">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#fbf6f0] flex items-center justify-center text-[#8c6f52]">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2d2a27]">
            ₹{Number(summary?.totalNetRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
            <span>Gross: ₹{Number(summary?.totalGrossRevenue || 0).toLocaleString()}</span>
            <span className="text-green-700 font-semibold">{summary?.totalOrdersCount || 0} orders</span>
          </div>
        </div>

        {/* Card 2: Annual FY Revenue */}
        <div className="p-4 bg-white border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-700">Annual Revenue ({selectedYear})</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-green-700">
            ₹{Number(annual.find(a => a.year === selectedYear)?.revenue || summary?.totalNetRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-1">
            Valid Orders: <strong className="text-[#2d2a27]">{annual.find(a => a.year === selectedYear)?.orders || summary?.totalOrdersCount || 0}</strong>
          </div>
        </div>

        {/* Card 3: Quarterly Revenue */}
        <div className="p-4 bg-white border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f2444]">Quarterly Revenue ({currentQuarterData.quarter})</span>
            <div className="w-8 h-8 rounded-lg bg-[#edf4fc] flex items-center justify-center text-[#0f2444]">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#0f2444]">
            ₹{Number(currentQuarterData.revenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
            <span>{currentQuarterData.orders} orders</span>
            <span className="font-semibold text-[#8c6f52]">{currentQuarterData.sharePercent}% of total</span>
          </div>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div className="p-4 bg-white border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b45309]">Monthly Revenue ({currentMonthData.month || 'Current'})</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#b45309]">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#b45309]">
            ₹{Number(currentMonthData.revenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-1">
            Monthly Orders: <strong className="text-[#2d2a27]">{currentMonthData.orders}</strong>
          </div>
        </div>

        {/* Card 5: Average Revenue Metrics */}
        <div className="p-4 bg-white border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Average Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <Percent size={16} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-purple-700">
            ₹{Number(summary?.averageOrderValue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-1">
            <span>AOV: ₹{summary?.averageOrderValue || 0} • ARPU: ₹{summary?.averageRevenuePerCustomer || 0}</span>
          </div>
        </div>

      </div>

      {/* 3. Financial Liabilities & Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-[#faf7f2] border border-[#e8dfd5]">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted font-bold">GST Tax (18%) Collected</div>
          <div className="text-base font-bold text-[#2d2a27] mt-0.5">
            ₹{Number(summary?.totalTaxCollected || 0).toLocaleString()}
          </div>
          <small className="text-muted text-[10px]">Compliant with Indian tax code</small>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Total Discounts Granted</div>
          <div className="text-base font-bold text-[#8c6f52] mt-0.5">
            ₹{Number(summary?.totalDiscounts || 0).toLocaleString()}
          </div>
          <small className="text-muted text-[10px]">Promotional savings to collectors</small>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Daily Average Revenue</div>
          <div className="text-base font-bold text-[#0f2444] mt-0.5">
            ₹{Number(summary?.dailyAverageRevenue || 0).toLocaleString()}
          </div>
          <small className="text-muted text-[10px]">Across active business days</small>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Cancellations & Lost Revenue</div>
          <div className="text-base font-bold text-red-700 mt-0.5">
            {summary?.cancelledOrdersCount || 0} orders (₹{Number(summary?.cancelledRevenueLost || 0).toLocaleString()})
          </div>
          <small className="text-muted text-[10px]">Cancelled orders excluded from net</small>
        </div>
      </div>

      {/* 4. Interactive Visual Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Monthly Revenue Trend Bar & Area */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#e8e4de] rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2d2a27]">Monthly Revenue Progression ({selectedYear})</h3>
              <p className="text-xs text-muted">Complete breakdown of gross and net revenue generated each month.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-[#8c6f52]">
                <span className="w-3 h-3 rounded-sm bg-[#8c6f52] inline-block"></span> Net Revenue (₹)
              </span>
              <span className="flex items-center gap-1 font-medium text-[#c4a982]">
                <span className="w-3 h-3 rounded-sm bg-[#c4a982] inline-block"></span> GST Tax (₹)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8c6f52" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8c6f52" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c4a982" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c4a982" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede8" />
                <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#777' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#777' }} 
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} 
                />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#2d2a27', borderColor: '#2d2a27', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Net Revenue" stroke="#8c6f52" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                <Area type="monotone" dataKey="tax" name="GST 18%" stroke="#c4a982" strokeWidth={1.5} fillOpacity={1} fill="url(#taxGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Quarterly Performance & Category Share */}
        <div className="bg-white p-6 border border-[#e8e4de] rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2d2a27] mb-1">Quarterly Financials</h3>
            <p className="text-xs text-muted mb-4">Volume and revenue share across fiscal quarters.</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede8" />
                  <XAxis dataKey="quarterNum" tickFormatter={(q) => `Q${q}`} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Quarter ${label}`}
                    contentStyle={{ backgroundColor: '#2d2a27', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#8c6f52" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#f0ece4]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Category Revenue Contribution</div>
            <div className="space-y-2">
              {categoryBreakdown.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#2d2a27] truncate max-w-[150px]">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#8c6f52]">₹{cat.revenue.toLocaleString()}</span>
                    <span className="badge badge-gray text-[10px]">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Financial Statements Tabs (Monthly, Quarterly, Annual, Category) */}
      <div className="bg-white border border-[#e8e4de] rounded-xl shadow-xs mb-8">
        <div className="p-4 border-b border-[#e8e4de] flex flex-wrap items-center justify-between gap-3 bg-[#fbf9f6] rounded-t-xl">
          <div className="flex items-center gap-1 bg-[#ede8e1] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'monthly' ? 'bg-white shadow-xs text-[#2d2a27]' : 'text-muted hover:text-dark'
              }`}
            >
              Monthly Revenue ({selectedYear})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quarterly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'quarterly' ? 'bg-white shadow-xs text-[#2d2a27]' : 'text-muted hover:text-dark'
              }`}
            >
              Quarterly Statements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('annual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'annual' ? 'bg-white shadow-xs text-[#2d2a27]' : 'text-muted hover:text-dark'
              }`}
            >
              Annual Statements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'categories' ? 'bg-white shadow-xs text-[#2d2a27]' : 'text-muted hover:text-dark'
              }`}
            >
              Revenue by Category
            </button>
          </div>

          <div className="text-xs text-muted">
            All currency values in <strong className="text-[#2d2a27]">INR (₹)</strong>
          </div>
        </div>

        {/* Tab 1: Monthly Statement */}
        {activeTab === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Orders Count</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">GST Tax (18%)</th>
                  <th className="py-3 px-4">Discounts</th>
                  <th className="py-3 px-4 font-bold text-[#8c6f52]">Net Revenue</th>
                  <th className="py-3 px-4">Avg Order Value (AOV)</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.monthKey} className="border-b hover:bg-[#faf9f7] text-xs">
                    <td className="py-3 px-4 font-semibold text-[#2d2a27]">{m.month}</td>
                    <td className="py-3 px-4 text-muted">{m.year}</td>
                    <td className="py-3 px-4 font-mono">{m.orders}</td>
                    <td className="py-3 px-4 font-mono">₹{m.grossSales.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{m.tax.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{m.discounts.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#8c6f52]">₹{m.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">₹{m.aov.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Quarterly Statement */}
        {activeTab === 'quarterly' && (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
                  <th className="py-3 px-4">Quarter</th>
                  <th className="py-3 px-4">Fiscal Year</th>
                  <th className="py-3 px-4">Orders Volume</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">GST Tax (18%)</th>
                  <th className="py-3 px-4 font-bold text-[#8c6f52]">Net Revenue</th>
                  <th className="py-3 px-4">AOV</th>
                  <th className="py-3 px-4">Annual Share %</th>
                </tr>
              </thead>
              <tbody>
                {quarterly.map((q) => (
                  <tr key={q.quarter} className="border-b hover:bg-[#faf9f7] text-xs">
                    <td className="py-3 px-4 font-semibold text-[#2d2a27]">{q.quarter}</td>
                    <td className="py-3 px-4 text-muted">{q.year}</td>
                    <td className="py-3 px-4 font-mono">{q.orders}</td>
                    <td className="py-3 px-4 font-mono">₹{q.grossSales.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{q.tax.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#8c6f52]">₹{q.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">₹{q.aov.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-blue">{q.sharePercent}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Annual Statement */}
        {activeTab === 'annual' && (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
                  <th className="py-3 px-4">Fiscal Year</th>
                  <th className="py-3 px-4">Orders Volume</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">GST Tax (18%)</th>
                  <th className="py-3 px-4">Discounts Offered</th>
                  <th className="py-3 px-4 font-bold text-[#8c6f52]">Total Net Revenue</th>
                  <th className="py-3 px-4">Average Order Value</th>
                </tr>
              </thead>
              <tbody>
                {annual.map((a) => (
                  <tr key={a.year} className="border-b hover:bg-[#faf9f7] text-xs">
                    <td className="py-3 px-4 font-bold text-[#2d2a27]">FY {a.year}</td>
                    <td className="py-3 px-4 font-mono">{a.orders}</td>
                    <td className="py-3 px-4 font-mono">₹{a.grossSales.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{a.tax.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{a.discounts.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#8c6f52]">₹{a.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">₹{a.aov.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Categories Breakdown */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Orders Count</th>
                  <th className="py-3 px-4 font-bold text-[#8c6f52]">Net Revenue Generated</th>
                  <th className="py-3 px-4">Revenue Contribution</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((c) => (
                  <tr key={c.category} className="border-b hover:bg-[#faf9f7] text-xs">
                    <td className="py-3 px-4 font-semibold text-[#2d2a27]">{c.category}</td>
                    <td className="py-3 px-4 font-mono">{c.itemsSold} pieces</td>
                    <td className="py-3 px-4 font-mono">{c.ordersCount}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#8c6f52]">₹{c.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#8c6f52] h-full" style={{ width: `${c.percentage}%` }}></div>
                        </div>
                        <span className="font-bold text-xs">{c.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Recent Financial Transactions Ledger */}
      <div className="bg-white border border-[#e8e4de] rounded-xl shadow-xs">
        <div className="p-4 border-b border-[#e8e4de] flex flex-wrap items-center justify-between gap-3 bg-[#faf8f5] rounded-t-xl">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2d2a27]">Financial Transactions Ledger</h3>
            <p className="text-xs text-muted">Audited settlement history and invoice subtotals.</p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
          >
            <Download size={13} />
            <span>Export Ledger CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4 font-bold text-[#8c6f52]">Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted text-xs">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-[#faf9f7] text-xs">
                    <td className="py-3 px-4 font-mono font-semibold text-[#2d2a27]">{tx.orderNumber}</td>
                    <td className="py-3 px-4 text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#2d2a27]">{tx.customerName}</div>
                      <div className="text-[10px] text-muted">{tx.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{tx.itemsCount}</td>
                    <td className="py-3 px-4 font-mono">₹{tx.subtotal.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-muted">₹{tx.tax.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#8c6f52]">₹{tx.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        tx.status === 'DELIVERED' ? 'badge-green' : 
                        tx.status === 'PROCESSING' || tx.status === 'CONFIRMED' ? 'badge-blue' : 
                        tx.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${tx.paymentStatus === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
