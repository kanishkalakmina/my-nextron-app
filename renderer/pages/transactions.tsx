import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  order_id: string;
  payment_date: string;
  total: number;
  change_amount: number;
  payment_method: string;
  cashier: string;
}

interface DateState {
  startDate: Date;
  endDate: Date;
  key: string;
}

export default function Transactions() {
  const [selectedInvoice, setSelectedInvoice] = useState('All');
  const [selectedCashier, setSelectedCashier] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
  const [dateState, setDateState] = useState<DateState[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions...");
        const result = await window.electron.getAllPayments();
        console.log("Payment result:", result);

        if (result.success && result.data) {
          const formattedTransactions = result.data.map(payment => ({
            order_id: payment.order_id,
            payment_date: new Date(payment.payment_date).toLocaleString(),
            total: Number(payment.total),
            change_amount: Number(payment.change_amount),
            payment_method: payment.payment_method,
            cashier: 'Cashier 1'
          }));

          console.log("Formatted transactions:", formattedTransactions);
          setAllTransactions(formattedTransactions);
          setFilteredTransactions(formattedTransactions);
          
          const uniqueOrderIds = [...new Set(formattedTransactions.map(t => t.order_id))];
          setOrderIds(uniqueOrderIds);
        } else {
          console.error("Failed to fetch transactions:", result.error);
          throw new Error(result.error || 'Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const filterTransactions = () => {
      let filtered = [...allTransactions];

      // Apply all filters at once
      filtered = filtered.filter(transaction => {
        const matchesInvoice = selectedInvoice === 'All' || transaction.order_id === selectedInvoice;
        const matchesCashier = selectedCashier === 'All' || transaction.cashier === selectedCashier;
        const matchesPaymentMethod = selectedPaymentMethod === 'All' || 
          transaction.payment_method.toLowerCase() === selectedPaymentMethod.toLowerCase();
        
        // Date range filter
        const transactionDate = new Date(transaction.payment_date);
        const { startDate, endDate } = dateState[0];
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        const matchesDate = transactionDate >= startDate && transactionDate <= endOfDay;

        return matchesInvoice && matchesCashier && matchesPaymentMethod && matchesDate;
      });

      setFilteredTransactions(filtered);
    };

    filterTransactions();
  }, [selectedInvoice, selectedCashier, selectedPaymentMethod, dateState, allTransactions]);

  const clearFilters = () => {
    setSelectedInvoice('All');
    setSelectedCashier('All');
    setSelectedPaymentMethod('All');
    setDateState([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }]);
    setFilteredTransactions(allTransactions);
  };

  const formatDateRange = () => {
    const { startDate, endDate } = dateState[0];
    // Format: M/D/YYYY
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    return `${formatDate(startDate)}-${formatDate(endDate)}`;
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Transaction Report', 14, 15);
      
      // Add date range
      doc.setFontSize(10);
      doc.text(`Date Range: ${formatDateRange()}`, 14, 25);
      
      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary:', 14, 35);
      doc.text(`Total Sales: Rs.${filteredTransactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)}`, 14, 42);
      doc.text(`Total Orders: ${filteredTransactions.length}`, 14, 49);
      
      // Add filters if any are active
      const activeFilters = [];
      if (selectedInvoice !== 'All') activeFilters.push(`Invoice: ${selectedInvoice}`);
      if (selectedCashier !== 'All') activeFilters.push(`Cashier: ${selectedCashier}`);
      if (selectedPaymentMethod !== 'All') activeFilters.push(`Payment Method: ${selectedPaymentMethod}`);
      
      if (activeFilters.length > 0) {
        doc.text('Applied Filters:', 14, 56);
        activeFilters.forEach((filter, index) => {
          doc.text(filter, 14, 63 + (index * 7));
        });
      }

      // Add transactions table
      const tableStartY = 70 + (activeFilters.length * 7);
      
      autoTable(doc, {
        startY: tableStartY,
        head: [['Invoice', 'Date', 'Total', 'Change', 'Method', 'Cashier']],
        body: filteredTransactions.map(t => [
          t.order_id,
          t.payment_date,
          `Rs.${t.total.toFixed(2)}`,
          `Rs.${t.change_amount.toFixed(2)}`,
          t.payment_method,
          t.cashier
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // Save the PDF
      const fileName = `transactions_${formatDateRange().replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <div className="flex gap-4">
              <button 
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-600"
              >
                Clear Filters
              </button>
              <button 
                onClick={exportToPDF}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600"
              >
                EXPORT TO PDF
              </button>
            </div>
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
                {orderIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
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
                <option value="Cashier 1">Cashier 1</option>
              </select>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Cashier
              </label>
            </div>

            <div className="relative">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded-md appearance-none"
              >
                <option value="All">All</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Payment Method
              </label>
            </div>

            <div className="relative">
              <div
                className="w-full p-2 border rounded-md cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <span className="text-sm text-gray-600">{formatDateRange()}</span>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <label className="absolute -top-2.5 left-2 bg-gray-100 px-1 text-sm text-gray-600">
                Date Range
              </label>
              {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md">
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateState([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateState}
                    className="border rounded-md"
                  />
                  <div className="p-2 border-t bg-white">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h3>
            <p className="text-2xl font-semibold text-red-600">
              Rs.{filteredTransactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-2xl font-semibold text-green-600">{filteredTransactions.length}</p>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payment_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs.{transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs.{transaction.change_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.cashier}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {filteredTransactions.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
