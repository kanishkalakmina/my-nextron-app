import React, { useState, useEffect } from "react";
import Head from "next/head";
import path from "path";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  CreditCardIcon,
  HandRaisedIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  BackspaceIcon,
} from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import PaymentModal from "../components/PaymentModal";
import toast from "react-hot-toast";
import { useIPC } from "../hooks/useIPC";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id?: string;
  image_path?: string;
  stock: number;
  isNA: boolean;
}

const lowStockAnimation = `
  @keyframes borderBlink {
    0% { border-color: #FEE2E2; }
    50% { border-color:rgb(205, 111, 111); }
    100% { border-color: #FEE2E2; }
  }
`;

const DashboardPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All" },
  ]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdReference, setHoldReference] = useState("");
  const [recalledOrderId, setRecalledOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountPad, setShowDiscountPad] = useState(false);
  const [tempDiscount, setTempDiscount] = useState('');

  const { getGeneralSettings } = useIPC();

  // Fetch categories and products when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { success, categories } =
          await window.electron.getAllCategories();
        if (success && categories) {
          setCategories([{ id: "all", name: "All" }, ...categories]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    const loadProducts = async () => {
      try {
        const { success, products } = await window.electron.getAllProducts();
        if (success && products) {
          setProducts(products);
          setFilteredProducts(products);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadCategories();
    loadProducts();
  }, []);

  // Handle recalled order
  useEffect(() => {
    const { recalledOrder, orderId, reference } = router.query;
    if (recalledOrder && typeof recalledOrder === "string") {
      try {
        const items = JSON.parse(recalledOrder);
        setOrderItems(items);
        if (orderId && typeof orderId === "string") {
          setRecalledOrderId(orderId);
        }
        if (reference && typeof reference === "string") {
          setHoldReference(reference);
        }
        // Remove the query parameter after loading
        router.replace("/dashboard", undefined, { shallow: true });
      } catch (error) {
        console.error("Error parsing recalled order:", error);
      }
    }
  }, [router.query]);

  // Filter products when category changes or search term changes
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === activeCategory
      );
    }

    setFilteredProducts(filtered);
  }, [activeCategory, searchTerm, products]);

  // Add useEffect to load tax rate
  useEffect(() => {
    const loadTaxRate = async () => {
      const result = await getGeneralSettings();
      if (result?.success && result.settings) {
        const taxSetting = result.settings.find(s => s.setting_name === 'tax_rate');
        setTax(taxSetting ? parseFloat(taxSetting.setting_value) : 0);
      }
    };
    
    loadTaxRate();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const addToOrder = (product: (typeof products)[0]) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (itemId: string) => {
    setOrderItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  const handlePaymentComplete = async () => {
    // Clear the order after successful payment
    setOrderItems([]);
    setDiscount(0);
    toast.success("Payment completed successfully!");
  };

  const handleHoldOrder = () => {
    setIsHoldModalOpen(true);
  };

  const handleCloseHoldModal = () => {
    setIsHoldModalOpen(false);
    setHoldReference("");
  };

  const handleNumberClick = (num: string) => {
    // Only allow numeric input
    if (/^\d$/.test(num)) {
      setHoldReference((prev) => prev + num);
    }
  };

  const handleACClick = () => {
    setHoldReference("");
  };

  const handleHoldOrderSubmit = async () => {
    // Validate that reference is numeric
    if (!/^\d+$/.test(holdReference.trim())) {
      toast.error("Reference number must contain only digits");
      return;
    }

    if (!holdReference.trim()) {
      alert("Please enter a reference number");
      return;
    }

    if (orderItems.length === 0) {
      alert("Please add items to the order");
      return;
    }

    // Check if reference exists (only for new orders)
    if (!recalledOrderId) {
      const checkResult = await window.electron.checkReference(holdReference);
      if (checkResult.success && checkResult.exists) {
        toast.error("Reference Number already Exists!!!");
        return;
      }
    }

    const orderData = {
      reference: holdReference,
      items: orderItems,
      total_items: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: subtotal,
    };

    // If this is a recalled order, update it instead of creating new
    const result = recalledOrderId
      ? await window.electron.updateHoldOrder({
          id: recalledOrderId,
          ...orderData,
        })
      : await window.electron.createHoldOrder(orderData);

    if (result.success) {
      setOrderItems([]);
      setHoldReference("");
      setRecalledOrderId(null);
      setIsHoldModalOpen(false);
      router.push("/orders");
    } else {
      toast.error("Failed to hold order: " + result.error);
    }
  };

  const handleCancelOrder = async () => {
    if (recalledOrderId) {
      try {
        // Delete the recalled order
        const result = await window.electron.deleteHoldOrder(recalledOrderId);
        if (result.success) {
          toast.success("Order cancelled successfully");
        } else {
          toast.error("Failed to cancel order: " + result.error);
          return;
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        toast.error("Failed to cancel order");
        return;
      }
    }

    // Clear cart items and reset state
    setOrderItems([]);
    setRecalledOrderId(null);
    setHoldReference("");
    setDiscount(0);
  };

  // Calculate total without discount and tax
  const subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Calculate discount amount
  const calculateDiscount = () => {
    return (subtotal * discount) / 100;
  };

  const calculateTax = () => {
    return (subtotal * tax) / 100;
  };

  const total = subtotal - calculateDiscount() + calculateTax();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";

    if (process.env.NODE_ENV === "production") {
      // Use custom protocol in production
      return `upload://${path.basename(imagePath)}`;
    }
    // Use relative path in development
    return imagePath;
  };

  // Add this function to handle the Pay button click
  const handlePayClick = async () => {
    try {
      // Validate stock before opening payment modal
      const stockValidation = await window.electron.validatePaymentStock(orderItems);
      if (!stockValidation.success) {
        toast.error(stockValidation.error);
        return;
      }
      
      // If validation passes, open payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error validating stock:", error);
      toast.error("Failed to validate stock. Please try again.");
    }
  };

  const getLowStockClass = (product: Product) => {
    if (product.stock <= 5 && !product.isNA) {
      return 'border-red-100 animate-border-blink';
    }
    return 'border-gray-100';
  };

  // Add number pad handler functions
  const handleDiscountNumber = (num: string) => {
    if (num === 'back') {
      setTempDiscount(prev => prev.slice(0, -1));
      return;
    }
    if (num === 'clear') {
      setTempDiscount('');
      return;
    }
    if (num === 'save') {
      const newDiscount = Math.min(Number(tempDiscount), 100);
      setDiscount(newDiscount);
      setShowDiscountPad(false);
      setTempDiscount('');
      return;
    }
    setTempDiscount(prev => {
      const newValue = prev + num;
      return Number(newValue) <= 100 ? newValue : prev;
    });
  };

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
                value={searchTerm}
                onChange={handleSearch}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    category.id === activeCategory
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                scrollbarWidth: "thin",
                scrollbarColor: "#E5E7EB transparent",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6 mb-20">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToOrder(product)}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border ${getLowStockClass(product)} flex flex-col h-[200px]`}
                  >
                    <style jsx global>{`
                      .animate-border-blink {
                        animation: borderBlink 1.5s infinite;
                      }
                      ${lowStockAnimation}
                    `}</style>
                    <div className="w-full h-[120px]">
                      {product.image_path ? (
                        <img
                          src={getImageUrl(product.image_path)}
                          alt={product.name}
                          className="w-full h-[120px] object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/default-product.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-[120px] bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-2 flex-1 flex flex-col space-y-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-blue-600 font-bold text-base">
                        Rs. {product.price.toFixed(2)}
                      </p>
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
            </div>
          </div>

          {/* Order Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg"
              >
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
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
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
                      setDiscount(0);
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
              <div className="flex justify-between items-center text-red-600">
                <span>Discount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${discount}%`}
                    onClick={() => {
                      setShowDiscountPad(true);
                      setTempDiscount(discount.toString());
                    }}
                    className="w-20 px-2 py-1 border rounded text-right cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-red-600">
                <span>Tax</span>
                <div className="flex items-center gap-2">
                  <span>{tax} %</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span>Items</span>
                <span>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discount}%)</span>
                  <span>- Rs. {calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              {
                tax > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Tax ({tax}%)</span>
                    <span>Rs. {calculateTax().toFixed(2)}</span>
                  </div>
                )
              }
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onClick={handlePayClick}
                  disabled={orderItems.length === 0}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded transition-opacity ${
                    orderItems.length === 0 
                      ? 'bg-[#4CAF50] hover:opacity-90 text-white cursor-not-allowed'
                      : 'bg-[#4CAF50] hover:opacity-90 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path d="M3 10h18M7 15h2m2 0h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pay
                </button>

                <button
                  onClick={handleHoldOrder}
                  disabled={orderItems.length === 0}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded transition-opacity ${
                    orderItems.length === 0 
                      ? 'bg-[#26A69A] hover:opacity-90 text-white cursor-not-allowed'
                      : 'bg-[#26A69A] hover:opacity-90 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <rect x="7" y="5" width="3" height="14" fill="currentColor" rx="0.5" />
                    <rect x="14" y="5" width="3" height="14" fill="currentColor" rx="0.5" />
                  </svg>
                  Hold
                </button>

                <button
                  onClick={handleCancelOrder}
                  disabled={orderItems.length === 0}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded transition-opacity ${
                    orderItems.length === 0 
                      ? 'bg-[#F44336] hover:opacity-90 text-white cursor-not-allowed' 
                      : 'bg-[#F44336] hover:opacity-90 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

      {/* Hold Order Modal */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-gray-700">Hold Order</h2>
              <button
                onClick={handleCloseHoldModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                pattern="\d*"
                inputMode="numeric"
                placeholder="Enter a reference"
                className={`w-full p-3 border border-blue-300 rounded text-lg ${
                  recalledOrderId ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                value={holdReference}
                onChange={(e) => {
                  // Only allow numeric input
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setHoldReference(value);
                  }
                }}
                readOnly={recalledOrderId !== null}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "∞", 0, "AC"].map((num) => (
                <button
                  key={num}
                  onClick={() =>
                    num === "AC"
                      ? handleACClick()
                      : handleNumberClick(num.toString())
                  }
                  className="py-4 text-center border border-blue-200 rounded text-blue-500 hover:bg-blue-50 transition-colors text-lg"
                  disabled={recalledOrderId !== null}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleHoldOrderSubmit}
              className="w-full mt-6 bg-blue-500 text-white py-4 rounded text-lg font-medium hover:bg-blue-600 transition-colors uppercase"
            >
              Hold Order
            </button>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderItems={orderItems}
        discount={calculateDiscount()}
        tax={calculateTax()}
        total={total}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Number Pad Popup */}
      {showDiscountPad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enter Discount %</h3>
              <button 
                onClick={() => setShowDiscountPad(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <input
              type="text"
              className="w-full text-right text-2xl p-2 mb-4 border rounded"
              value={tempDiscount}
              readOnly
            />

            <div className="grid grid-cols-3 gap-2">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 'clear', 0, 'back'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDiscountNumber(num.toString())}
                  className={`p-3 text-lg rounded ${
                    typeof num === 'number'
                      ? 'bg-white hover:bg-gray-50 border'
                      : num === 'clear'
                      ? 'bg-red-50 hover:bg-red-100 text-red-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {num === 'back' ? (
                    <BackspaceIcon className="h-6 w-6 mx-auto" />
                  ) : num === 'clear' ? (
                    'C'
                  ) : (
                    num
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleDiscountNumber('save')}
              className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Apply Discount
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;
