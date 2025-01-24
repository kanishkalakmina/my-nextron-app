import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface Transaction {
  invoice: string;
  date: string;
  total: string;
  paid: string;
  change: string;
  method: string;
  cashier: string;
}

export default function Transactions() {
  const [selectedInvoice, setSelectedInvoice] = useState('All');
  const [selectedCashier, setSelectedCashier] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('January 22, 2025');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sample data
  const transactions: Transaction[] = [
    {
      invoice: '1735928081',
      date: '2025 Jan 03 11:54:25',
      total: 'Rs.2750.00',
      paid: 'Rs.2750.00',
      change: 'Rs.0.00',
      method: 'Card',
      cashier: 'Admin',
    },
    {
      invoice: '1735927845',
      date: '2025 Jan 03 11:40:46',
      total: 'Rs.2035.00',
      paid: 'Rs.2035.00',
      change: 'Rs.0.00',
      method: 'Card',
      cashier: 'Admin',
    },
    {
      invoice: '1735927804',
      date: '2025 Jan 03 11:40:04',
      total: 'Rs.1220.00',
      paid: 'Rs.1220.00',
      change: 'Rs.0.00',
      method: 'Card',
      cashier: 'Admin',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <span>EXPORT TO PDF</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <select
                value={selectedInvoice}
                onChange={(e) => setSelectedInvoice(e.target.value)}
                className="w-full p-2 border rounded-md appearance-none"
              >
                <option value="All">All</option>
                {/* Add more invoice options */}
              </select>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Invoice No
              </label>
            </div>

            <div className="relative">
              <select
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                className="w-full p-2 border rounded-md appearance-none"
              >
                <option value="All">All</option>
                {/* Add more cashier options */}
              </select>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Cashier
              </label>
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md appearance-none"
              >
                <option value="All">All</option>
                {/* Add more status options */}
              </select>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Status
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Date
              </label>
              <CalendarIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h3>
            <p className="text-2xl font-semibold text-red-600">Rs.12,345</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-2xl font-semibold text-green-600">156</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Order</h3>
            <p className="text-2xl font-semibold text-yellow-600">Rs.79.13</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.invoice}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.invoice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.paid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.change}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.cashier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">Showing 1 to 3 of 3 entries</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="ml-2 border rounded-md text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(transactions.length / rowsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(transactions.length / rowsPerPage)}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
