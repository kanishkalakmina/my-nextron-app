import React from 'react';
import Head from 'next/head';
import { ChartBarIcon, DocumentChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const reports = [
  {
    name: 'Sales Report',
    description: 'View detailed sales analytics and trends',
    icon: CurrencyDollarIcon,
    href: '#',
  },
  {
    name: 'Inventory Report',
    description: 'Track product stock levels and movements',
    icon: DocumentChartBarIcon,
    href: '#',
  },
  {
    name: 'Orders Report',
    description: 'Analyze order patterns and customer behavior',
    icon: ShoppingCartIcon,
    href: '#',
  },
  {
    name: 'Performance Report',
    description: 'Monitor business performance metrics',
    icon: ChartBarIcon,
    href: '#',
  },
];

const ReportsPage = () => {
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

        {/* Reports Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {reports.map((report) => (
            <div
              key={report.name}
              className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <report.icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Charts */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Sales Overview</h3>
              <div className="mt-2 h-64 rounded-lg bg-gray-50 p-4">
                <p className="text-center text-gray-500">Sales chart will be implemented here</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Top Products</h3>
              <div className="mt-2 h-64 rounded-lg bg-gray-50 p-4">
                <p className="text-center text-gray-500">Products chart will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ReportsPage;
