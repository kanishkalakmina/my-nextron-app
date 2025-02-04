import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { CurrencyDollarIcon, ShoppingCartIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SalesData {
  product_name: string;
  order_id: string;
  quantity: number;
  price: number;
  created_at: string;
  cashier: string;
}

type DateRangeType = 'daily' | 'monthly' | 'yearly';
type ViewType = 'table' | 'chart';

const SalesReport = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [rangeType, setRangeType] = useState<DateRangeType>('daily');
  const [viewType, setViewType] = useState<ViewType>('table');

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const result = await window.electron.getSalesReport({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      if (result.success) {
        setSalesData(result.report);
      } else {
        setError(result.error || 'Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (type: DateRangeType) => {
    const today = new Date();
    let start, end;

    switch (type) {
      case 'monthly':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'yearly':
        start = format(startOfYear(today), 'yyyy-MM-dd');
        end = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      default: // daily
        start = format(today, 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
    }

    setRangeType(type);
    setDateRange({ start, end });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs.${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalSales = salesData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalOrders = new Set(salesData.map(item => item.order_id)).size;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue
    };
  };

  const summary = calculateSummary();

  // Prepare data for charts
  const prepareChartData = () => {
    const dataMap = new Map();
    
    salesData.forEach(sale => {
      const date = format(new Date(sale.created_at), 'yyyy-MM-dd');
      const total = sale.quantity * sale.price;
      
      if (dataMap.has(date)) {
        const existing = dataMap.get(date);
        dataMap.set(date, {
          date,
          totalSales: existing.totalSales + total,
          orderCount: existing.orderCount + 1,
          itemCount: existing.itemCount + sale.quantity,
          averageOrderValue: (existing.totalSales + total) / (existing.orderCount + 1)
        });
      } else {
        dataMap.set(date, {
          date,
          totalSales: total,
          orderCount: 1,
          itemCount: sale.quantity,
          averageOrderValue: total
        });
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = prepareChartData();

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

  const renderChartView = () => {
    // Prepare data for pie chart
    const pieChartData = salesData.reduce((acc, sale) => {
      const productName = sale.product_name;
      const total = sale.quantity * sale.price;
      
      const existingProduct = acc.find(item => item.name === productName);
      if (existingProduct) {
        existingProduct.value += total;
      } else {
        acc.push({ name: productName, value: total });
      }
      
      return acc;
    }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .slice(0, 5); // Take top 5 products

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Analytics Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Sales Analytics</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Amount (Rs)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Count', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Total Sales' || name === 'Average Order Value') {
                      return [`Rs.${Number(value).toFixed(2)}`, name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                
                {/* Bar for Total Sales */}
                <Bar 
                  yAxisId="left"
                  dataKey="totalSales" 
                  name="Total Sales" 
                  fill="#4F46E5"
                  opacity={0.8}
                />
                
                {/* Line for Average Order Value */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="averageOrderValue"
                  name="Average Order Value"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                
                {/* Line for Order Count */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  name="Order Count"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                
                {/* Line for Item Count */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="itemCount"
                  name="Items Sold"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Top 5 Products by Sales</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={12}
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                  outerRadius={150}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    'Sales Amount'
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend for top products */}
          <div className="mt-4 space-y-2">
            {pieChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesData.length / itemsPerPage);

  // Add pagination controls
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{indexOfFirstItem + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, salesData.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{salesData.length}</span>{' '}
                results
              </p>
            </div>
            <div className="flex-shrink-0">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">First</span>
                  ⟪
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Last</span>
                  ⟫
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto px-1">
      <div className="space-y-6">
        {/* Summary Cards - Now before filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(summary.totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-lg font-semibold text-green-600">{summary.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-full">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                <p className="text-lg font-semibold text-purple-600">{formatCurrency(summary.averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="sticky top-0 z-10 bg-gray-100 pt-2 pb-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleRangeChange('daily')}
                  className={`px-4 py-2 rounded-md ${
                    rangeType === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => handleRangeChange('monthly')}
                  className={`px-4 py-2 rounded-md ${
                    rangeType === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleRangeChange('yearly')}
                  className={`px-4 py-2 rounded-md ${
                    rangeType === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
              {/* View Toggle */}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={() => setViewType('table')}
                  className={`px-4 py-2 rounded-md ${
                    viewType === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewType('chart')}
                  className={`px-4 py-2 rounded-md ${
                    viewType === 'chart'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chart View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view type */}
        {viewType === 'table' ? (
          <div className="bg-white rounded-lg shadow relative">
            <div className="overflow-x-auto max-h-[600px]">
              {loading ? (
                <div className="p-6 text-center">Loading sales data...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">{error}</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((sale, index) => (
                      <tr key={`${sale.order_id}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(sale.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(sale.quantity * sale.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pagination outside of overflow container */}
            {!loading && !error && salesData.length > 0 && renderPagination()}
          </div>
        ) : (
          renderChartView()
        )}
      </div>
    </div>
  );
};

export default SalesReport; 