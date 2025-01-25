import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface HoldOrder {
  id: string;
  reference: string;
  items: OrderItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [holdOrders, setHoldOrders] = useState<HoldOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHoldOrders();
  }, []);

  const loadHoldOrders = async () => {
    const result = await window.electron.getAllHoldOrders();
    if (result.success) {
      setHoldOrders(result.orders);
    }
  };

  const handleRecallOrder = async (order: HoldOrder) => {
    // Pass the order ID and reference along with the items
    router.push({
      pathname: '/dashboard',
      query: { 
        recalledOrder: JSON.stringify(order.items),
        orderId: order.id,
        reference: order.reference
      }
    });
  };

  const filteredOrders = holdOrders.filter(order => 
    order.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Head>
        <title>Open Orders</title>
      </Head>

      <div className="p-6 h-screen flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Hold Orders</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search order by reference"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Orders Grid with Scrollbar */}
        <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    #{order.reference}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{order.total_items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-blue-600">
                      Rs. {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecallOrder(order);
                  }}
                  className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Recall Order
                </button>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No held orders found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
