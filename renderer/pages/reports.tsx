import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ChartBarIcon, DocumentChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface DailyIncome {
  date: string;
  total_transactions: number;
  total_amount: number;
  total_discount: number;
  total_tax: number;
}

const ReportsPage = () => {
  const [dailyIncome, setDailyIncome] = useState<DailyIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchDailyIncome = async () => {
    try {
      setIsLoading(true);
      const result = await window.electron.getDailyIncome();
      if (result.success) {
        setDailyIncome(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch daily income');
      }
    } catch (error) {
      console.error('Error fetching daily income:', error);
      toast.error('Failed to load income data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyIncome();
  }, []);

  const calculateTotals = () => {
    return dailyIncome.reduce((acc, day) => ({
      transactions: acc.transactions + day.total_transactions,
      amount: acc.amount + day.total_amount,
      discount: acc.discount + day.total_discount,
      tax: acc.tax + day.total_tax
    }), { transactions: 0, amount: 0, discount: 0, tax: 0 });
  };

  const totals = calculateTotals();

  return (
    <Layout>
      <Head>
        <title>Reports - POS System</title>
      </Head>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and analyze your business performance with detailed reports
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">Rs. {totals.amount.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                    <dd className="text-lg font-semibold text-gray-900">{totals.transactions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tax</dt>
                    <dd className="text-lg font-semibold text-gray-900">Rs. {totals.tax.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Discounts</dt>
                    <dd className="text-lg font-semibold text-gray-900">Rs. {totals.discount.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Income Table */}
        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-gray-900">Daily Income Report</h2>
              <p className="mt-2 text-sm text-gray-700">
                A detailed list of daily transactions and revenue.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transactions</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Revenue</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tax</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discounts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                            Loading data...
                          </td>
                        </tr>
                      ) : dailyIncome.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        dailyIncome.map((day) => (
                          <tr key={day.date}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                              {new Date(day.date).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {day.total_transactions}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              Rs. {day.total_amount.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              Rs. {day.total_tax.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              Rs. {day.total_discount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ReportsPage;
