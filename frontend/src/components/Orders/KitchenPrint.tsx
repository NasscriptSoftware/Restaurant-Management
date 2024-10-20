import React, { useState, useEffect, useMemo } from "react";
import { Order, Dish, OrderItem } from "../../types/index";
import { fetchDishSizes } from "../../services/api";

interface KitchenPrintProps {
  order: Order;
  dishes: Dish[];
}

const KitchenPrint: React.FC<KitchenPrintProps> = ({ order, dishes }) => {
  const [dishSizes, setDishSizes] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchSizes = async () => {
      const sizePromises = order.items
        .filter(item => item.dish_size)
        .map(item => fetchDishSizes(item.dish_size));
      
      const sizes = await Promise.all(sizePromises);
      const sizeMap = sizes.reduce((acc, size, index) => {
        acc[order.items[index].dish_size] = size;
        return acc;
      }, {});
      
      setDishSizes(sizeMap);
    };

    fetchSizes();
  }, [order.items]);

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

  const calculateSubTotal = (item: OrderItem, dish: Dish | undefined) => {
    if (item.dish_size && dishSizes[item.dish_size]) {
      return dishSizes[item.dish_size].price * item.quantity;
    } else if (dish) {
      return dish.price * item.quantity;
    }
    return 0;
  };

  const { renderedRegularItems, renderedNewlyAddedItems, grandTotal } = useMemo(() => {
    let total = 0;

    const renderItems = (items: OrderItem[]) => {
      return items.map((item, index) => {
        const dish = dishes.find((d) => d.id === item.dish);
        const sizeDetails = item.dish_size ? dishSizes[item.dish_size] : null;
        const subTotal = calculateSubTotal(item, dish);
        total += subTotal;

        return (
          <tr key={index} className="print-item">
            <td className="print-item-name">
              {dish ? dish.name : "Unknown Dish"}
              {sizeDetails && (
                <span className="text-xs ml-1">
                  ({sizeDetails.size})
                </span>
              )}
            </td>
            <td className="print-item-quantity text-right">x {item.quantity}</td>
            <td className="print-item-total text-right">QAR {subTotal.toFixed(2)}</td>
          </tr>
        );
      });
    };

    const regularItems = Array.isArray(order.items)
      ? order.items.filter((item) => !item.is_newly_added)
      : [];

    const newlyAddedItems = Array.isArray(order.items)
      ? order.items.filter((item) => item.is_newly_added)
      : [];

    return {
      renderedRegularItems: renderItems(regularItems),
      renderedNewlyAddedItems: renderItems(newlyAddedItems),
      grandTotal: total
    };
  }, [order.items, dishes, dishSizes]);

  return (
    <div className="print-container w-full max-w-md mx-auto p-4 text-sm bg-white border-2 border-dashed rounded-lg">
      <h1 className="text-center text-lg font-bold mb-2">Kitchen Order</h1>
      <div className="print-order-id mb-2">Order_id #{order.id}</div>
      <div className="print-date mb-2">
        Date: {formatDate(order.created_at)}
      </div>
      <div className="print-time mb-2">
        Time: {formatTime(order.created_at)}
      </div>

      <div className="print-items">
        {renderedRegularItems.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Order Items:</h4>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>{renderedRegularItems}</tbody>
            </table>
          </div>
        )}

        {renderedNewlyAddedItems.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-center mb-2">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-red-500 font-semibold">
                Newly Added
              </span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>{renderedNewlyAddedItems}</tbody>
            </table>
          </div>
        )}
        
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
                {order.foc_product_details.map((item: any) => (
                  <tr key={item.id}>
                    <td className="text-left">{item.name}</td>
                    <td className="text-right">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-right">
        <hr className="border-gray-300 mb-2" />
        <p className="font-bold">Grand Total: QAR {grandTotal.toFixed(2)}</p>
      </div>

      {order.kitchen_note && (
        <div className="print-kitchen-note mt-4">
          <hr className="border-gray-300 mb-2" />
          <p className="font-bold italic">Note: {order.kitchen_note}</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPrint;
