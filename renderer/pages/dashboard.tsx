import React, { useState } from 'react';
import Head from 'next/head';
import { 
  MagnifyingGlassIcon, 
  UserPlusIcon, 
  CreditCardIcon,
  HandRaisedIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const DashboardPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([
    { id: "all", name: "All" },
  ]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discountValue, setDiscountValue] = useState("0");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Sample products (replace with your actual products data)
  const products = [
    { id: '1', name: 'Berry Mojito', price: 120.00 },
    { id: '2', name: 'Chicken Pasta', price: 180.00 },
    { id: '3', name: 'Berry Mojito', price: 120.00 },
    { id: '4', name: 'Chicken Pasta', price: 180.00 },
    { id: '5', name: 'Berry Mojito', price: 120.00 },
    { id: '6', name: 'Chicken Pasta', price: 180.00 },
    { id: '7', name: 'Berry Mojito', price: 120.00 },
    { id: '8', name: 'Chicken Pasta', price: 180.00 },
    { id: '9', name: 'Berry Mojito', price: 120.00 },
    { id: '10', name: 'Chicken Pasta', price: 180.00 },
  ];

  const addToOrder = (product: typeof products[0]) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = (subtotal * (parseFloat(discountValue) || 0)) / 100;
  
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * 0.18; // 18% tax
  const total = afterDiscount + tax;

  return (
    <Layout>
      <Head>
        <title>Point of Sale</title>
      </Head>
      
      <div className="flex h-screen overflow-hidden">
        {/* Left Side - Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Categories */}
          <div className="p-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    category.id === activeCategory
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid with Side Scrollbar */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="h-full overflow-y-auto pr-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#E5E7EB transparent'
              }}
            >
              <div className="grid grid-cols-4 gap-4 p-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => addToOrder(product)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100"></div>
                    <div className="p-3">
                      <h3 className="text-[15px] font-medium text-gray-900">{product.name}</h3>
                      <p className="text-blue-500 font-medium mt-1">Rs. {product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Details */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <UserPlusIcon className="h-5 w-5" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* Order Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-blue-500">Rs. {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, -1);
                    }}
                    className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 w-8 h-8 flex items-center justify-center"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, 1);
                    }}
                    className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 w-8 h-8 flex items-center justify-center"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="p-1 rounded bg-red-500 text-white hover:bg-red-600 w-8 h-8 flex items-center justify-center"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                <div className="flex items-center w-32">
                  <input
                    type="number"
                    className="w-full text-right border rounded py-1 px-2"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              {parseFloat(discountValue) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Amount:</span>
                  <span>-Rs. {(subtotal * (parseFloat(discountValue) || 0) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button className="flex items-center justify-center gap-2 bg-[#4CAF50] text-white py-2 px-4 rounded hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path d="M3 10h18M7 15h2m2 0h2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pay
                </button>
                <button className="flex items-center justify-center gap-2 bg-[#26A69A] text-white py-2 px-4 rounded hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <rect x="7" y="5" width="3" height="14" fill="white" rx="0.5"/>
                    <rect x="14" y="5" width="3" height="14" fill="white" rx="0.5"/>
                  </svg>
                  Hold
                </button>
                <button className="flex items-center justify-center gap-2 bg-[#F44336] text-white py-2 px-4 rounded hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path d="M6 6l12 12M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Cancel
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 flex items-center justify-center space-x-1">
                <CreditCardIcon className="h-5 w-5" />
                <span>Pay</span>
              </button>
              <button className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 flex items-center justify-center space-x-1">
                <HandRaisedIcon className="h-5 w-5" />
                <span>Hold</span>
              </button>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center justify-center space-x-1">
                <XMarkIcon className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
