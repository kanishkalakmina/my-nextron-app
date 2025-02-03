import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ChartBarIcon, DocumentChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SalesData {
  dailySales: Array<{
    date: string;
    transaction_count: number;
    total_sales: number;
    total_discounts: number;
    total_tax: number;
  }>;
  productSales: Array<{
    product_id: string;
    product_name: string;
    category_name: string;
    total_quantity: number;
    total_sales: number;
  }>;
  hourlySales: Array<{
    hour: string;
    transaction_count: number;
    total_sales: number;
  }>;
  categorySales: Array<{
    category_name: string;
    transaction_count: number;
    items_sold: number;
    total_sales: number;
  }>;
  salesReport: Array<{
    product_name: string;
    order_id: string;
    quantity: number;
    price: number;
    created_at: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: format(startOfDay(subDays(new Date(), 7)), 'yyyy-MM-dd'),
    end: format(endOfDay(new Date()), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData();
    }
  }, [dateRange, reportType, activeTab]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const result = await window.electron.getSalesReport();
      if (result.success) {
        setSalesData({
          dailySales: [],
          productSales: [],
          hourlySales: [],
          categorySales: [],
          salesReport: result.report || []
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!salesData) return;

    const workbook = XLSX.utils.book_new();

    // Daily Sales Sheet
    const dailySalesWS = XLSX.utils.json_to_sheet(salesData.dailySales);
    XLSX.utils.book_append_sheet(workbook, dailySalesWS, 'Daily Sales');

    // Product Sales Sheet
    const productSalesWS = XLSX.utils.json_to_sheet(salesData.productSales);
    XLSX.utils.book_append_sheet(workbook, productSalesWS, 'Product Sales');

    // Category Sales Sheet
    const categorySalesWS = XLSX.utils.json_to_sheet(salesData.categorySales);
    XLSX.utils.book_append_sheet(workbook, categorySalesWS, 'Category Sales');

    // Save the file
    XLSX.writeFile(workbook, `sales_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    if (!salesData) return;

    const doc = new jsPDF();
    doc.text('Sales Report', 14, 15);
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 25);

    // Add daily sales table
    doc.autoTable({
      head: [['Date', 'Transactions', 'Total Sales', 'Discounts', 'Tax']],
      body: salesData.dailySales.map(row => [
        row.date,
        row.transaction_count,
        row.total_sales.toFixed(2),
        row.total_discounts.toFixed(2),
        row.total_tax.toFixed(2)
      ]),
      startY: 35,
    });

    doc.save(`sales_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'chart' | 'table')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="chart">Charts</option>
              <option value="table">Tables</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : salesData ? (
        <div className="space-y-6">
          {/* Daily Sales Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Daily Sales Overview</h3>
            {viewMode === 'chart' ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_sales" stroke="#8884d8" name="Total Sales" />
                    <Line type="monotone" dataKey="transaction_count" stroke="#82ca9d" name="Transactions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.salesReport.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(row.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.order_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(row.quantity * row.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Sales Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Sales by Category</h3>
            {viewMode === 'chart' ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesData.categorySales}
                      dataKey="total_sales"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {salesData.categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.categorySales.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.items_sold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.total_sales.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales Report Table */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Sales Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.salesReport.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.order_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(row.quantity * row.price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">No sales data available for the selected period.</p>
        </div>
      )}
    </div>
  );

  const renderInventoryReport = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory Reports</h2>
      <div className="space-y-4">
        <p className="text-gray-600">Inventory report content will be implemented here...</p>
      </div>
    </div>
  );

  const renderFinanceReport = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Finance Reports</h2>
      <div className="space-y-4">
        <p className="text-gray-600">Finance report content will be implemented here...</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>Reports - POS System</title>
      </Head>

      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600">View and analyze your business performance</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="sales">Sales Reports</option>
              <option value="inventory">Inventory Reports</option>
              <option value="finance">Finance Reports</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <nav className="flex space-x-4 border-b border-gray-200" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('sales')}
                className={`${
                  activeTab === 'sales'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Sales Reports
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`${
                  activeTab === 'inventory'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Inventory Reports
              </button>

              <button
                onClick={() => setActiveTab('finance')}
                className={`${
                  activeTab === 'finance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Finance Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'sales' && renderSalesReport()}
          {activeTab === 'inventory' && renderInventoryReport()}
          {activeTab === 'finance' && renderFinanceReport()}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
