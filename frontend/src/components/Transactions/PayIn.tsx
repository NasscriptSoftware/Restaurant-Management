import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import { api } from "@/services/api";

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  debit_credit: string;
  group: { name: string };
}

const PayIn: React.FC = () => {
  const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash"); // Default payment method
  const [cashAmount, setCashAmount] = useState<string>("");
  const [bankAmount, setBankAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/ledgers/")
      .then((response) => {
        const data = response.data.results;
        if (Array.isArray(data)) {
          setLedgerOptions(data);
        } else {
          console.error("Unexpected API response format", data);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the ledgers!", error);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      ledger_id: selectedLedger,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      cash_amount: paymentMethod === "cash" || paymentMethod === "cash-bank" ? parseFloat(cashAmount) : 0,
      bank_amount: paymentMethod === "bank" || paymentMethod === "cash-bank" ? parseFloat(bankAmount) : 0,
      remarks,
      transaction_type: "Pay In",
      payment_method: paymentMethod,
    };

    api.post("/transactions/", transactionData)
      .then((response) => {
        console.log("Transaction successful:", response.data);
      })
      .catch((error) => {
        console.error("There was an error posting the transaction!", error);
        setError("There was an error submitting the transaction. Please try again.");
      });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pay In</h1>
        <button
          onClick={handleOpenModal}
          className="bg-[#6f42c1] text-white py-2 px-4 rounded"
        >
          Create Ledger
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Ledger</label>
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="">Select a ledger</option>
              {ledgerOptions.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash-bank">Cash and Bank</option>
            </select>
          </div>

          {(paymentMethod === "cash" || paymentMethod === "cash-bank") && (
            <div>
              <label className="block mb-2">Cash Amount</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="border rounded p-2 w-full"
                step="0.01"
              />
            </div>
          )}

          {(paymentMethod === "bank" || paymentMethod === "cash-bank") && (
            <div>
              <label className="block mb-2">Bank Amount</label>
              <input
                type="number"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                className="border rounded p-2 w-full"
                step="0.01"
              />
            </div>
          )}

          <div>
            <label className="block mb-2">Debit Amount</label>
            <input
              type="number"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              className="border rounded p-2 w-full"
              step="0.01"
            />
          </div>

          <div>
            <label className="block mb-2">Credit Amount</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="border rounded p-2 w-full"
              step="0.01"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-[#6f42c1] text-white py-2 px-4 rounded"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Ledger Creation Modal */}
      <LedgerCreationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default PayIn;
