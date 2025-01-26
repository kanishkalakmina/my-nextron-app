import React from "react";
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
  const currentDate = new Date().toLocaleString();

  return (
    <div className="p-4 min-w-[300px] text-sm" id="bill-print">
      <div className="text-center mb-4">
        <div className="flex justify-center mb-0">
          <Image
            src="/images/logo.png"
            alt="Store Logo"
            width={70}
            height={70}
            className="mb-0"
          />
        </div>
        <h1 className="text-xl font-bold">Your Store Name</h1>
        <p>123 Store Street, City</p>
        <p>Tel: (123) 456-7890</p>
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
                <td className="text-right">{item.price.toFixed(2)}</td>
                <td className="text-right">
                  {(item.price * item.quantity).toFixed(2)}
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
        <div className="flex justify-between">
          <span>Tax (18%):</span>
          <span>Rs. {tax.toFixed(2)}</span>
        </div>
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

      <div className="text-center mt-6">
        <p className="font-bold">Thank You For Your Purchase!</p>
        <p>Please Come Again</p>
      </div>
    </div>
  );
};

export default Bill;
