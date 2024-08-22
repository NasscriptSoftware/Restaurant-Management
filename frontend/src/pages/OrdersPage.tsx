import React, { lazy, useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { usePaginatedOrders } from "../hooks/useOrders";
import { useDishes } from "../hooks/useDishes";
import { SearchIcon } from "lucide-react";
const OrderCard = lazy(() => import('../components/Orders/OrderCard'));
const PaginationControls = lazy(() => import('../components/Layout/PaginationControls'));

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = usePaginatedOrders(currentPage);
  
  const {
    dishes,
    isLoading: dishesLoading,
    isError: dishesError,
  } = useDishes();

  useEffect(() => {
    if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [orders]);

  useEffect(() => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [searchQuery, orders]);

  const handleSearch = () => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else if (orders) {
      setFilteredOrders(orders.results);
    }
  };

  if (ordersLoading || dishesLoading)
    return <Layout>Loading orders and dishes...</Layout>;

  if (ordersError || dishesError)
    return (
      <Layout>Error loading orders or dishes. Please try again later.</Layout>
    );

  if (!dishes || !dishes.results) {
    return <Layout>No dish data available.</Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <div className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID..."
            className="border border-gray-300 rounded px-4 py-2"
          />
          <button
            onClick={handleSearch}
            className="text-black rounded p-2"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
      {filteredOrders.length ? (
        <>
          {filteredOrders.map((order: any) => (
            <OrderCard key={order.id} order={order} dishes={dishes.results} />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(orders.count / 10)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No orders found for the provided ID.</p>
      )}
    </Layout>
  );
};

export default OrdersPage;
