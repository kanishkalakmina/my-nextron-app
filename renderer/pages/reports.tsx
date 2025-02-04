import React, { useState } from 'react';
import Head from 'next/head';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import SalesReport from '../components/reports/SalesReport';
import InventoryReport from '../components/reports/InventoryReport';
import FinanceReport from '../components/reports/FinanceReport';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <Layout>
      <Head>
        <title>Reports - POS System</title>
      </Head>

      <div className="p-6">
        {/* Page Header */}
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('sales');
                }}
                className={`${
                  activeTab === 'sales'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Sales Reports
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('inventory');
                }}
                className={`${
                  activeTab === 'inventory'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Inventory Reports
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('finance');
                }}
                className={`${
                  activeTab === 'finance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-3 py-2 text-sm font-medium border-b-2`}
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Finance Reports
              </a>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'sales' && <SalesReport />}
          {activeTab === 'inventory' && <InventoryReport />}
          {activeTab === 'finance' && <FinanceReport />}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
