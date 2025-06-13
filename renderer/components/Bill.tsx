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
  billRefNo: string;
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
  billRefNo,
}) => {
  const [template, setTemplate] = useState<BillTemplate | null>(null);
  const currentDate = new Date().toLocaleString();
  const { full_name: cashier } = JSON.parse(localStorage.getItem("userData") || "{}");

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
      className="p-4 font-mono text-sm" 
      id="bill-print"
      style={{ 
        width: `${template.bill_width}px`,
        fontFamily: 'monospace'
      }}
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
        <h1 className="text-xl font-bold mb-1">{template.company_name}</h1>
        {template.address && <p className="mb-0.5">{template.address}</p>}
        {template.phone && <p className="mb-0.5">{template.phone}</p>}
        {template.email && <p className="mb-0.5">{template.email}</p>}
        {/* {template.website && <p className="mb-0.5">Website: {template.website}</p>}
        {template.show_tax_id && template.tax_id && (
          <p className="mb-0.5">Tax ID: {template.tax_id}</p>
        )} */}
      </div>

      <div className="mb-4">
        <p className="mb-0.5">{currentDate}</p>
        <p className="mb-0.5">REF:{billRefNo}</p>
        
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-4">
        <table className="w-full">
          <thead>
            <tr className="font-bold">
              <td style={{ width: '40%' }}>Item</td>
              <td style={{ width: '15%', paddingLeft: '10px' }}>Qty</td>
              <td style={{ width: '20%', textAlign: 'right' }}>Price</td>
              <td style={{ width: '25%', textAlign: 'right' }}>Total</td>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id}>
                <td style={{ width: '40%' }} className="truncate">{item.name}</td>
                <td style={{ width: '15%', paddingLeft: '10px' }} className="truncate">{item.quantity}</td>
                <td style={{ width: '20%', textAlign: 'right' }} className="truncate">{item.price.toFixed(2)}</td>
                <td style={{ width: '25%', textAlign: 'right' }} className="truncate">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-0.5 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{discount.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-0.5 mb-4 border-t border-gray-300 pt-2">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span>{paymentMethod === "card" ? "Card" : "Cash"}</span>
        </div>
        {paymentMethod === "cash" && (
          <>
            <div className="flex justify-between">
              <span>Amount Received:</span>
              <span>{amountReceived?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{change?.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{cashier}</span>
        </div>
      </div>
        <div className="border-t border-gray-300 pt-2">
        {template.show_footer && template.footer_text && (
        <div className="text-center mt-4 text-sm">
          <p>{template.footer_text}</p>
        </div>
      )}
        </div>
     
    </div>
  );
};

export default Bill;
