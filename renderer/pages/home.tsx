import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { PlusIcon, MinusIcon, TrashIcon, FunnelIcon } from "@heroicons/react/24/outline";

// Categories
const categories = [
  { id: "all", name: "All Products" },
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "food", name: "Food & Beverages" },
  { id: "home", name: "Home & Living" },
  { id: "beauty", name: "Beauty" },
];

// Temporary product data with categories
const products = [
  { id: 1, name: "Smartphone", price: 599.99, category: "electronics", image: "/placeholder.png" },
  { id: 2, name: "Laptop", price: 999.99, category: "electronics", image: "/placeholder.png" },
  { id: 3, name: "T-Shirt", price: 19.99, category: "clothing", image: "/placeholder.png" },
  { id: 4, name: "Jeans", price: 49.99, category: "clothing", image: "/placeholder.png" },
  { id: 5, name: "Coffee Maker", price: 79.99, category: "home", image: "/placeholder.png" },
  { id: 6, name: "Blender", price: 39.99, category: "home", image: "/placeholder.png" },
  { id: 7, name: "Soda Pack", price: 5.99, category: "food", image: "/placeholder.png" },
  { id: 8, name: "Chips", price: 3.99, category: "food", image: "/placeholder.png" },
  { id: 9, name: "Face Cream", price: 24.99, category: "beauty", image: "/placeholder.png" },
  { id: 10, name: "Shampoo", price: 9.99, category: "beauty", image: "/placeholder.png" },
  { id: 11, name: "Smart Watch", price: 199.99, category: "electronics", image: "/placeholder.png" },
  { id: 12, name: "Dress", price: 79.99, category: "clothing", image: "/placeholder.png" },
  { id: 13, name: "Bed Sheet", price: 29.99, category: "home", image: "/placeholder.png" },
  { id: 14, name: "Chocolate", price: 4.99, category: "food", image: "/placeholder.png" },
  { id: 15, name: "Lipstick", price: 14.99, category: "beauty", image: "/placeholder.png" },
  { id: 16, name: "Headphones", price: 89.99, category: "electronics", image: "/placeholder.png" },
  { id: 17, name: "Sweater", price: 39.99, category: "clothing", image: "/placeholder.png" },
  { id: 18, name: "Towel Set", price: 19.99, category: "home", image: "/placeholder.png" },
  { id: 19, name: "Energy Drink", price: 2.99, category: "food", image: "/placeholder.png" },
  { id: 20, name: "Perfume", price: 49.99, category: "beauty", image: "/placeholder.png" },
  { id: 21, name: "Product 10", price: 55.99, category: "electronics", image: "/placeholder.png" },
  { id: 22, name: "Product 11", price: 10.99, category: "clothing", image: "/placeholder.png" },
  { id: 23, name: "Product 12", price: 15.99, category: "home", image: "/placeholder.png" },
  { id: 24, name: "Product 13", price: 20.99, category: "food", image: "/placeholder.png" },
  { id: 25, name: "Product 14", price: 25.99, category: "beauty", image: "/placeholder.png" },
  { id: 26, name: "Product 15", price: 30.99, category: "electronics", image: "/placeholder.png" },
  { id: 27, name: "Product 16", price: 35.99, category: "clothing", image: "/placeholder.png" },
  { id: 28, name: "Product 17", price: 40.99, category: "home", image: "/placeholder.png" },
  { id: 29, name: "Product 18", price: 45.99, category: "food", image: "/placeholder.png" },
  { id: 30, name: "Product 19", price: 50.99, category: "beauty", image: "/placeholder.png" },
  { id: 31, name: "Product 20", price: 55.99, category: "electronics", image: "/placeholder.png" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: (typeof products)[0]) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleDiscount = (value: string) => {
    const discount = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
    setDiscountPercent(discount);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  const handlePayment = () => {
    // Handle payment logic
    console.log('Processing payment:', { subtotal, discount: discountAmount, total });
  };

  const handleHold = () => {
    // Handle hold order logic
    console.log('Holding order:', { cart, subtotal, discount: discountAmount, total });
  };

  const handleCancel = () => {
    // Clear the cart
    setCart([]);
    setDiscountPercent(0);
  };

  return (
    <Layout>
      <Head>
        <title>Point of Sale - POS System</title>
      </Head>
      <div className="flex h-full">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          {/* Filter Bar */}
          <div className="sticky top-0 z-10 bg-white p-3 shadow-sm">
            <div className="flex flex-col space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-full px-4 py-1 text-sm font-medium ${
                      selectedCategory === category.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <div className="flex h-28 items-center justify-center bg-gray-50">
                    {/* Replace with actual product image */}
                    <span className="text-3xl text-gray-400">📦</span>
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">${product.price}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 w-full rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="flex h-full w-96 flex-none flex-col bg-white shadow-lg">
          <div className="border-b p-4">
            <h2 className="text-xl font-bold text-gray-900">Cart</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="rounded-md bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="rounded-md bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-md bg-red-100 p-1 text-red-600 hover:bg-red-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t p-4">
            {cart.length > 0 ? (
              <div className="space-y-4">
                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Discount Input */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Discount (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => handleDiscount(e.target.value)}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm text-gray-900"
                    />
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount Amount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handlePayment}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Pay
                  </button>
                  <button
                    onClick={handleHold}
                    className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                  >
                    Hold
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">Cart is empty</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;
