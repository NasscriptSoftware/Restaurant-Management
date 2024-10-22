import React from "react";
import { Order, Dish } from "../../types/index";
import { QRCodeSVG } from "qrcode.react";
import { fetchDishSizes } from "../../services/api";

interface SalesPrintProps {
  order: Order;
  dishes: Dish[];
  logoInfo: {
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    location: string;
  } | null;
}

const SalesPrint: React.FC<SalesPrintProps> = ({ order, dishes, logoInfo }) => {
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

  const totalQuantity = Array.isArray(order.items)
    ? order.items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const [dishSizes, setDishSizes] = React.useState<{
    [key: number]: { size: string; price: string };
  }>({});

  React.useEffect(() => {
    const fetchSizes = async () => {
      const sizePromises = order.items.map(async (item) => {
        if (item.dish_size) {
          const sizeData = await fetchDishSizes(item.dish_size);
          return { [item.dish_size]: sizeData };
        }
        return null;
      });

      const sizes = await Promise.all(sizePromises);
      const sizeObject = Object.assign({}, ...sizes.filter(Boolean));
      setDishSizes(sizeObject);
    };

    fetchSizes();
  }, [order.items]);

  const calculateGrandTotal = () => {
    let total = parseFloat(order.total_amount);
    if (order.chair_amount) {
      total += parseFloat(order.chair_amount);
    }
    return total.toFixed(2);
  };

  return (
    // <div className="print-container w-76 p-4 text-sm bg-white border-2 border-dashed rounded-lg mx-auto">
    <div className="print-container w-full max-w-md mx-auto p-4 mt-5 text-sm bg-white border-2 border-dashed rounded-lg">

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
      <div className="print-date mb-2">
        Date: {formatDate(order.created_at)}
      </div>
      <div className="print-time mb-2">
        Time: {formatTime(order.created_at)}
      </div>
      <div className="print-items">
        <table className="w-full ">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item, index) => {
                const dish = dishes.find((dish) => dish.id === item.dish);
                const sizeInfo = item.dish_size
                  ? dishSizes[item.dish_size]
                  : null;
                return (
                  <tr key={index} className="print-item">
                    <td className="print-item-name">
                      {dish ? dish.name : "Unknown Dish"}
                      {sizeInfo && (
                        <span className="text-xs"> ({sizeInfo.size})</span>
                      )}
                    </td>
                    <td className="print-item-quantity text-center">
                      x{item.quantity}
                    </td>
                    <td className="print-item-price text-right">
                      QAR{" "}
                      {sizeInfo
                        ? parseFloat(sizeInfo.price) * item.quantity
                        : dish
                        ? dish.price * item.quantity
                        : 0}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* {order.chair_details && order.chair_details.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-center mb-2">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-red-500 font-semibold text-xs">
              Chair Details
            </span>
            <hr className="flex-grow border-gray-300" />
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left w-1/4">Chair</th>
                <th className="text-center w-1/4">Time</th>
                <th className="text-right w-1/4">Total Hours</th>
                <th className="text-right w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody>
            {order.chair_details?.map((chair, index) => {
                const formatTime = (dateTimeString: string) => {
                  const date = new Date(dateTimeString);
                  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                };
                
                return (
                  <tr key={index}>
                    <td className="text-left">{chair.chair_name}</td>
                    <td className="text-center">
                      {formatTime(chair.start_time)} - {formatTime(chair.end_time)}
                    </td>
                    <td className="text-right">{chair.total_time}</td>
                    <td className="text-right">
                      {index === 0 && order.chair_amount ? `QAR ${order.chair_amount}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )} */}
        
        {order.chair_details && order.chair_details.length > 0 && (
  <div className="mt-4">
    <div className="flex items-center justify-center mb-2">
      <hr className="flex-grow border-gray-300" />
      <span className="mx-4 text-red-500 font-semibold text-xs">
        Chair Details
      </span>
      <hr className="flex-grow border-gray-300" />
    </div>
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th className="text-left">Chair</th>
         
          <th className="text-center">Time</th>
          <th className="text-right">Total Hours</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
      {order.chair_details.map((chair, index) => {
        const formatTime = (dateTimeString: string) => {
          const date = new Date(dateTimeString);
          return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        };
        
        return (
          <tr key={index}>
            <td className="text-left">{chair.chair_name}</td>
    
            <td className="text-center">
              {formatTime(chair.start_time)} - {formatTime(chair.end_time)}
            </td>
            <td className="text-right ">{chair.total_time} hrs</td>
            <td className="text-right">QAR {chair.amount}</td>
          </tr>
        );
      })}
      </tbody>
    </table>
  </div>
)}


<div className="mt-4">
    <div className="flex items-center justify-center mb-2">
      <hr className="flex-grow border-gray-300" />
      <span className="mx-4 text-red-500 font-semibold text-xs">
       Totals
      </span>
      <hr className="flex-grow border-gray-300" />
    </div>
      <div className="print-summary mt-4">
        <div className="flex justify-between">
          <span>Total Quantity:</span>
          <span className="font-semibold">{totalQuantity}</span>
        </div>
      
        {order.chair_details && order.chair_details.length > 0 && (
          <div className="flex justify-between mt-2">
            <span>Chair Amount:</span>
            <span className="font-semibold">QAR {order.chair_amount}</span>
          </div>
        )}

          <div className="flex justify-between mt-2">
          <span>Total Amount:</span>
          <span className="font-bold">QAR {order.total_amount}</span>
        </div>
        {/* <div className="flex justify-between mt-2 text-lg font-bold">
          <span>Grand Total:</span>
          <span>QAR {calculateGrandTotal()}</span>
        </div> */}
      </div>
      </div>


      {order.foc_product_details.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-center mb-2">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-red-500 font-semibold">
              Foc Products
            </span>
            <hr className="flex-grow border-gray-300" />
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.foc_product_details.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="text-left">{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add QR code */}
      {order.order_type === "delivery" && (
        <>
          <div className="mt-4 flex justify-center">
            <QRCodeSVG value={`Order ID: ${order.id}`} size={64} />
          </div>
          <p className="text-center text-xs mt-1">Scan for Order ID</p>
        </>
      )}
    </div>
  );
};

export default SalesPrint;