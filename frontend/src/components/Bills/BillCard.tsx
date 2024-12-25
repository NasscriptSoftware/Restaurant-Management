import React from "react";
import Swal from "sweetalert2";
import { Bill, OrderItem } from "../../types/index";
import { useOrder } from "../../hooks/useOrder";
import Loader from "../Layout/Loader";
import { api } from "../../services/api";

interface BillCardProps {
  bill: Bill;
  onCancel: () => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onCancel }) => {
  const { data: order, isLoading, isError } = useOrder(bill.order.id);

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
        api
          .post(`/bills/${bill.id}/cancel_order/`)
          .then(() => {
            Swal.fire("Cancelled!", "The bill has been cancelled.", "success");
            onCancel();
          })
          .catch((error) => {
            console.error("Error cancelling the bill:", error);
            Swal.fire("Error", "Failed to cancel the bill. Please try again.", "error");
          });
      }
    });
  };

  return (
    <div key={bill.id} className="bg-gradient-to-br from-purple-100 via-purple-50 to-white p-8 rounded-3xl shadow-lg mb-10 relative overflow-hidden border border-purple-200">
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200 rounded-full -mr-20 -mt-20 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 rounded-full -ml-20 -mb-20 opacity-20"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
        <div>
          <h2 className="text-4xl font-extrabold text-purple-800 mb-2">Bill #{bill.id}</h2>
          <p className="text-sm text-purple-600">
            Billed on: {new Date(bill.billed_at).toLocaleString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className={`px-6 py-2 rounded-full text-sm font-semibold ${
            bill.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {bill.paid ? "Paid" : "Unpaid"}
          </span>
          {order.status === "cancelled" || bill.order.status === "cancelled" ? (
            <span className="px-6 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">
              Cancelled
            </span>
          ) : (
            <button
              onClick={handleCancelClick}
              className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition duration-300 ease-in-out text-sm font-semibold transform hover:scale-105"
            >
              Cancel Bill
            </button>
          )}
        </div>
      </div>

      {order && (
        <div className="space-y-8 relative z-10">
          <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
            <h3 className="text-2xl font-semibold text-purple-800 mb-3">Order Details</h3>
            <p className="text-purple-600">
              Order #{order.id} - Ordered on: {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">Ordered Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-purple-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-500 uppercase tracking-wider">Amount (QAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {order.items?.map((item: OrderItem, index: number) => {
                    const itemTotal = parseFloat(item.price.toString()) * item.quantity;
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700">
                          {item.dish_name}
                          {item.size_name && (
                            <span className="text-xs ml-1">({item.size_name})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-purple-700">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-purple-700">
                          {itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {order.order_type === "delivery" && order.delivery_charge && (
              <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Delivery Charge</h4>
                <p className="text-2xl text-purple-600">QAR {parseFloat(order.delivery_charge).toFixed(2)}</p>
              </div>
            )}

            <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-800 mb-2">Total Bill</h4>
              <p className="text-3xl font-bold text-purple-600">QAR {parseFloat(order.total_amount).toFixed(2)}</p>
            </div>

            <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-800 mb-2">Delivery Type</h4>
              <p className="text-2xl text-purple-600 capitalize">{order.order_type}</p>
            </div>
          </div>

          {order.address && (
            <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-md backdrop-filter backdrop-blur-sm border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-800 mb-2">Delivery Address</h4>
              <p className="text-purple-600">{order.address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillCard;