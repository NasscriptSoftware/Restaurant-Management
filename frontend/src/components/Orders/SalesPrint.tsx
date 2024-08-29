import React, { useState, useEffect } from "react";
import axios from "axios";
import { Order, Dish } from "../../types";

interface SalesPrintProps {
  order: Order;
  dishes: Dish[];
}

const SalesPrint: React.FC<SalesPrintProps> = ({ order, dishes }) => {
  const [logoInfo, setLogoInfo] = useState<{
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    const fetchLogoInfo = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/logo-info/");
        const results = response.data.results;
        if (results && results.length > 0) {
          setLogoInfo({
            logoUrl: results[0].print_logo,
            companyName: results[0].company_name,
            phoneNumber: results[0].phone_number,
            location: results[0].location,
          });
        } else {
          setLogoInfo({
            logoUrl: "/path/to/default/logo.png",
            companyName: "Default Company",
            phoneNumber: "000-000-0000",
            location: "Default Location",
          });
        }
      } catch (error) {
        console.error("Failed to fetch logo info:", error);
        setLogoInfo({
          logoUrl: "/path/to/default/logo.png",
          companyName: "Default Company",
          phoneNumber: "000-000-0000",
          location: "Default Location",
        });
      }
    };

    fetchLogoInfo();
  }, []);

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return date.toLocaleTimeString(undefined, options);
  };

  const totalQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="print-container w-64 p-4 text-sm bg-white border-2 border-dashed rounded-lg mx-auto">
      {/* Display the logo and company info at the top */}
      <div className="flex flex-col items-center mb-4">
        {logoInfo?.logoUrl && (
          <img
            src={logoInfo.logoUrl}
            alt="Logo"
            className="h-8 w-auto mb-2" // Smaller logo size
          />
        )}
        <div className="text-center">
          <p className="font-bold">{logoInfo?.companyName}</p>
          <p>{logoInfo?.phoneNumber}</p>
          <p>{logoInfo?.location}</p>
        </div>
      </div>

      <h1 className="text-center text-lg font-bold mb-2">Sales Receipt</h1>
      <div className="flex justify-between mb-2">
        <div className="print-order-id">Order_id #{order.id}</div>
        {order.payment_method === "credit" && (
          <div className="text-right font-bold text-red-500 ml-4">Credit</div>
        )}
      </div>
      <div className="print-date mb-2">Date: {formatDate(order.created_at)}</div>
      <div className="print-time mb-2">Time: {formatTime(order.created_at)}</div>
      <div className="print-items">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const dish = dishes.find((dish) => dish.id === item.dish);
              return (
                <tr key={index} className="print-item">
                  <td className="print-item-name">
                    {dish ? dish.name : "Unknown Dish"}
                  </td>
                  <td className="print-item-quantity text-center">
                    x{item.quantity}
                  </td>
                  <td className="print-item-price text-right">
                    QAR {dish ? dish.price * item.quantity : 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="print-summary mt-4">
        <div className="flex justify-between">
          <span>Total Quantity:</span>
          <span className="font-bold">{totalQuantity}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Total Amount:</span>
          <span className="font-bold">QAR {order.total_amount}</span>
        </div>
      </div>
    </div>
  );
};

export default SalesPrint;
