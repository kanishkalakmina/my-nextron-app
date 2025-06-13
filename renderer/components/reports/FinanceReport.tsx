import React from 'react';

const FinanceReport = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Finance Reports</h2>
      <div className="space-y-4">
        {/* Add your finance report content here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">Rs.0.00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Expenses</h3>
            <p className="text-2xl font-bold text-red-600">Rs.0.00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Profit</h3>
            <p className="text-2xl font-bold text-green-600">Rs.0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport; 