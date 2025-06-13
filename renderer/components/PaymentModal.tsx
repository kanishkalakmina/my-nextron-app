import React, { useState, useRef } from "react";
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  BackspaceIcon,
} from "@heroicons/react/24/outline";
import Bill from "./Bill";
import toast from "react-hot-toast";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { useStock } from "../context/StockContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  discount: number;
  tax: number;
  total: number;
  onPaymentComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  discount,
  tax,
  total,
  onPaymentComplete,
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "cardcash">("cash");

  const [amountInCard, setAmountInCard] = useState("");
  const [amountReceivedCardCash, setAmountReceivedCardCash] = useState("");
  const [activeCardCashField, setActiveCardCashField] = useState<'card' | 'received'>('received');

  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const billRef = useRef<HTMLDivElement>(null);
  const hiddenBillRef = useRef<HTMLDivElement>(null);

   const { checkLowStock } = useStock();

  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    if (num === "C") {
      setAmount("");
      return;
    }
    if (num === "back") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    setAmount((prev) => prev + num);
  };

  const printBill = () => {
    const printContent = hiddenBillRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Bill</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body { 
                  font-family: Arial, sans-serif;
                  width: 80mm;
                  padding: 0;
                  margin: 0;
                }
                .print-content { 
                  width: 100%;
                  padding: 16px;
                }
                img {
                  width: 70px;
                  height: 70px;
                  margin: 0 auto;
                }
                table {
                  width: 100%;
                  margin: 8px 0;
                }
                td {
                  padding: 4px 0;
                }
                .text-right {
                  text-align: right;
                }
                .border-t {
                  border-top: 1px solid #e5e7eb;
                }
                .border-b {
                  border-bottom: 1px solid #e5e7eb;
                }
                .py-2 {
                  padding-top: 8px;
                  padding-bottom: 8px;
                }
                .space-y-1 > * + * {
                  margin-top: 4px;
                }
                .mb-4 {
                  margin-bottom: 16px;
                }
                .text-xl {
                  font-size: 1.25rem;
                }
                .font-bold {
                  font-weight: 700;
                }
                .text-sm {
                  font-size: 0.875rem;
                }
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-content">
                ${printContent}
              </div>
              <script>
                window.onload = () => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };
  function createTimestampId() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
  const handlePayment = async () => {
    const amountPaid = parseFloat(amount) || 0;
    if (amountPaid < total && paymentMethod === "cash") {
      toast.error("Insufficient amount");
      return;
    }
    const { username: cashier } = JSON.parse(localStorage.getItem("userData") || "{}");
    try {
      // Save payment details to database
      const paymentDetails = {
        id: uuidv4(),
        order_id: createTimestampId(),
        amount: total,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        subtotal,
        discount,
        tax,
        total,
        amount_received: amountPaid,
        change_amount: getChange(),
        status: "paid",
        created_at: new Date().toISOString(),
        orderItems,
        cashier: cashier,
      };

      const result = await window.electron.savePayment(paymentDetails);
      console.log(result);
      if (!result.success) {
        toast.error(result.error || "Failed to process payment");
        return;
      }
      
      // Check stock levels after successful payment
      await checkLowStock();
      printBill();
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    }
    setAmount("");
  };

  const getChange = () => {
    const amountPaid = parseFloat(amount) || 0;
    return Math.max(0, amountPaid - total);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[500px] max-h-[90vh] p-8 relative flex flex-col overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payment</h2>
          <button
            onClick={ (e)=> {onClose(); setAmount("")} }
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                paymentMethod === "cash"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
              onClick={() => setPaymentMethod("cash")}
            >
              <BanknotesIcon
                className={`h-8 w-8 ${
                  paymentMethod === "cash" ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium ${
                  paymentMethod === "cash" ? "text-blue-500" : "text-gray-600"
                }`}
              >
                Cash
              </span>
            </button>
            <button
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <CreditCardIcon
                className={`h-8 w-8 ${
                  paymentMethod === "card" ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium ${
                  paymentMethod === "card" ? "text-blue-500" : "text-gray-600"
                }`}
              >
                Card
              </span>
            </button>
            <button
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                paymentMethod === "cardcash"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                setPaymentMethod("cardcash");
              }}
            >
              <div className="flex items-center gap-1">
                <CreditCardIcon className={`h-6 w-6 ${paymentMethod === "cardcash" ? "text-blue-500" : "text-gray-400"}`} />
                <BanknotesIcon className={`h-6 w-6 ${paymentMethod === "cardcash" ? "text-blue-500" : "text-gray-400"}`} />
              </div>
              <span
                className={`font-medium ${
                  paymentMethod === "cardcash" ? "text-blue-500" : "text-gray-600"
                }`}
              >
                Card & Cash
              </span>
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-2">
                <span>Discount:</span>
                <span>- Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
              <span>Total Amount:</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            {paymentMethod === "cash" && (
              <>
                <div className="flex justify-between mb-2">
                  <span>Amount Received:</span>
                  <span>Rs. {parseFloat(amount || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span>Rs. {getChange().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {paymentMethod === "cash" && (
            <div className="grid grid-cols-3 gap-2">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, "back", 0, "."].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className={`${
                    num === "back"
                      ? "bg-red-50 hover:bg-red-100 flex items-center justify-center"
                      : "bg-white hover:bg-gray-50"
                  } border border-gray-200 rounded p-3 text-lg`}
                >
                  {num === "back" ? (
                    <BackspaceIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    num
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card & Cash UI (now inline) */}
        {paymentMethod === "cardcash" ? (
          <>

            <div className="mb-3 flex justify-between items-center">
              <label htmlFor="amountInCard" className={activeCardCashField === 'card' ? 'font-bold text-blue-600' : ''} onClick={() => setActiveCardCashField('card')}>Amount in Card:</label>
              <div className="flex items-center w-32">
                <span className="mr-1">Rs.</span>
                <input
                  id="amountInCard"
                  type="number"
                  min={0}
                  max={total}
                  value={amountInCard === "" ? "" : Number(amountInCard) > total ? total : amountInCard}
                  onFocus={() => setActiveCardCashField('card')}
                  className={`border rounded px-2 py-1 w-full text-right ${activeCardCashField === 'card' ? 'ring-2 ring-blue-400' : ''}`}
                  readOnly
                />
              </div>
            </div>
            <div className="mb-3 flex justify-between">
              <span>Amount in Cash:</span>
              <span>Rs. {(total - (parseFloat(amountInCard) || 0)).toFixed(2)}</span>
            </div>
            <div className="mb-3 flex justify-between items-center">
              <label htmlFor="amountReceivedCardCash" className={activeCardCashField === 'received' ? 'font-bold text-blue-600' : ''} onClick={() => setActiveCardCashField('received')}>Amount Received:</label>
              <div className="flex items-center w-32">
                <span className="mr-1">Rs.</span>
                <input
                  id="amountReceivedCardCash"
                  type="number"
                  min={0}
                  value={amountReceivedCardCash}
                  onFocus={() => setActiveCardCashField('received')}
                  className={`border rounded px-2 py-1 w-full text-right ${activeCardCashField === 'received' ? 'ring-2 ring-blue-400' : ''}`}
                  readOnly
                />
              </div>
            </div>
            <div className="mb-3 flex justify-between">
              <span>Change:</span>
              <span>Rs. {Math.max(0, (parseFloat(amountReceivedCardCash) || 0) - (total - (parseFloat(amountInCard) || 0))).toFixed(2)}</span>
            </div>
            {/* Unified number pad for Amount in Card / Amount Received */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, "back", 0, "."].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (activeCardCashField === 'card') {
                      if (num === "back") {
                        setAmountInCard((prev) => {
                          const str = String(prev);
                          const nextStr = str.length > 1 ? str.slice(0, -1) : "";
                          return nextStr === "" ? "" : nextStr;
                        });
                      } else if (num === ".") {
                        if (!String(amountInCard).includes(".")) {
                          setAmountInCard((prev) => String(prev) + ".");
                        }
                      } else {
                        setAmountInCard((prev) => {
                          const str = String(prev);
                          const next = str === "0" ? String(num) : str + String(num);
                          return next;
                        });
                      }
                    } else {
                      if (num === "back") {
                        setAmountReceivedCardCash((prev) => {
                          const str = String(prev);
                          const nextStr = str.length > 1 ? str.slice(0, -1) : "";
                          return nextStr === "" ? "" : nextStr;
                        });
                      } else if (num === ".") {
                        if (!String(amountReceivedCardCash).includes(".")) {
                          setAmountReceivedCardCash((prev) => String(prev) + ".");
                        }
                      } else {
                        setAmountReceivedCardCash((prev) => {
                          const str = String(prev);
                          const next = str === "0" ? String(num) : str + String(num);
                          return next;
                        });
                      }
                    }
                  }}
                  className={`$ {
                    num === "back"
                      ? "bg-red-50 hover:bg-red-100 flex items-center justify-center"
                      : "bg-white hover:bg-gray-50"
                  } border border-gray-200 rounded p-3 text-lg`}
                >
                  {num === "back" ? (
                    <BackspaceIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    num
                  )}
                </button>
              ))}
            </div>
            <button
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              onClick={async () => {
                // Save as a combined payment
                const { username: cashier } = JSON.parse(localStorage.getItem("userData") || "{}");
                const paymentDetails = {
                  id: uuidv4(),
                  order_id: createTimestampId(),
                  amount: total,
                  payment_method: "cardcash",
                  payment_date: new Date().toISOString(),
                  subtotal,
                  discount,
                  tax,
                  total,
                  amount_received: parseFloat(amountReceivedCardCash) || 0, // user input
                  card_amount: parseFloat(amountInCard) || 0,
                  cash_amount: total - (parseFloat(amountInCard) || 0),
                  change_amount: Math.max(0, (parseFloat(amountReceivedCardCash) || 0) - (total - (parseFloat(amountInCard) || 0))),
                  status: "paid",
                  created_at: new Date().toISOString(),
                  orderItems,
                  cashier: cashier,
                };
                try {
                  const result = await window.electron.savePayment(paymentDetails);
                  if (!result.success) {
                    toast.error(result.error || "Failed to process payment");
                    return;
                  }
                  await checkLowStock();
                  printBill();
                  onPaymentComplete();
                  onClose();
                } catch (error) {
                  toast.error("Failed to process payment. Please try again.");
                }
                setAmountInCard("");
                setAmountReceivedCardCash("");
              }}
            >
              Complete Payment
            </button>
          </>
        ) : (
          <button
            onClick={handlePayment}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
          >
            Complete Payment
          </button>
        )}
      </div>

      {/* Hidden bill for printing */}
      <div className="hidden">
        <div ref={hiddenBillRef}>
          <Bill
            orderItems={orderItems}
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
            amountReceived={parseFloat(amount) || undefined}
            change={getChange()}
            paymentMethod={paymentMethod === 'cardcash' ? 'cash' : paymentMethod}
            billRefNo={createTimestampId()}
          />
        </div>
      </div>


    </div>
  );
};

export default PaymentModal;
