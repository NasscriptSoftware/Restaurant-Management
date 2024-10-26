import React, { useEffect, useState } from "react";
import { api } from "@/services/api"; // Adjust the import path as necessary

interface PayInEditModalProps {
  voucherNo: number;
  onClose: () => void;
  onRefresh: () => void;
}

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

const PayInEditModal: React.FC<PayInEditModalProps> = ({ voucherNo, onClose, onRefresh }) => {
  const [transaction1, setTransaction1] = useState<Transaction | null>(null);
  const [transaction2, setTransaction2] = useState<Transaction | null>(null);
  const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
  const [selectedCashBank, setSelectedCashBank] = useState<string>("");
  const [selectedParticulars, setSelectedParticulars] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [refNo, setRefNo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await api.get(`/transactions/filter_by_voucher_no?voucher_no=${voucherNo}`);
        const transactions: Transaction[] = response.data;

        if (transactions.length > 0) {
          const debitTransaction = transactions.find(t => t.debit_amount !== "0.00");
          const creditTransaction = transactions.find(t => t.credit_amount !== "0.00");

          if (debitTransaction) {
            setTransaction1(debitTransaction);
            setSelectedParticulars(debitTransaction.ledger.id.toString());
            setDate(debitTransaction.date);
            setDebitAmount(debitTransaction.debit_amount);
            setRemarks(debitTransaction.remarks);
            setRefNo(debitTransaction.ref_no || "");
          }

          if (creditTransaction) {
            setTransaction2(creditTransaction);
            setSelectedCashBank(creditTransaction.ledger.id.toString());
            setCreditAmount(creditTransaction.credit_amount);
          }

          if (!debitTransaction && !creditTransaction) {
            setError("No debit or credit transactions found for the given voucher number.");
          }
        } else {
          setError("No transactions found for the given voucher number.");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError("Failed to fetch transaction details.");
      }
    };

    const fetchAllLedgers = async () => {
      let allLedgers: Ledger[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await api.get(`/ledgers/?page=${page}`);
          const data = response.data;
          if (Array.isArray(data.results)) {
            allLedgers = [...allLedgers, ...data.results];
            hasMore = data.next !== null;
            page += 1;
          } else {
            console.error("Unexpected API response format", data);
            hasMore = false;
          }
        } catch (error) {
          console.error("There was an error fetching the ledgers!", error);
          hasMore = false;
        }
      }

      setLedgerOptions(allLedgers);
    };

    fetchTransaction();
    fetchAllLedgers();
  }, [voucherNo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (parseFloat(debitAmount) !== parseFloat(creditAmount)) {
        setError("Debit amount and credit amount must be equal.");
        return;
    }
    
    if (!transaction1 || !transaction2) return;

    setError(null);
    setIsSubmitting(true);

    const updatedTransaction1 = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedCashBank!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      transaction_type: "payin",
      ref_no: refNo ? refNo : ''
    };

    const updatedTransaction2 = {
      ledger_id: selectedCashBank!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      transaction_type: "payin",
      ref_no: refNo ? refNo : ''

    };

    try {
      await Promise.all([
        api.patch(`/transactions/${transaction1.id}/`, updatedTransaction1),
        api.patch(`/transactions/${transaction2.id}/`, updatedTransaction2),
      ]);
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error updating transactions:", error);
      setError("Failed to update transactions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Pay In - Voucher No: {voucherNo}</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-700"
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-lg font-semibold mb-1 text-black">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-lg font-semibold mb-1 text-black">Reference No.</label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold mb-1 text-black">Cash/Bank</label>
              <select
                value={selectedCashBank}
                onChange={(e) => setSelectedCashBank(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              >
                <option value="">Select an account</option>
                {ledgerOptions.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-1 text-black">Debit Amount</label>
              <input
                type="text"
                value={debitAmount}
                onChange={(e) => setDebitAmount(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full sm:w-2/6"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-1 text-black">Income/Partners/Receivables</label>
              <select
                value={selectedParticulars}
                onChange={(e) => setSelectedParticulars(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              >
                <option value="">Select an account</option>
                {ledgerOptions.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-1 text-black">Credit Amount</label>
              <input
                type="text"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full sm:w-2/6"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-lg font-semibold mb-1 text-black">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayInEditModal;