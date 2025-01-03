import React from "react";

type ProductReport = {
  dish_name: string;
  total_quantity: number;
  total_amount: number;
  invoice_number: string;
  order_created_at: string;
  order_type: string;
  cash_amount: string;
  bank_amount: string;
  credit_amount: string;
  payment_method: string;
  created_at: string;
};

export interface SalesReport {
  id: number;
  invoice_number: string;
  created_at: string;
  order_type: string;
  payment_method: string;
  cash_amount: string;
  bank_amount: string;
  total_amount: number;
}

export interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: {
    name: string;
  };
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  cash_amount: string;
  bank_amount: string;
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
interface DriverReport {
  order_id: string;
  invoice_number: string;
  customer_name: string;
  address: string;
  payment_method: string;
  total_amount: number;
  bank_amount: number;
  cash_amount: number;
  delivery_charge: number;
}

interface SalesPrintProps {
  reportType: "sales" | "mess" | "product" | "onlineDelivery" | "staff" | "driver";
  reports: SalesReport[];
  messReports: MessReport[];
  productReports?: ProductReport[];  // Add productReports as an optional prop
  totalAmount: number;
  totalCashAmount: number;
  totalCardAmount: number;
  onlineDeliveryReports: OnlineDeliveryReport[];
  staffReports: StaffReport[];
  driverReports: DriverReport[];
  className?: string;
  // Other props...
}

const SalesPrint: React.FC<SalesPrintProps> = ({
  reportType,
  reports,
  messReports,
  productReports = [], // Default to an empty array if undefined
  totalAmount,
  totalCashAmount,
  totalCardAmount,
  onlineDeliveryReports,
  staffReports, // Ensure staffReports is included in the props
  driverReports,
  className
}) => {
  const printContent = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const doc = printWindow.document;
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>Print Report</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          tfoot td {
            font-weight: bold;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>${reportType === "sales" ? "Sales Report" : reportType === "mess" ? "Mess Report" : reportType === "product" ? "Product Report" : reportType === "staff" ? "Staff Report" : reportType === "driver" ? "Driver Report" : "No report"}</h1>
        ${reportType === "staff"
        ? `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Payment Type</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Cash</th>
                <th>Bank</th>
              </tr>
            </thead>
            <tbody>
              ${staffReports
          .map(
            (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.invoice_number}</td>
                  <td>${new Date(report.created_at).toLocaleDateString()}</td>
                  <td>${report.order_type}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.status}</td>
                  <td>${report.total_amount}</td>
                  <td>${report.cash_amount}</td>
                  <td>${report.bank_amount}</td>
                </tr>
              `
          )
          .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="8"></td>
                <td>Total Cash:</td>
                <td>Qar ${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="8"></td>
                <td>Total Card:</td>
                <td>Qar ${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="8"></td>
                <td>Grand Total:</td>
                <td>Qar ${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
        : ""
      }
        ${reportType === "sales"
        ? ` 
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Payment Type</th>
                <th>Cash</th>
                <th>Bank</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${reports
          .map(
            (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.invoice_number}</td>
                  <td>${new Date(report.created_at).toLocaleDateString()}</td>
                  <td>${report.order_type}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.cash_amount}</td>
                  <td>${report.bank_amount}</td>
                  <td>${report.total_amount}</td>
                </tr>
              `
          )
          .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6"></td>
                <td>Total Cash:</td>
                <td>Qar ${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Total Card:</td>
                <td>Qar ${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Grand Total:</td>
                <td>Qar ${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
        : reportType === "mess"
          ? `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Mobile No</th>
                <th>Mess Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Payment Type</th>
                <th>Pending</th>
                <th>Paid</th>
                <th>Cash</th>
                <th>Bank</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${messReports
            .map(
              (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.customer_name}</td>
                  <td>${report.mobile_number}</td>
                  <td>${report.mess_type.name}</td>
                  <td>${new Date(report.start_date).toLocaleDateString()}</td>
                  <td>${new Date(report.end_date).toLocaleDateString()}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.pending_amount}</td>
                  <td>${report.paid_amount}</td>
                  <td>${report.cash_amount}</td>
                  <td>${report.bank_amount}</td>
                  <td>${report.total_amount}</td>
                </tr>
              `
            )
            .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="10"></td>
                <td>Total Cash:</td>
                <td>Qar ${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="10"></td>
                <td>Total Card:</td>
                <td>Qar ${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="10"></td>
                <td>Grand Total:</td>
                <td>Qar ${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
          : reportType === "product"
            ? `
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Payment Type</th>
                <th>Cash</th>
                <th>Bank</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productReports
                .map(
                  (report) => `
                  <tr>
                    <td>${report.dish_name}</td>
                    <td>${report.total_quantity}</td>
                    <td>${report.invoice_number}</td>
                    <td>${new Date(report.order_created_at).toLocaleDateString()}</td>
                    <td>${report.order_type}</td>
                    <td>${report.payment_method}</td>
                    <td>${report.cash_amount}</td>
                    <td>${report.bank_amount}</td>
                    <td>${report.total_amount}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6"></td>
                <td>Total Cash:</td>
                <td>Qar ${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Total Card:</td>
                <td>Qar ${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Grand Total:</td>
                <td>Qar ${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
            : reportType === "onlineDelivery"
              ? `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Order ID</th>
                <th>Online Order Name</th>
                <th>Percentage</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Payment Method</th>
                <th>Order Status</th>
                <th>Total Amount</th>
                <th>Percentage Amount</th>
                <th>Balance Amount</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${onlineDeliveryReports
                .map(
                  (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.order_id}</td>
                  <td>${report.onlineordername}</td>
                  <td>${report.percentage}%</td>
                  <td>${report.invoice}</td>
                  <td>${new Date(report.date).toLocaleDateString()}</td>
                  <td>${report.order_type}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.order_status}</td>
                  <td>Qar ${report.total_amount.toFixed(2)}</td>
                  <td>Qar ${report.percentage_amount.toFixed(2)}</td>
                  <td>Qar ${report.balance_amount.toFixed(2)}</td>
                  <td>${new Date(report.created_at).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="9"></td>
                <td colspan="2">Grand Total:</td>
                <td colspan="2">Qar ${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
              : reportType === "driver"
                ? `
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Invoice Number</th>
                      <th>Customer Name</th>
                      <th>Address</th>
                      <th>Payment Method</th>
                      <th>Total Amount</th>
                      <th>Bank Amount</th>
                      <th>Cash Amount</th>
                      <th>Delivery Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${driverReports
                  .map(
                    (report) => `
                      <tr>
                        <td>${report.order_id}</td>
                        <td>${report.invoice_number}</td>
                        <td>${report.customer_name}</td>
                        <td>${report.address}</td>
                        <td>${report.payment_method}</td>
                        <td>Qar ${report.total_amount.toFixed(2)}</td>
                        <td>Qar ${report.bank_amount.toFixed(2)}</td>
                        <td>Qar ${report.cash_amount.toFixed(2)}</td>
                        <td>Qar ${report.delivery_charge.toFixed(2)}</td>
                      </tr>
                    `
                  )
                  .join("")}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5"></td>
                      <td>Total Cash:</td>
                      <td>Qar ${totalCashAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colspan="5"></td>
                      <td>Total Card:</td>
                      <td>Qar ${totalCardAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colspan="5"></td>
                      <td>Grand Total:</td>
                      <td>Qar ${totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              `
                : ""
      }
      </body>
      </html>
    `);
    doc.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  return (
    <div>
      <button
        onClick={printContent}
        className={`p-2 bg-green-500 text-white rounded-lg ${className}`}
      >
        Print Report
      </button>
    </div>
  );
};

export default SalesPrint;
