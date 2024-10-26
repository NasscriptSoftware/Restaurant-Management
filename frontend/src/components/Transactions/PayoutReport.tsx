import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import PayoutEditModal from "@/components/modals/TransactionModals/PayoutEditModal";

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  debit_credit: string;
  group: { name: string };
}

interface Transaction {
  id: number;
  ledger: Ledger;
  particulars: Ledger;
  transaction_type: string;
  date: string;
  debit_amount: string;
  credit_amount: string;
  balance_amount: string;
  remarks: string;
  voucher_no: number;
  ref_no: string | null;
}

const PayoutReport: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVoucherNo, setSelectedVoucherNo] = useState<number | null>(null);

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions/filter_transaction_by_transaction_type/?transaction_type=payout"); // Adjust API endpoint as needed
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openModal = (voucherNo: number) => {
    setSelectedVoucherNo(voucherNo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVoucherNo(null);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Payout Report</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Voucher</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Account1</th>
              <th className="py-2 px-4 border-b text-left">Account2</th>
              <th className="py-2 px-4 border-b text-left">Amount</th>
              <th className="py-2 px-4 border-b text-left">Remarks</th>
              <th className="py-2 px-4 border-b text-left">Reference</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const amount = parseFloat(transaction.debit_amount) > 0
                ? transaction.debit_amount
                : transaction.credit_amount;

              const remarks = transaction.remarks.trim() ? transaction.remarks : "N/A";
              const refNo = transaction.ref_no ? transaction.ref_no : "N/A";

              return (
                <tr key={transaction.id}>
                  <td className="py-2 px-4 border-b">{transaction.voucher_no}</td>
                  <td className="py-2 px-4 border-b">{transaction.date}</td>
                  <td className="py-2 px-4 border-b">{transaction.ledger.name}</td>
                  <td className="py-2 px-4 border-b">{transaction.particulars.name}</td>
                  <td className="py-2 px-4 border-b">{amount}</td>
                  <td className="py-2 px-4 border-b">{remarks}</td>
                  <td className="py-2 px-4 border-b">{refNo}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                      onClick={() => openModal(transaction.voucher_no)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Rendering Logic */}
      {isModalOpen && selectedVoucherNo !== null && (
        <PayoutEditModal
          voucherNo={selectedVoucherNo}
          onClose={closeModal}
          onRefresh={fetchTransactions}
        />
      )}
    </div>
  );
};

export default PayoutReport;