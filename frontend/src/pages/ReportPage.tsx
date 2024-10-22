import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw, Eye, Pencil, Truck} from "lucide-react";
import SalesPrint from "@/components/SalesReport/SalesPrint";
import { api } from "@/services/api";
import TransactionsModal from "@/components/Mess/TransactionsModal";
import SalesHistoryModal from "@/components/SalesReport/SalesHistoryModal";
import SalesEditModal from "@/components/SalesReport/SalesEditModal";
import MessEditModal from "@/components/SalesReport/MessEditModal";
import { format, isValid } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverDetailsModal from "@/components/SalesReport/DriverDetailsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string;
  bank_amount: string;
  customer_phone_number: string;
  customer_name: string;
  delivery_driver_id:string;
}

interface MessType {
  id: number;
  name: string;
}

interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: MessType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  grand_total: string;
  cash_amount: string;
  bank_amount: string;
  status: string;
}

interface ProductReport {
  product_name: string;
  total_quantity: number;
  total_amount: number;
  invoice_number: string;
  order_created_at: string;
  order_type: string;
  cash_amount: string;
  bank_amount: string;
  payment_method: string;
  created_at: string;
}

interface Transaction {
  id: number;
  received_amount: number;
  cash_amount: number;
  bank_amount: number;
  payment_method: string;
  status: string;
  date: string;
}

interface Sales {
  id: number;
  total_amount: number | string;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string | number;
  bank_amount: string | number;
  customer_phone_number: string;
}

interface OnlineDeliveryReport {
  id: number;
  order_id: string;
  onlineordername: string;
  percentage: number;
  invoice: string;
  date: string;
  order_type: string;
  payment_method: string;
  order_status: string;
  total_amount: number;
  percentage_amount: number;
  balance_amount: number;
  created_at: string;
}

// Update the StaffReport interface
interface StaffReport {
  id: number;
  invoice_number: string;
  customer_phone_number: string;
  created_at: string;
  order_type: string;
  payment_method: string;
  status: string;
  total_amount: number;
  cash_amount: number;
  bank_amount: number;
  staff_name: string;
}

interface StaffReportResponse {
  results: StaffReport[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// Define the StaffUser interface
interface StaffUser {
  id: number;
  username: string;
  role: string;
}

interface Driver {
  id: number;
  username: string;
  role: string;
}

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<"sales" | "mess" | "product" | "onlineDelivery" | "staff" | "driver">("sales");
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [messReports, setMessReports] = useState<MessReport[]>([]);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [onlineDeliveryReports, setOnlineDeliveryReports] = useState<OnlineDeliveryReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [activeButton, setActiveButton] = useState<string>("All");
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);
  const [isSalesEditModalOpen, setIsSalesEditModalOpen] = useState(false);
  const [isMessEditModalOpen, setIsMessEditModalOpen] = useState(false);
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orderHistory, setOrderHistory] = useState<Sales[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [staffReports, setStaffReports] = useState<StaffReport[]>([]);
  const [currentStaffPage, setCurrentStaffPage] = useState<number>(1);
  const staffItemsPerPage = 10;

  const itemsPerPage = 10;

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [driverReports, setDriverReports] = useState<DriverReport[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetchDataWithFilter({});
  }, [reportType, fromDate, toDate, showCancelledOrders]);

  useEffect(() => {
    if (reportType === "staff" || reportType === "driver") {
      fetchStaffUsers();
    }
  }, [reportType]);

  useEffect(() => {
    console.log("Staff reports updated:", staffReports);
  }, [staffReports]);



  const fetchDataWithFilter = async (filter: Record<string, string>) => {
    try {
      let baseUrl = "";
      switch (reportType) {
        case "sales":
          baseUrl = `${import.meta.env.VITE_APP_API_URL}/orders/sales_report/`;
          break;
        case "mess":
          baseUrl = `${import.meta.env.VITE_APP_API_URL}/messes/mess_report/`;
          break;
        case "product":
          baseUrl = `${import.meta.env.VITE_APP_API_URL}/orders/product_wise_report/`;
          break;
        case "onlineDelivery":
          baseUrl = `${import.meta.env.VITE_APP_API_URL}/orders/online-delivery-report/`;
          break;
      }

      const url = new URL(baseUrl);
      const token = localStorage.getItem("token");

      const convertToUTCDate = (date: Date) => {
        const utcDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        return utcDate.toISOString().split("T")[0];
      };

      if (fromDate) {
        url.searchParams.append("from_date", convertToUTCDate(fromDate));
      }
      if (toDate) {
        url.searchParams.append("to_date", convertToUTCDate(toDate));
      }

      if (reportType !== "product" && !showCancelledOrders) {
        url.searchParams.append("order_status", "delivered");
      } else if (reportType !== "product" && showCancelledOrders) {
        url.searchParams.append("order_status", "cancelled");
      }

      Object.entries(filter).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        switch (reportType) {
          case "sales":
            setReports(data);
            break;
          case "mess":
            setMessReports(data);
            break;
          case "product":
            setProductReports(data);
            break;
          case "onlineDelivery":
            setOnlineDeliveryReports(data);
            break;
        }
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const response = await api.get("/users/");
      const allUsers = response.data.results;
      setStaffUsers(allUsers.filter((user: StaffUser) => user.role === "staff"));
      setDrivers(allUsers.filter((user: Driver) => user.role === "driver"));
    } catch (error) {
      console.error("Error fetching staff users:", error);
    }
  };

  const fetchStaffReport = async (staffId: number | null) => {
    try {
      const url = staffId
        ? `${import.meta.env.VITE_APP_API_URL}/orders/${staffId}/staff-user-order-report/`
        : `${import.meta.env.VITE_APP_API_URL}/orders/staff-user-order-report/`;
      const response = await api.get<StaffReportResponse>(url);
      console.log("Staff report response:", response.data);
      
      setStaffReports(response.data);
      console.log("Staff reports set:", response.data);
      
      if ('count' in response.data && 'next' in response.data && 'previous' in response.data) {
        setStaffReportMeta({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      }
    } catch (error) {
      console.error("Error fetching staff report:", error);
    }
  };

  const fetchTransactions = async (memberId: number) => {
    try {
      const response = await api.get(`/transactions/?mess_id=${memberId}`);
      if (response.data && Array.isArray(response.data.results)) {
        setTransactions(response.data.results);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchOrderHistory = async (mobileNumber: string) => {
    try {
      const response = await api.get(
        `/orders/user_order_history/?customer_phone_number=${mobileNumber}`
      );
      if (response.data && Array.isArray(response.data)) {
        setOrderHistory(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
    }
  };

  const handleShowCancelledOrdersClick = () => {
    setShowCancelledOrders(!showCancelledOrders);
  };

  const handleButtonClick = (buttonName: string) => {
    let filter: Record<string, string> = {};
    setActiveButton(buttonName);

    if (buttonName === "All") {
      setFromDate(null);
      setToDate(null);
      setCurrentPage(1);
      fetchDataWithFilter({});
    } else if (reportType === "sales") {
      switch (buttonName) {
        case "Dining":
          filter = { order_type: "dining" };
          break;
        case "Takeaway":
          filter = { order_type: "takeaway" };
          break;
        case "Delivery":
          filter = { order_type: "delivery" };
          break;
        case "Online Delivery":
          filter = { order_type: "onlinedelivery" };
          break;
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { payment_method: "credit" };
          break;
        case "Canceled":
          filter = { order_status: "cancelled" };
          break;
        case "Delivered":
          filter = { order_status: "delivered" };
          break;
        default:
          filter = {};
      }
    } else if (reportType === "mess") {
      switch (buttonName) {
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { credit: "credit" };
          break;
        case "Breakfast and Lunch":
          filter = { mess_type: "breakfast_lunch" };
          break;
        case "Breakfast and Dinner":
          filter = { mess_type: "lunch_dinner" };
          break;
        case "Lunch and Dinner":
          filter = { mess_type: "breakfast_dinner" };
          break;
        case "Breakfast and Lunch and Dinner":
          filter = { mess_type: "breakfast_lunch_dinner" };
          break;
        default:
          filter = {};
      }
    }

    fetchDataWithFilter(filter);
  };

  const handleStaffButtonClick = (staffId: number | null) => {
    setSelectedStaffId(staffId);
    fetchStaffReport(staffId);
  };

  const handleReportUpdate = (updatedReport: SalesReport) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    handleModalClose();
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    if (reportType === "sales") {
      setIsSalesEditModalOpen(true);
    } else if (reportType === "mess") {
      setIsMessEditModalOpen(true);
    }
  };

  const handleViewHistory = (item: any) => {
    setSelectedItem(item);
    if (reportType === "sales") {
      fetchOrderHistory(item.customer_phone_number);
      setIsSalesHistoryModalOpen(true);
    } else if (reportType === "mess") {
      fetchTransactions(item.id);
      setIsTransactionsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsSalesEditModalOpen(false);
    setIsMessEditModalOpen(false);
    setIsSalesHistoryModalOpen(false);
    setIsTransactionsModalOpen(false);
    setSelectedItem(null);
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setActiveButton("All");
    setCurrentPage(1);
    fetchDataWithFilter({});
  };
  const openModal = (driverId: string) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDriverId(null);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedMessReports = messReports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedProductReports = productReports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedOnlineDeliveryReports = onlineDeliveryReports.slice(startIndex, startIndex + itemsPerPage);
  const staffStartIndex = (currentStaffPage - 1) * staffItemsPerPage;
  const paginatedStaffReports = staffReports.slice(staffStartIndex, staffStartIndex + staffItemsPerPage);

  const totalAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.total_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.grand_total.toString()), 0)
        : reportType === "product"
          ? productReports.reduce((acc, report) => acc + parseFloat(report.total_amount.toString()), 0)
          : onlineDeliveryReports.reduce((acc, report) => acc + report.total_amount, 0);

  const totalCashAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
        : reportType === "product"
          ? productReports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
          : onlineDeliveryReports.reduce((acc, report) => acc + (report.payment_method === "cash" ? report.total_amount : 0), 0);

  const totalCardAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
        : reportType === "product"
          ? productReports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
          : onlineDeliveryReports.reduce((acc, report) => acc + (report.payment_method === "bank" ? report.total_amount : 0), 0);

  const totalBankAmount = reports
    .filter((report) => report.payment_method === "bank")
    .reduce((acc, report) => acc + parseFloat(report.bank_amount || "0"), 0);

  const totalCreditAmount = reports
    .filter((report) => report.payment_method === "credit")
    .reduce((acc, report) => acc + parseFloat(report.total_amount.toString() || "0"), 0);


  const fetchDriverReport = async (driverId: string | null) => {
    try {
      const baseUrl = `${import.meta.env.VITE_APP_API_URL}/orders/driver-report/`;
      let url = new URL(baseUrl);

      if (driverId) {
        url.searchParams.append('delivery_driver_id', driverId);
      }

      // Add date range parameters if they exist
      if (fromDate) {
        url.searchParams.append('from_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        url.searchParams.append('to_date', toDate.toISOString().split('T')[0]);
      }

      console.log("Fetching driver report with URL:", url.toString()); // Add this log

      const response = await api.get<DriverReport[]>(url.toString());
      console.log("Driver report response:", response.data); // Add this log
      setDriverReports(response.data);
    } catch (error) {
      console.error("Error fetching driver report:", error);
    }
  };

  const handleDriverButtonClick = (driverId: string | null) => {
    setSelectedDriverId(driverId);
    fetchDriverReport(driverId);
  };

  interface ReportTableProps {
    data: any[];
    reportType: 'sales' | 'mess' | 'product' | 'onlineDelivery' | 'staff' | 'driver';
    onEdit?: (item: any) => void;
    onViewHistory?: (item: any) => void;
  }

  const ReportTable: React.FC<ReportTableProps> = ({ data, reportType, onEdit, onViewHistory }) => {
    const columns = useMemo(() => {
      switch (reportType) {
        case 'sales':
          return [
            { key: 'invoice_number', header: 'Invoice' },
            { key: 'customer_phone_number', header: 'Mobile' },
            { key: 'created_at', header: 'Date', format: (value: string) => formatDate(value) },
            { key: 'order_type', header: 'Order Type' },
            { key: 'payment_method', header: 'Payment Method' },
            { key: 'status', header: 'Order Status' },
            { key: 'total_amount', header: 'Total Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'cash_amount', header: 'Cash Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'bank_amount', header: 'Bank Amount', align: 'right', format: (value: any) => formatNumber(value) },
          ];
        case 'mess':
          return [
            { key: 'customer_name', header: 'Name' },
            { key: 'mobile_number', header: 'Mobile' },
            { key: 'mess_type', header: 'Mess Type', format: (value: any) => value.name },
            { key: 'start_date', header: 'Start Date', format: (value: string) => formatDate(value) },
            { key: 'end_date', header: 'End Date', format: (value: string) => formatDate(value) },
            { key: 'total_amount', header: 'Total', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'paid_amount', header: 'Paid', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'pending_amount', header: 'Pending', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'payment_method', header: 'Payment Method' },
          ];
        case 'product':
          return [
            { key: 'product_name', header: 'Product Name' },
            { key: 'total_quantity', header: 'Total Quantity', align: 'right' },
            { key: 'invoice_number', header: 'Invoice Number' },
            { key: 'order_created_at', header: 'Order Created At', format: (value: string) => formatDate(value) },
            { key: 'order_type', header: 'Order Type' },
            { key: 'cash_amount', header: 'Cash Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'bank_amount', header: 'Bank Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'total_amount', header: 'Total Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'payment_method', header: 'Payment Method' },
          ];
        case 'onlineDelivery':
          return [
            { key: 'onlineordername', header: 'Online Order Name' },
            { key: 'invoice', header: 'Invoice' },
            { key: 'date', header: 'Date', format: (value: string) => formatDate(value) },
            { key: 'order_type', header: 'Order Type' },
            { key: 'payment_method', header: 'Payment Method' },
            { key: 'order_status', header: 'Order Status' },
            { key: 'percentage', header: 'Percentage', format: (value: number) => `${value}%` },
            { key: 'total_amount', header: 'Total Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'percentage_amount', header: 'Percentage Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'balance_amount', header: 'Balance Amount', align: 'right', format: (value: any) => formatNumber(value) },
          ];
        case 'staff':
          return [
            { key: 'invoice_number', header: 'Invoice' },
            { key: 'created_at', header: 'Date', format: (value: string) => formatDate(value) },
            { key: 'order_type', header: 'Order Type' },
            { key: 'payment_method', header: 'Payment Method' },
            { key: 'status', header: 'Order Status' },
            { key: 'total_amount', header: 'Total Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'cash_amount', header: 'Cash Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'bank_amount', header: 'Bank Amount', align: 'right', format: (value: any) => formatNumber(value) },
          ];
        case 'driver':
          return [
            { key: 'order_id', header: 'Order ID' },
            { key: 'invoice_number', header: 'Invoice Number' },
            { key: 'customer_name', header: 'Customer Name' },
            { key: 'address', header: 'Address' },
            { key: 'payment_method', header: 'Payment Method' },
            { key: 'total_amount', header: 'Total Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'bank_amount', header: 'Bank Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'cash_amount', header: 'Cash Amount', align: 'right', format: (value: any) => formatNumber(value) },
            { key: 'delivery_charge', header: 'Delivery Charge', align: 'right', format: (value: any) => formatNumber(value) },
          ];
        default:
          return [];
      }
    }, [reportType]);

    const totals = useMemo(() => {
      return data.reduce((acc, item) => {
        columns.forEach(column => {
          if (column.align === 'right' && typeof item[column.key] === 'number') {
            acc[column.key] = (acc[column.key] || 0) + item[column.key];
          }
        });
        return acc;
      }, {});
    }, [data, columns]);

    const grandTotals = useMemo(() => {
      if (reportType === 'sales') {
        return {
          total_amount: data.reduce((acc, item) => acc + parseFloat(item.total_amount.toString()), 0),
          cash_amount: data.reduce((acc, item) => acc + parseFloat(item.cash_amount.toString()), 0),
          bank_amount: data.reduce((acc, item) => acc + parseFloat(item.bank_amount.toString()), 0),
        };
      } else if (reportType === 'mess') {
        return {
          total_amount: data.reduce((acc, item) => acc + parseFloat(item.total_amount.toString()), 0),
          paid_amount: data.reduce((acc, item) => acc + parseFloat(item.paid_amount.toString()), 0),
          pending_amount: data.reduce((acc, item) => acc + parseFloat(item.pending_amount.toString()), 0),
        };
      } else if (reportType === 'staff') {
        return {
          total_amount: data.reduce((acc, item) => acc + parseFloat(item.total_amount.toString()), 0),
          cash_amount: data.reduce((acc, item) => acc + parseFloat(item.cash_amount.toString()), 0),
          bank_amount: data.reduce((acc, item) => acc + parseFloat(item.bank_amount.toString()), 0),
        };
      }
      return {};
    }, [data, reportType]);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return format(date, "dd-MM-yyyy");
    };

    const formatNumber = (value: number | string) => {
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value).toFixed(2);
      }
      return 'N/A';
    };

    const showActions = reportType === 'sales' || reportType === 'mess';

    return (
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.align === 'right' ? 'text-right' : ''}>
                  {column.header}
                </TableHead>
              ))}
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.align === 'right' ? 'text-right' : ''}>
                    {column.format ? column.format(item[column.key]) : item[column.key]}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewHistory?.(item)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit?.(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.align === 'right' ? 'text-right font-bold' : ''}>
                  {column.key in totals ? (column.format ? column.format(totals[column.key]) : totals[column.key]) : 
                   column.key === columns[0].key ? 'Grand Total' : 
                   column.key in grandTotals ? (column.format ? column.format(grandTotals[column.key]) : grandTotals[column.key]) : ''}
                </TableCell>
              ))}
              {showActions && <TableCell />}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="sales" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6 lg:w-auto">
                <TabsTrigger value="sales" onClick={() => setReportType("sales")} className="data-[state=active]:bg-purple-600 bg-white rounded-l-lg data-[state=active]:text-white border border-purple-600">Sales Report</TabsTrigger>
                <TabsTrigger value="mess" onClick={() => setReportType("mess")} className="data-[state=active]:bg-purple-600 bg-white data-[state=active]:text-white border border-purple-600">Mess Report</TabsTrigger>
                <TabsTrigger value="product" onClick={() => setReportType("product")} className="data-[state=active]:bg-purple-600 bg-white data-[state=active]:text-white border border-purple-600">Product Report</TabsTrigger>
                <TabsTrigger value="onlineDelivery" onClick={() => setReportType("onlineDelivery")} className="data-[state=active]:bg-purple-600 bg-white data-[state=active]:text-white border border-purple-600">Online Delivery Report</TabsTrigger>
                <TabsTrigger value="staff" onClick={() => setReportType("staff")} className="data-[state=active]:bg-purple-600 bg-white data-[state=active]:text-white border border-purple-600">Staff Report</TabsTrigger>
                <TabsTrigger value="driver" onClick={() => setReportType("driver")} className="data-[state=active]:bg-purple-600 bg-white rounded-r-lg data-[state=active]:text-white border border-purple-600">
                  <Truck className="w-4 h-4 mr-2" />
                  Driver Report
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  variant={showCancelledOrders ? "destructive" : "outline"}
                  onClick={handleShowCancelledOrdersClick}
                >
                  {showCancelledOrders ? "Show All Orders" : "Show Cancelled Orders"}
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
                  <DatePicker
                      selected={fromDate}
                      onChange={(date) => setFromDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="From Date"
                      className="w-full sm:w-auto p-2 border rounded"
                      />
                    <DatePicker
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="To Date"
                      className="w-full sm:w-auto p-2 border rounded"
                    />
                  </div>
                  <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <SalesPrint
                  reportType={reportType as "sales" | "mess" | "product" | "onlineDelivery" | "staff" | "driver"}
                  reports={reports}
                  messReports={messReports}
                  productReports={productReports}
                  onlineDeliveryReports={onlineDeliveryReports}
                  staffReports={staffReports}
                  driverReports={driverReports}
                  totalAmount={totalAmount}
                  totalCashAmount={totalCashAmount}
                  totalCardAmount={totalCardAmount}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeButton === "All" ? "default" : "outline"}
                  onClick={() => handleButtonClick("All")}
                >
                  All
                </Button>
                {reportType === "sales" && (
                  <>
                    {["Dining", "Takeaway", "Delivery","Online Delivery", "Cash", "Bank", "Cash-Bank", "Credit", "Delivered"].map((type) => (
                      <Button
                        key={type}
                        variant={activeButton === type ? "default" : "outline"}
                        onClick={() => handleButtonClick(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </>
                )}
                {reportType === "mess" && (
                  <>
                    {[
                      "Cash",
                      "Bank",
                      "Cash-Bank",
                      "Credit",
                      "Breakfast and Lunch",
                      "Breakfast and Dinner",
                      "Lunch and Dinner",
                      "Breakfast and Lunch and Dinner",
                    ].map((type) => (
                      <Button
                        key={type}
                        variant={activeButton === type ? "default" : "outline"}
                        onClick={() => handleButtonClick(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </>
                )}
              </div>

              {reportType === "staff" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedStaffId === null ? "default" : "outline"}
                    onClick={() => handleStaffButtonClick(null)}
                  >
                    All Staff
                  </Button>
                  {staffUsers.map((staff) => (
                    <Button
                      key={staff.id}
                      variant={selectedStaffId === staff.id ? "default" : "outline"}
                      onClick={() => handleStaffButtonClick(staff.id)}
                    >
                      {staff.username}
                    </Button>
                  ))}
                </div>
              )}

              {reportType === "driver" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDriverId === null ? "default" : "outline"}
                    onClick={() => handleDriverButtonClick(null)}
                  >
                    All Drivers
                  </Button>
                  {drivers.map((driver) => (
                    <Button
                      key={driver.id}
                      variant={selectedDriverId === driver.id.toString() ? "default" : "outline"}
                      onClick={() => handleDriverButtonClick(driver.id.toString())}
                    >
                      {driver.username}
                    </Button>
                  ))}
                </div>
              )}

              <TabsContent value="sales" className="space-y-4">
                <ReportTable 
                  data={paginatedReports} 
                  reportType="sales" 
                  onEdit={handleEdit}
                  onViewHistory={handleViewHistory}
                />
              </TabsContent>

              <TabsContent value="mess" className="space-y-4">
                <ReportTable 
                  data={paginatedMessReports} 
                  reportType="mess" 
                  onEdit={handleEdit}
                  onViewHistory={handleViewHistory}
                />
              </TabsContent>

              <TabsContent value="product" className="space-y-4">
                <ReportTable 
                  data={paginatedProductReports} 
                  reportType="product"
                />
              </TabsContent>

              <TabsContent value="onlineDelivery" className="space-y-4">
                <ReportTable 
                  data={paginatedOnlineDeliveryReports} 
                  reportType="onlineDelivery"
                />
              </TabsContent>

              <TabsContent value="staff" className="space-y-4">
                <ReportTable 
                  data={paginatedStaffReports} 
                  reportType="staff"
                />
              </TabsContent>

              <TabsContent value="driver" className="space-y-4">
                <ReportTable 
                  data={driverReports} 
                  reportType="driver"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <PaginationControls
          currentPage={reportType === "staff" ? currentStaffPage : currentPage}
          totalPages={Math.ceil(
            (reportType === "staff"
              ? staffReports.length
              : reportType === "sales"
              ? reports.length
              : reportType === "mess"
              ? messReports.length
              : reportType === "product"
              ? productReports.length
              : reportType === "driver"
              ? driverReports.length
              : onlineDeliveryReports.length) / itemsPerPage
          )}
          onPageChange={(page) => {
            if (reportType === "staff") {
              setCurrentStaffPage(page);
            } else {
              setCurrentPage(page);
            }
          }}
        />

        {isSalesEditModalOpen && selectedItem && (
          <SalesEditModal
            isOpen={isSalesEditModalOpen}
            onClose={handleModalClose}
            report={selectedItem as SalesReport}
            onUpdate={handleReportUpdate}
          />
        )}

        {isMessEditModalOpen && selectedItem && (
          <MessEditModal
            isOpen={isMessEditModalOpen}
            onClose={handleModalClose}
            report={selectedItem as MessReport}
          />
        )}

        {isSalesHistoryModalOpen && selectedItem && (
          <SalesHistoryModal
            orderhistory={orderHistory}
            isOpen={isSalesHistoryModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isTransactionsModalOpen && selectedItem && (
          <TransactionsModal
            transactions={transactions}
            isOpen={isTransactionsModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isModalOpen && (
          <DriverDetailsModal driverId={selectedDriverId!} closeModal={closeModal} />
        )}
      </div>
    </Layout>
  );
};

export default ReportPage;  