import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw } from "lucide-react";
import { api } from "@/services/api";

interface CardDetailsProps {
  selectedCard: {
    id: number;
    title: string;
    content: string;
    iconType: "Delivery" | "Dining" | "Takeaway";
  } | null;
}

interface Order {
  id: number;
  created_at: string;
  total_amount: string | number;
  status: string;
  order_type: "dining" | "takeaway" | "delivery";
  billed_at: string;  // Assuming bill creation date is part of the order
  items: { dish: number; quantity: number }[];
}

const CardDetails: React.FC<CardDetailsProps> = ({ selectedCard }) => {
  const [activeStatus, setActiveStatus] = useState("delivered");
  const [allOrders, setAllOrders] = useState<Order[] | null>(null); // To store the fetched orders
  const [filteredOrders, setFilteredOrders] = useState<Order[] | null>(null); // To store filtered results
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      if (selectedCard) {
        setIsLoading(true);
        setIsError(false);

        const token = localStorage.getItem("token");

        const params: any = {
          order_type: selectedCard.iconType.toLowerCase(),
          status: activeStatus,
        };

        try {
          const response = await api.get(`http://127.0.0.1:8000/api/orders`, {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAllOrders(response.data.results);
          setFilteredOrders(response.data.results); // Initialize filtered orders with all fetched data
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching orders:", error);
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [selectedCard, activeStatus]);

  const handleStatusClick = (status: "pending" | "cancelled" | "delivered") => {
    setActiveStatus(status);
    setCurrentPage(1); // Reset to the first page when changing the status
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setFilteredOrders(allOrders); // Reset filtered orders to all orders
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    if (allOrders) {
      let filtered = allOrders;

      if (fromDate && toDate) {
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        const to = new Date(toDate).setHours(23, 59, 59, 999);

        filtered = filtered.filter((order) => {
          const billDate = new Date(order.billed_at).getTime();
          return billDate >= from && billDate <= to;
        });
      }

      setFilteredOrders(filtered);
      setCurrentPage(1); // Reset to the first page on new search/filter
    }
  };

  if (!selectedCard) {
    return (
      <div className="p-4 bg-white shadow">Select a card to see details</div>
    );
  }

  if (isError) {
    return <div className="p-4 bg-white shadow">Error loading orders.</div>;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders
    ? filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    : [];

  return (
    <div className="p-4 shadow h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{selectedCard.title}</h2>
      </div>

      {/* Date Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <button
            onClick={handleDateFilter} // Apply the date filter
            className="mt-7 p-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="mt-7 p-2 rounded-full bg-red-500 text-white shadow-md"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div
          className={`p-4 rounded-lg shadow-md cursor-pointer ${
            activeStatus === "delivered" ? "bg-[#fff]" : "bg-customLightPurple"
          }`}
          onClick={() => handleStatusClick("delivered")}
        >
          <h3 className="text-xl font-bold">Delivered</h3>
        </div>
        <div
          className={`p-4 rounded-lg shadow-md cursor-pointer  ${
            activeStatus === "pending" ? "bg-[#fff]" : "bg-customLightPurple"
          }`}
          onClick={() => handleStatusClick("pending")}
        >
          <h3 className="text-xl font-bold">Pending</h3>
        </div>
        <div
          className={`p-4 rounded-lg shadow-md cursor-pointer ${
            activeStatus === "cancelled" ? "bg-[#fff]" : "bg-customLightPurple"
          }`}
          onClick={() => handleStatusClick("cancelled")}
        >
          <h3 className="text-xl font-bold">Cancelled</h3>
        </div>
      </div>

      <div>
        {currentOrders.length === 0 ? (
          <p>No orders found for the current search or filters.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentOrders.map((order) => (
                <li
                  key={order.id}
                  className="bg-gray-100 p-4 rounded-lg shadow-md"
                >
                  <div>
                    <strong>Order ID:</strong> {order.id}
                  </div>
                  <div>
                    <strong>Created At:</strong>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> QAR
                    {Number(order.total_amount).toFixed(2)}
                  </div>
                  <div>
                    <strong>Status:</strong> {order.status}
                  </div>
                  <div>
                    <strong>Items:</strong>
                    <ul className="list-disc pl-5">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          Dish ID: {item.dish}, Quantity: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
            {filteredOrders && filteredOrders.length > ordersPerPage && (
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded disabled:opacity-50"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded disabled:opacity-50"
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil(filteredOrders.length / ordersPerPage)
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardDetails;
