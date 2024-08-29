import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bill } from "../../types";
import { useOrder } from "../../hooks/useOrder";
import Loader from "../Layout/Loader";
import { fetchDishDetails } from "../../services/api"; // Assuming you have this function to fetch dish details

interface BillCardProps {
  bill: Bill;
  onCancel: (billId: number) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onCancel }) => {
  const { data: order, isLoading, isError } = useOrder(bill.order.id);
  const [dishes, setDishes] = useState<any[]>([]);

  useEffect(() => {
    const fetchDishes = async () => {
      if (order && order.items) {
        const fetchedDishes = await Promise.all(
          order.items.map(async (item) => {
            const dishDetails = await fetchDishDetails(item.dish);
            return {
              ...item,
              dish_name: dishDetails ? dishDetails.name : "Unknown Dish",
              item_total: dishDetails ? dishDetails.price * item.quantity : 0,
            };
          })
        );
        setDishes(fetchedDishes);
      }
    };

    fetchDishes();
  }, [order]);

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading order details.</div>;

  const handleCancelClick = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this bill? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        onCancel(bill.id);
        Swal.fire("Cancelled!", "The bill has been cancelled.", "success");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Cancelled", "The bill is safe :)", "error");
      }
    });
  };

  return (
    <div key={bill.id} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold">Bill #{bill.id}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Billed on: {new Date(bill.billed_at).toLocaleString()}
      </p>

      {order && (
        <>
          <h3 className="text-lg text-gray-700 font-semibold">Order Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            Order #{order.id} - Ordered on:{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>

          <div className="mb-4">
            <h4 className="text-md font-semibold">Ordered Items:</h4>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-200 text-left">Item</th>
                  <th className="py-2 px-4 bg-gray-200 text-center">Quantity</th>
                  <th className="py-2 px-4 bg-gray-200 text-right">Amount (QAR)</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b border-gray-200">{item.dish_name}</td>
                    <td className="py-2 px-4 border-b border-gray-200 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 border-b border-gray-200 text-right">
                      {item.item_total !== undefined && item.item_total !== null
                        ? item.item_total.toFixed(2)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.order_type === "delivery" && order.delivery_charge && (
            <div className="mb-4">
              <h4 className="text-md font-semibold">Delivery Charge:</h4>
              <p className="text-lg">QAR {parseFloat(order.delivery_charge).toFixed(2)}</p>
            </div>
          )}

          <div className="mb-4">
            <h4 className="text-md font-semibold">Total Bill:</h4>
            <p className="text-lg font-bold">QAR {parseFloat(order.total_amount).toFixed(2)}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-md font-semibold">Delivery Type:</h4>
            <p className="text-gray-600 capitalize">{order.order_type}</p>
          </div>

          {order.address && (
            <div className="mb-4">
              <h4 className="text-md font-semibold">Delivery Address:</h4>
              <p className="text-gray-600">{order.address}</p>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span
          className={`px-3 py-1 rounded ${
            bill.paid ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {bill.paid ? "Paid" : "Unpaid"}
        </span>
        <span className="text-lg font-semibold">
          Total Amount: QAR {parseFloat(bill.total_amount).toFixed(2)}
        </span>
        <button
          onClick={handleCancelClick}
          className="px-3 py-1 rounded bg-red-500 text-white"
        >
          Cancel Bill
        </button>
      </div>
    </div>
  );
};

export default BillCard;
