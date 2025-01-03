import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import OrderListItems from "./OrderListItems";

export interface OrderItem {
  id: number;
  dish_name: string;
  price: string;
  quantity: number;
  is_newly_added: boolean;
  size_name: string | null;
  variants: Array<{
    variantId: number;
    name: string;
    quantity: number;
  }>;
}

export interface Order {
  id: number;
  created_at: string;
  total_amount: string | number;
  status: string;
  order_type: "dining" | "takeaway" | "delivery";
  delivery_driver: {
    id: number;
    username: string;
    email: string;
    mobile_number: string;
    is_active: boolean;
    is_available: boolean;
  };
  billed_at: string;
  items: OrderItem[];
}

interface OrdersListingProps {
  isLoading: boolean;
  currentOrders: Order[];
  filteredOrders: Order[] | null;
  ordersPerPage: number;
  currentPage: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

const OrdersListing: React.FC<OrdersListingProps> = ({
  isLoading,
  currentOrders,
  filteredOrders,
  ordersPerPage,
  currentPage,
  handlePreviousPage,
  handleNextPage,
}) => {
  const [expandedOrder, setExpandedOrder] = React.useState<number | null>(null);

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-transparent";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-transparent";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-transparent";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-transparent";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (currentOrders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-gray-500 text-lg">
          No orders found for the current search or filters.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {currentOrders.map((order) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-2 sm:gap-0"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                
                {order.order_type === "delivery" && (
                  <div className="flex items-center flex-wrap gap-2 bg-blue-100 px-3 py-1.5 rounded-md w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-blue-800" />
                      <span className="text-[12px] sm:text-sm text-blue-600">Delivery Driver:</span>
                    </div>
                    <span className="text-[12px] sm:text-sm font-medium text-blue-600 break-all">
                      {order.delivery_driver?.username || 'Not Assigned'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 capitalize">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="font-semibold  sm:text-base font-semibold">
                    QAR {Number(order.total_amount).toFixed(2)}
                  </p>
                  {expandedOrder === order.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-2"
                  >
                    {order.items.map((item, index) => (
                      <OrderListItems
                        key={index}
                        orderItem={item}
                        orderId={order.id}
                        onItemDeleted={() => {""}}
                        order_status={order.status}
                        isNewlyAdded={item.is_newly_added}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {filteredOrders && filteredOrders.length > ordersPerPage && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 sm:hidden" />
            <span className="w-[100px] hidden sm:inline">Previous</span>
          </Button>
          <span className="text-sm sm:text-base flex items-center">
            Page {currentPage} of{" "}
            {Math.ceil(filteredOrders.length / ordersPerPage)}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={
              currentPage >= Math.ceil(filteredOrders.length / ordersPerPage)
            }
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-auto"
          >
            <ChevronRight className="h-4 w-4 sm:hidden" />
            <span className=" w-[100px] hidden sm:inline">Next</span>
          </Button>
        </div>
      )}
    </>
  );
};

export default OrdersListing;
