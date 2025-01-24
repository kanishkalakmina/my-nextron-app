import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Order {
  ref: string;
  total: number;
  items: number;
  time: string;
}

export default function OrdersPage() {
  // Sample orders data
  const orders: Order[] = [
    {
      ref: "1",
      total: 212.40,
      items: 1,
      time: "1/22/2025, 5:29:34 PM"
    },
    {
      ref: "2",
      total: 424.80,
      items: 2,
      time: "1/22/2025, 5:31:25 PM"
    },
    {
      ref: "3",
      total: 672.60,
      items: 4,
      time: "1/22/2025, 5:31:37 PM"
    },
    {
      ref: "4",
      total: 865.00,
      items: 5,
      time: "1/22/2025, 5:31:45 PM"
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Open Orders</title>
      </Head>

      <div className="p-6 h-screen flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Open Orders</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search order by reference"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Orders Grid with Scrollbar */}
        <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <div key={order.ref} className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800">Ref: {order.ref}</span>
                  <span className="text-gray-600">Items: {order.items}</span>
                </div>
                <div>
                  <div className="text-gray-700">Total: RS. {order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Time: {order.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
