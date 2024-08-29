import React, { useEffect, useState } from "react";
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
  items: { dish: number; quantity: number }[];
}

const CardDetails: React.FC<CardDetailsProps> = ({ selectedCard }) => {
  const [activeStatus, setActiveStatus] = useState("delivered");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "cancelled" | "delivered" | null
  >("delivered");
  const [searchQuery, setSearchQuery] = useState(""); // State to track search query
  const ordersPerPage = 5;

  useEffect(() => {
    if (selectedCard && !searchQuery) {  // Only fetch if not searching by ID
      setIsLoading(true);
      setIsError(false);

      const token = localStorage.getItem("token");

      api
        .get(`http://127.0.0.1:8000/api/orders`, {
          params: {
            order_type: selectedCard.iconType.toLowerCase(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setOrders(response.data.results);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setIsError(true);
          setIsLoading(false);
        });
    }
  }, [selectedCard, searchQuery]);  // Depend on searchQuery

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      orders && prevPage < Math.ceil(orders.length / ordersPerPage)
        ? prevPage + 1
        : prevPage
    );
  };

  const handleStatusClick = (status: "pending" | "cancelled" | "delivered") => {
    setSelectedStatus(status);
    setActiveStatus(status);
    setCurrentPage(1); // Reset to the first page when changing the status
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to the first page when changing the search query

    if (query) {
      // Fetch order by ID directly
      const token = localStorage.getItem("token");
      api
        .get(`http://127.0.0.1:8000/api/orders/${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setOrders([response.data]);  // Set orders to an array with the single result
        })
        .catch((error) => {
          console.error("Error fetching order by ID:", error);
          setIsError(true);
          setOrders([]);  // Clear orders if the search fails
        });
    } else if (selectedCard) {
      // If no search query, fetch orders based on selectedCard as usual
      const token = localStorage.getItem("token");

      api
        .get(`http://127.0.0.1:8000/api/orders`, {
          params: {
            order_type: selectedCard.iconType.toLowerCase(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setOrders(response.data.results);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setIsError(true);
          setOrders([]);
        });
    }
  };

  // Filter orders based on status
  const filteredOrders = orders
    ? !searchQuery
      ? orders.filter((order) => order.status === selectedStatus)
      : orders
    : [];

  if (!selectedCard) {
    return (
      <div className="p-4 bg-white shadow">Select a card to see details</div>
    );
  }

  // if (isLoading) {
  //   return <div className="p-4 bg-white shadow">Loading...</div>;
  // }

  if (isError) {
    return <div className="p-4 bg-white shadow">Error loading orders.</div>;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  return (
    <div className="p-4  shadow h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{selectedCard.title}</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search orders..."
            className="p-2 border border-gray-300 rounded"
            value={searchQuery} // Bind input value to state
            onChange={handleSearchChange} // Handle input change
          />
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
            Search
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
        {filteredOrders.length === 0 ? (
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
            {filteredOrders.length > ordersPerPage && (
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
