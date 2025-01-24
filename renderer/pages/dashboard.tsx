import React from 'react';
import Head from 'next/head';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, UsersIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const stats = [
  { name: 'Total Revenue', stat: '$0.00', icon: CurrencyDollarIcon },
  { name: 'Total Orders', stat: '0', icon: ShoppingBagIcon },
  { name: 'Total Products', stat: '0', icon: ShoppingBagIcon },
  { name: 'Active Users', stat: '0', icon: UsersIcon },
];

const DashboardPage = () => {
  return (
    <Layout>
      <Head>
        <title>Dashboard - POS System</title>
      </Head>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
            >
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-br from-indigo-50 to-white" />
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </dd>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
              <div className="mt-2">
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    <li className="py-4">
                      <div className="text-center text-gray-500">No recent orders</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default DashboardPage;
