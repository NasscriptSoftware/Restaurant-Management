// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { Bill } from "../../types/index";
// import { useOrder } from "../../hooks/useOrder";
// import Loader from "../Layout/Loader";
// import { api, fetchDishDetails } from "../../services/api";

// interface BillCardProps {
//   bill: Bill;
//   onCancel: () => void; // Callback to refresh bills after cancellation
// }

// const BillCard: React.FC<BillCardProps> = ({ bill, onCancel }) => {
//   const { data: order, isLoading, isError } = useOrder(bill.order.id);
//   const [dishes, setDishes] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchDishes = async () => {
//       if (order && order.items) {
//         const fetchedDishes = await Promise.all(
//           order.items.map(async (item: any) => {
//             const dishDetails = await fetchDishDetails(item.dish);
//             return {
//               ...item,
//               dish_name: dishDetails ? dishDetails.name : "Unknown Dish",
//               item_total: dishDetails ? dishDetails.price * item.quantity : 0,
//             };
//           })
//         );
//         setDishes(fetchedDishes);
//       }
//     };

//     fetchDishes();
//   }, [order]);

//   if (isLoading) return <Loader />;
//   if (isError) return <div>Error loading order details.</div>;

//   const handleCancelClick = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "Do you really want to cancel this bill? This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, cancel it!",
//       cancelButtonText: "No, keep it",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         api
//           .post(`/bills/${bill.id}/cancel_order/`)
//           .then(() => {
//             Swal.fire("Cancelled!", "The bill has been cancelled.", "success");
//             onCancel(); // Trigger the refresh of bills
//           })
//           .catch((error) => {
//             console.error("Error cancelling the bill:", error);
//             Swal.fire("Error", "Failed to cancel the bill. Please try again.", "error");
//           });
//       } else if (result.dismiss === Swal.DismissReason.cancel) {
//         Swal.fire("Cancelled", "The bill is safe :)", "info");
//       }
//     });
//   };

//   return (
//     <div key={bill.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4">
//       <h2 className="text-xl font-semibold mb-2">Bill #{bill.id}</h2>
//       <p className="text-sm text-gray-600 mb-4">
//         Billed on: {new Date(bill.billed_at).toLocaleString()}
//       </p>

//       {order && (
//         <>
//           <h3 className="text-lg font-semibold text-gray-700">Order Details</h3>
//           <p className="text-sm text-gray-600 mb-4">
//             Order #{order.id} - Ordered on: {new Date(order.created_at).toLocaleString()}
//           </p>

//           <div className="mb-4">
//             <h4 className="text-md font-semibold">Ordered Items:</h4>
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white">
//                 <thead>
//                   <tr>
//                     <th className="py-2 px-4 bg-gray-200 text-left">Item</th>
//                     <th className="py-2 px-4 bg-gray-200 text-center">Quantity</th>
//                     <th className="py-2 px-4 bg-gray-200 text-right">Amount (QAR)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {dishes.map((item, index) => (
//                     <tr key={index}>
//                       <td className="py-2 px-4 border-b border-gray-200">{item.dish_name}</td>
//                       <td className="py-2 px-4 border-b border-gray-200 text-center">
//                         {item.quantity}
//                       </td>
//                       <td className="py-2 px-4 border-b border-gray-200 text-right">
//                         {item.item_total !== undefined && item.item_total !== null
//                           ? item.item_total.toFixed(2)
//                           : "N/A"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {order.order_type === "delivery" && order.delivery_charge && (
//             <div className="mb-4">
//               <h4 className="text-md font-semibold">Delivery Charge:</h4>
//               <p className="text-lg">QAR {parseFloat(order.delivery_charge).toFixed(2)}</p>
//             </div>
//           )}

//           <div className="mb-4">
//             <h4 className="text-md font-semibold">Total Bill:</h4>
//             <p className="text-lg font-bold">QAR {parseFloat(order.total_amount).toFixed(2)}</p>
//           </div>

//           <div className="mb-4">
//             <h4 className="text-md font-semibold">Delivery Type:</h4>
//             <p className="text-gray-600 capitalize">{order.order_type}</p>
//           </div>

//           {order.address && (
//             <div className="mb-4">
//               <h4 className="text-md font-semibold">Delivery Address:</h4>
//               <p className="text-gray-600">{order.address}</p>
//             </div>
//           )}
//         </>
//       )}

//       <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
//         <span
//           className={`px-3 py-1 rounded ${
//             bill.paid ? "bg-green-500" : "bg-red-500"
//           } text-white`}
//         >
//           {bill.paid ? "Paid" : "Unpaid"}
//         </span>
//         {/* <span className="text-lg font-semibold">Total Amount: QAR {bill.total_amount}</span> */}
//         {order.status === "cancelled" || bill.order.status === "cancelled" ? (
//           <button
//             disabled
//             className="px-3 py-1 rounded bg-gray-500 text-white cursor-not-allowed"
//           >
//             Cancelled
//           </button>
//         ) : (
//           <button
//             onClick={handleCancelClick}
//             className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
//           >
//             Cancel Bill
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillCard;


import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bill } from "../../types/index";
import { useOrder } from "../../hooks/useOrder";
import Loader from "../Layout/Loader";
import { api, fetchDishDetails } from "../../services/api";

interface BillCardProps {
  bill: Bill;
  onCancel: () => void; // Callback to refresh bills after cancellation
}

const BillCard: React.FC<BillCardProps> = ({ bill, onCancel }) => {
  const { data: order, isLoading, isError } = useOrder(bill.order.id);
  const [dishes, setDishes] = useState<any[]>([]);

  useEffect(() => {
    const fetchDishes = async () => {
      if (order && order.items) {
        const fetchedDishes = await Promise.all(
          order.items.map(async (item: any) => {
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
        api
          .post(`/bills/${bill.id}/cancel_order/`)
          .then(() => {
            Swal.fire("Cancelled!", "The bill has been cancelled.", "success");
            onCancel(); // Trigger the refresh of bills
          })
          .catch((error) => {
            console.error("Error cancelling the bill:", error);
            Swal.fire("Error", "Failed to cancel the bill. Please try again.", "error");
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Cancelled", "The bill is safe :)", "info");
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
          <span
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              bill.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
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
                  {dishes.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700">{item.dish_name}</td>
                      <td className="px-6 py-4 text-center text-sm text-purple-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-purple-700">
                        {item.item_total !== undefined && item.item_total !== null
                          ? item.item_total.toFixed(2)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
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