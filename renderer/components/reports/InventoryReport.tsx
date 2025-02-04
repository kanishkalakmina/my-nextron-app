import React from 'react';

const InventoryReport = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory Reports</h2>
      <div className="space-y-4">
        {/* Add your inventory report content here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Total Products</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Low Stock Items</h3>
            <p className="text-2xl font-bold text-red-600">0</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Out of Stock</h3>
            <p className="text-2xl font-bold text-yellow-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport; 