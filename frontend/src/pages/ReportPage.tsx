import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw, Eye, Pencil } from "lucide-react";
import SalesPrint from "@/components/SalesReport/SalesPrint";
import { api } from "@/services/api";
import TransactionsModal from "@/components/Mess/TransactionsModal";
import SalesHistoryModal from "@/components/SalesReport/SalesHistoryModal";
import SalesEditModal from "@/components/SalesReport/SalesEditModal";
import MessEditModal from "@/components/SalesReport/MessEditModal";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<"sales" | "mess" | "product">("sales");
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [messReports, setMessReports] = useState<MessReport[]>([]);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [activeButton, setActiveButton] = useState<string>("All");
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);
  const [isSalesEditModalOpen, setIsSalesEditModalOpen] = useState(false);
  const [isMessEditModalOpen, setIsMessEditModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<SalesReport | MessReport | null>(null);
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orderHistory, setOrderHistory] = useState<Sales[]>([]);
  const [currentMember, setCurrentMember] = useState<SalesReport | MessReport | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDataWithFilter({});
  }, [reportType, fromDate, toDate, showCancelledOrders]);

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
        }
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
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

  const handleReportUpdate = (updatedReport: SalesReport) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    handleModalClose();
  };

  const handleSalesMobileClick = async (report: SalesReport) => {
    await fetchOrderHistory(report.customer_phone_number);
    setCurrentMember(report);
    setIsSalesHistoryModalOpen(true);
  };

  const handleMobileClick = async (report: MessReport) => {
    await fetchTransactions(report.id);
    setCurrentMember(report);
    setIsTransactionsModalOpen(true);
  };

  const handleSalesEditClick = (report: SalesReport) => {
    setCurrentReport(report);
    setIsSalesEditModalOpen(true);
  };

  const handleMessEditClick = (report: MessReport) => {
    setCurrentReport(report);
    setIsMessEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsTransactionsModalOpen(false);
    setIsSalesHistoryModalOpen(false);
    setIsSalesEditModalOpen(false);
    setIsMessEditModalOpen(false);
    setCurrentReport(null);
    setCurrentMember(null);
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setActiveButton("All");
    setCurrentPage(1);
    fetchDataWithFilter({});
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedMessReports = messReports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedProductReports = productReports.slice(startIndex, startIndex + itemsPerPage);

  const totalAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.total_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.grand_total.toString()), 0)
        : productReports.reduce((acc, report) => acc + parseFloat(report.total_amount.toString()), 0);

  const totalCashAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
        : productReports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0);

  const totalCardAmount =
    reportType === "sales"
      ? reports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
      : reportType === "mess"
        ? messReports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
        : productReports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0);

  const totalBankAmount = reports
    .filter((report) => report.payment_method === "bank")
    .reduce((acc, report) => acc + parseFloat(report.bank_amount || "0"), 0);

  const totalCreditAmount = reports
    .filter((report) => report.payment_method === "credit")
    .reduce((acc, report) => acc + parseFloat(report.total_amount.toString() || "0"), 0);

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="sales" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="sales" onClick={() => setReportType("sales")} className="data-[state=active]:bg-purple-600 bg-white rounded-l-lg data-[state=active]:text-white border border-purple-600">Sales Report</TabsTrigger>
                <TabsTrigger value="mess" onClick={() => setReportType("mess")} className="data-[state=active]:bg-purple-600 bg-white data-[state=active]:text-white border border-purple-600">Mess Report</TabsTrigger>
                <TabsTrigger value="product" onClick={() => setReportType("product")} className="data-[state=active]:bg-purple-600 bg-white rounded-r-lg data-[state=active]:text-white border border-purple-600">Product Report</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  variant={showCancelledOrders ? "destructive" : "outline"}
                  onClick={handleShowCancelledOrdersClick}
                >
                  {showCancelledOrders ? "Show All Orders" : "Show Cancelled Orders"}
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                  reportType={reportType}
                  reports={reports}
                  messReports={messReports}
                  productReports={productReports}
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
                    {["Dining", "Takeaway", "Delivery", "Cash", "Bank", "Cash-Bank", "Credit", "Delivered"].map((type) => (
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

              <TabsContent value="sales" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Invoice</th>
                        <th className="p-2 text-left">Mobile</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Order Type</th>
                        <th className="p-2 text-left">Payment Method</th>
                        <th className="p-2 text-left">Order Status</th>
                        <th className="p-2 text-left">Total Amount</th>
                        <th className="p-2 text-left">Cash Amount</th>
                        <th className="p-2 text-left">Bank Amount</th>
                        <th className="p-2 text-left">History</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-2">{report.invoice_number}</td>
                          <td className="p-2">{report.customer_phone_number || "N/A"}</td>
                          <td className="p-2">{format(new Date(report.created_at), "dd-MM-yyyy")}</td>
                          <td className="p-2 capitalize">{report.order_type}</td>
                          <td className="p-2 capitalize">{report.payment_method}</td>
                          <td className="p-2 capitalize">{report.status}</td>
                          <td className="p-2">{report.total_amount}</td>
                          <td className="p-2">
                            {parseFloat(report.cash_amount) > 0 ? report.cash_amount : "N/A"}
                          </td>
                          <td className="p-2">
                            {parseFloat(report.bank_amount) > 0 ? report.bank_amount : "N/A"}
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" onClick={() => handleSalesMobileClick(report)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" onClick={() => handleSalesEditClick(report)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="mess" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Mobile</th>
                        <th className="p-2 text-left">Mess Type</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">Paid</th>
                        <th className="p-2 text-left">Pending</th>
                        <th className="p-2 text-left">Start Date</th>
                        <th className="p-2 text-left">End Date</th>
                        <th className="p-2 text-left">Payment Method</th>
                        <th className="p-2 text-left">Order Status</th>
                        <th className="p-2 text-left">Transactions</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMessReports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-2">{report.customer_name}</td>
                          <td className="p-2">{report.mobile_number}</td>
                          <td className="p-2">{report.mess_type.name}</td>
                          <td className="p-2">{report.grand_total}</td>
                          <td className="p-2">{report.paid_amount}</td>
                          <td className="p-2">{report.pending_amount}</td>
                          <td className="p-2">{format(new Date(report.start_date), "dd-MM-yyyy")}</td>
                          <td className="p-2">{format(new Date(report.end_date), "dd-MM-yyyy")}</td>
                          <td className="p-2">{report.payment_method}</td>
                          <td className="p-2">{report.status}</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" onClick={() => handleMobileClick(report)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" onClick={() => handleMessEditClick(report)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="product" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Product Name</th>
                        <th className="p-2 text-left">Total Quantity</th>
                        <th className="p-2 text-left">Total Amount</th>
                        <th className="p-2 text-left">Invoice Number</th>
                        <th className="p-2 text-left">Order Created At</th>
                        <th className="p-2 text-left">Order Type</th>
                        <th className="p-2 text-left">Cash Amount</th>
                        <th className="p-2 text-left">Bank Amount</th>
                        <th className="p-2 text-left">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProductReports.map((report, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{report.product_name}</td>
                          <td className="p-2">{report.total_quantity}</td>
                          <td className="p-2">{report.total_amount}</td>
                          <td className="p-2">{report.invoice_number}</td>
                          <td className="p-2">{format(new Date(report.order_created_at), "dd-MM-yyyy")}</td>
                          <td className="p-2 capitalize">{report.order_type}</td>
                          <td className="p-2">{report.cash_amount}</td>
                          <td className="p-2">{report.bank_amount}</td>
                          <td className="p-2 capitalize">{report.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-end space-y-2">
              <p className="font-semibold text-right">
                Cash Amount: <span className="font-normal">₹{totalCashAmount.toFixed(2)}</span>
              </p>
              <p className="font-semibold text-right">
                Bank Amount: <span className="font-normal">₹{totalBankAmount.toFixed(2)}</span>
              </p>
              <p className="font-semibold text-right">
                Credit Amount: <span className="font-normal">₹{totalCreditAmount.toFixed(2)}</span>
              </p>
              <p className="font-semibold text-right">
                Total Amount: <span className="font-normal">₹{totalAmount.toFixed(2)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(
            (reportType === "sales"
              ? reports.length
              : reportType === "mess"
                ? messReports.length
                : productReports.length) / itemsPerPage
          )}
          onPageChange={setCurrentPage}
        />

        {isTransactionsModalOpen && currentMember && (
          <TransactionsModal
            transactions={transactions}
            isOpen={isTransactionsModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isSalesHistoryModalOpen && currentMember && (
          <SalesHistoryModal
            orderhistory={orderHistory}
            isOpen={isSalesHistoryModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isSalesEditModalOpen && (
          <SalesEditModal
            isOpen={isSalesEditModalOpen}
            onClose={handleModalClose}
            report={currentReport as SalesReport}
            onUpdate={handleReportUpdate}
          />
        )}

        {isMessEditModalOpen && (
          <MessEditModal
            isOpen={isMessEditModalOpen}
            onClose={handleModalClose}
            report={currentReport as MessReport}
          />
        )}
      </div>
    </Layout>
  );
};

export default ReportPage;