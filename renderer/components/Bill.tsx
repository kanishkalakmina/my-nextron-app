import React, { useEffect, useState } from "react";
import Image from "next/image";

interface BillProps {
  orderItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountReceived?: number;
  change?: number;
  paymentMethod: "card" | "cash";
}

interface BillTemplate {
  id: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tax_id: string;
  footer_text: string;
  show_logo: number;
  show_tax_id: number;
  show_footer: number;
  logo_path: string;
  bill_width: number;
}

const Bill: React.FC<BillProps> = ({
  orderItems,
  subtotal,
  discount,
  tax,
  total,
  amountReceived,
  change,
  paymentMethod,
}) => {
  const [template, setTemplate] = useState<BillTemplate | null>(null);
  const currentDate = new Date().toLocaleString();

  useEffect(() => {
    const loadBillTemplate = async () => {
      try {
        const result = await window.electron.getAllBillTemplates();
        if (result.success && result.templates && result.templates.length > 0) {
          setTemplate(result.templates[0]); // Get the first template
        }
      } catch (error) {
        console.error("Error loading bill template:", error);
      }
    };

    loadBillTemplate();
  }, []);

  if (!template) {
    return <div>Loading bill template...</div>;
  }

  return (
    <div 
      className="p-4 text-sm" 
      id="bill-print"
      style={{ width: `${template.bill_width}px` }}
    >
      <div className="text-center mb-4">
        {template.show_logo && template.logo_path && (
          <div className="flex justify-center mb-2">
            <img
              src={template.logo_path}
              alt="Company Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
        )}
        <h1 className="text-xl font-bold">{template.company_name}</h1>
        {template.address && <p>{template.address}</p>}
        {template.phone && <p>Tel: {template.phone}</p>}
        {template.email && <p>Email: {template.email}</p>}
        {template.website && <p>Website: {template.website}</p>}
        {template.show_tax_id && template.tax_id && (
          <p>Tax ID: {template.tax_id}</p>
        )}
      </div>

      <div className="mb-4">
        <p>Date: {currentDate}</p>
        <p>Bill No: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-4">
        <table className="w-full">
          <thead>
            <tr className="font-bold">
              <td>Item</td>
              <td className="text-right">Qty</td>
              <td className="text-right">Price</td>
              <td className="text-right">Total</td>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">Rs. {item.price.toFixed(2)}</td>
                <td className="text-right">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Discount:</span>
            <span>-Rs. {discount.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>Rs. {tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
          <span>Total:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span>{paymentMethod === "card" ? "Card" : "Cash"}</span>
        </div>
        {paymentMethod === "cash" && (
          <>
            <div className="flex justify-between">
              <span>Amount Received:</span>
              <span>Rs. {amountReceived?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>Rs. {change?.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {template.show_footer && template.footer_text && (
        <div className="text-center text-gray-600 mt-8 pt-4 border-t">
          {template.footer_text}
        </div>
      )}
    </div>
  );
};

export default Bill;
