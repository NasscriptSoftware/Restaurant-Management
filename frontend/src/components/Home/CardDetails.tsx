import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RotateCcw, Search } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import OrdersListing, { Order } from "./OrdersListing";
import { useDishes } from "@/hooks/useDishes";

interface CardDetailsProps {
  selectedCard: {
    id: number;
    title: string;
    content: string;
    iconType: "Delivery" | "Dining" | "Takeaway";
  } | null;
}

type StatusType = "pending" | "delivered" | "cancelled";

const CardDetails: React.FC<CardDetailsProps> = ({ selectedCard }) => {
  const [activeStatus, setActiveStatus] = useState<StatusType>("pending");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const { dishes } = useDishes();
  const data = dishes ? dishes.results : undefined;

  const ordersPerPage = 5;

  const fetchOrders = async (filters: any = {}) => {
    if (selectedCard) {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await api.get(`/orders/sales_report/`, {
          params: {
            order_type: selectedCard.iconType.toLowerCase(),
            from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
            to_date: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
            order_status: activeStatus,
            ...filters,
          },
        });

        setOrders(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setIsError(true);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedCard]);

  const handleStatusClick = (status: StatusType) => {
    setActiveStatus(status);
    setCurrentPage(1);
    fetchOrders({ order_status: status });
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setActiveStatus("pending");
    setCurrentPage(1);
    fetchOrders({ order_status: "pending" });
  };

  const handleDateFilter = () => {
    fetchOrders();
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    if (orders) {
      setCurrentPage((prevPage) =>
        prevPage < Math.ceil(orders.length / ordersPerPage)
          ? prevPage + 1
          : prevPage
      );
    }
  };

  if (!selectedCard) {
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        Select a card to see details
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        Error loading orders.
      </div>
    );
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders
    ? orders.slice(indexOfFirstOrder, indexOfLastOrder)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 shadow-lg rounded-lg h-full md:h-screen overflow-y-auto"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold mb-6"
      >
        {selectedCard.title}
      </motion.h2>

      {/* Date Filters */}
      <div className="flex flex-col justify-between md:flex-row md:space-x-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : <span>{format(new Date(), 'PPP')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : <span>{format(new Date(), 'PPP')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={handleDateFilter}
            className="w-full md:w-auto"
          >
            <Search size={18} />
          </Button>
        </div>
        <div className="flex space-x-2 items-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            className="rounded-full"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 mb-6">
        {/* Status Buttons */}
        <div className="flex flex-wrap justify-between space-x-2">
          {["delivered", "pending", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "outline"}
              className="flex-grow"
              onClick={() => handleStatusClick(status as StatusType)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <OrdersListing
        isLoading={isLoading}
        currentOrders={currentOrders}
        filteredOrders={orders}
        ordersPerPage={ordersPerPage}
        currentPage={currentPage}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        dishes={data}
      />
    </motion.div>
  );
};

export default CardDetails;
