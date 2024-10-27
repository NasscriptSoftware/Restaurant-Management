import React, { useState, useEffect, useMemo } from "react";
import {  Order, PaginatedResponse } from "@/types/index";
import {
  fetchDriverOrders,
  updateDeliveryOrderStatus,
  deleteDeliveryOrder,
  individualDriverReport,
} from "@/services/api";
import { DeliveryDriverHeader } from "@/components/Layout/DeliveryDriverHeader";
import { UserRoundPenIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import Loader from "@/components/Layout/Loader";
import { DrawerDialogDemo } from "@/components/ui/DrawerDialogDemo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

export const STATUS_CHOICES: [string, string][] = [
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["in_progress", "In Progress"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

type DeliveryOrder = {
  id: number;
  driver: number;
  driver_name: string;
  status: string;
  order: Order;
  created_at: Date;
  updated_at: Date;
  invoice_number: string;
  customer_name: string;
  address: string;
  payment_method: string;
  total_amount: string;
  cash_amount: string;
  bank_amount: string;
  delivery_charge: string;
};

type ReportData = {
  id: number;
  order: {
    id: number;
    invoice_number: string;
    customer_name: string;
    address: string;
    payment_method: string;
    total_amount: string;
    cash_amount: string;
    bank_amount: string;
    delivery_charge: string;
  };
};

export const DeliveryDriverOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  console.log(orders);
  
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'orders' | 'reports'>('orders');

  useEffect(() => {
    if (activeSection === 'orders') {
      getOrders();
    } else {
      getReportData();
    }
  }, [activeSection]);

  const getOrders = async () => {
    try {
      const response = await fetchDriverOrders();
      const data = response.data as PaginatedResponse<DeliveryOrder>;
      setOrders(data.results);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReportData = async () => {
    setIsLoading(true);
    try {
      const response = await individualDriverReport();
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateDeliveryOrderStatus(orderId, newStatus);
      getOrders(); // Refresh orders after status update
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteDeliveryOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const OrderCard: React.FC<{ order: DeliveryOrder }> = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">Delivery OrderId #{order.id} for the Order #{order.order.id}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(order.created_at), "PPpp")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_CHOICES.map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => handleStatusChange(order.id, value)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
              {order.status === "cancelled" && (
                <DropdownMenuItem
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-500"
                >
                  Delete Order
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Customer:</strong> {order.order.customer_name}
        </p>
        <p>
          <strong>Address:</strong> {order.order.address}
        </p>
        <p>
          <strong>Phone:</strong> {order.order.customer_phone_number}
        </p>
        <p>
          <strong>Payment:</strong> {order.order.payment_method}
        </p>
        <p>
          <strong>Total:</strong> QAR {order.order.total_amount}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {STATUS_CHOICES.find(([value]) => value === order.status)?.[1] ||
            "Unknown Status"}
        </Button>
      </CardFooter>
    </Card>
  );

  const ReportsTable: React.FC<{ reportData: ReportData[] }> = ({ reportData }) => {
    const totals = useMemo(() => {
      return reportData.reduce((acc, item) => {
        acc.totalAmount += parseFloat(item.order.total_amount);
        acc.cashAmount += parseFloat(item.order.cash_amount);
        acc.bankAmount += parseFloat(item.order.bank_amount);
        acc.deliveryCharge += parseFloat(item.order.delivery_charge);
        return acc;
      }, {
        totalAmount: 0,
        cashAmount: 0,
        bankAmount: 0,
        deliveryCharge: 0
      });
    }, [reportData]);

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Bank Amount</TableHead>
              <TableHead>Cash Amount</TableHead>
              <TableHead>Delivery Charge</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.order.id}</TableCell>
                <TableCell>{item.order.invoice_number}</TableCell>
                <TableCell>{item.order.customer_name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{item.order.address}</TableCell>
                <TableCell>{item.order.payment_method}</TableCell>
                <TableCell>{item.order.total_amount}</TableCell>
                <TableCell>{item.order.bank_amount}</TableCell>
                <TableCell>{item.order.cash_amount}</TableCell>
                <TableCell>{item.order.delivery_charge}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="font-bold">Grand Total</TableCell>
              <TableCell className="font-bold">{totals.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="font-bold">{totals.bankAmount.toFixed(2)}</TableCell>
              <TableCell className="font-bold">{totals.cashAmount.toFixed(2)}</TableCell>
              <TableCell className="font-bold">{totals.deliveryCharge.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  };

  return (
    <div className="container mt-10 px-4">
      <DeliveryDriverHeader />

      <div className="flex justify-between items-center mt-6 mb-2">
        <div>
          <Button
            onClick={() => setActiveSection('orders')}
            variant={activeSection === 'orders' ? "default" : "outline"}
            className="mr-2"
          >
            My Orders
          </Button>
          <Button
            onClick={() => setActiveSection('reports')}
            variant={activeSection === 'reports' ? "default" : "outline"}
          >
            My Reports
          </Button>
        </div>
        <DrawerDialogDemo>
          <Avatar className="cursor-pointer flex items-center justify-center">
            <UserRoundPenIcon size={28} className="flex items-center" />
          </Avatar>
        </DrawerDialogDemo>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div>
          {activeSection === 'orders' ? (
            orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="text-center py-4">No orders available.</p>
            )
          ) : (
            <ReportsTable reportData={reportData} />
            )}
        </div>
      )}
    </div>
  );
};
