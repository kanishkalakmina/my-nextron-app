import React from 'react';

interface BillSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  footerText: string;
  showLogo: boolean;
  showTaxId: boolean;
  showFooter: boolean;
  logo: string;
  billWidth: number;
}

interface BillPreviewProps {
  settings: BillSettings;
}

const BillPreview: React.FC<BillPreviewProps> = ({ settings }) => {
  // Sample bill data for preview
  const sampleBill = {
    invoiceNo: 'INV-2025-001',
    date: new Date().toLocaleDateString(),
    items: [
      { name: 'Sample Product 1', qty: 2, price: 25.00, total: 50.00 },
      { name: 'Sample Product 2', qty: 1, price: 30.00, total: 30.00 },
    ],
    subtotal: 80.00,
    tax: 8.00,
    total: 88.00,
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-lg mx-auto"
      style={{ width: `${settings.billWidth}px` }}
    >
      {/* Header Section */}
      <div className="border-b pb-3 mb-3 text-center">
        {settings.showLogo && settings.logo ? (
          <div className="mb-3 flex justify-center">
            <img 
              src={settings.logo} 
              alt="Company Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
        ) : settings.showLogo && (
          <div className="mb-3 h-20 mx-auto w-48 bg-gray-200 flex items-center justify-center text-gray-500">
            Logo Placeholder
          </div>
        )}
        <h1 className="text-2xl font-bold mb-1">{settings.companyName || 'Company Name'}</h1>
        {settings.address && (
          <p className="text-gray-600 whitespace-pre-line mb-0.5">{settings.address}</p>
        )}
        {settings.phone && <p className="text-gray-600 mb-0.5">Phone: {settings.phone}</p>}
        {settings.email && <p className="text-gray-600 mb-0.5">Email: {settings.email}</p>}
        {settings.website && <p className="text-gray-600 mb-0.5">Website: {settings.website}</p>}
        {settings.showTaxId && settings.taxId && (
          <p className="text-gray-600">Tax ID: {settings.taxId}</p>
        )}
      </div>

      {/* Invoice Details */}
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-bold">Invoice No:</p>
            <p>{sampleBill.invoiceNo}</p>
          </div>
          <div>
            <p className="font-bold">Date:</p>
            <p>{sampleBill.date}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {sampleBill.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.name}</td>
              <td className="text-right py-2">{item.qty}</td>
              <td className="text-right py-2">${item.price.toFixed(2)}</td>
              <td className="text-right py-2">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mb-6">
        <div className="flex justify-between border-b py-2">
          <span>Subtotal:</span>
          <span>${sampleBill.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span>Tax:</span>
          <span>${sampleBill.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold">
          <span>Total:</span>
          <span>${sampleBill.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      {settings.showFooter && settings.footerText && (
        <div className="text-center text-gray-600 mt-8 pt-4 border-t">
          {settings.footerText}
        </div>
      )}
    </div>
  );
};

export default BillPreview;
