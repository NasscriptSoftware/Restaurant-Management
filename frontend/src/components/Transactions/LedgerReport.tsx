import React, { useEffect, useState } from "react";
import { api } from "@/services/api"; // Assuming you have an API service

interface Transaction {
  id: number;
  ledger: { name: string };
  date: string;
  transaction_type: string;
  particulars: { name: string };
  voucher_no: string;
  debit_amount: string;
  credit_amount: string;
  remarks: string | null;
  balance_amount: string;
  debit_credit: string;
}

interface Ledger {
  id: number;
  name: string;
}

const LedgerReport: React.FC = () => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the list of ledgers
    api
      .get("/ledgers/")
      .then((response) => {
        setLedgers(response.data.results);
      })
      .catch((error) => {
        console.error("Error fetching ledgers:", error);
      });
  }, []);

  const handleSearch = () => {
    if (selectedLedger && fromDate && toDate) {
      setIsSearching(true);
      api
        .get(
          `/transactions/ledger_report/?ledger=${selectedLedger}&from_date=${fromDate}&to_date=${toDate}`
        )
        .then((response) => {
          setTransactions(response.data || []);
        })
        .catch((error) => {
          console.error("There was an error fetching the transactions!", error);
          setError("Could not load transactions. Please try again later.");
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* Form Inputs */}
      <div className="bg-white p-4 shadow-md rounded-md mb-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {/* Select Account */}
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Account
            </label>
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
            >
              <option value="">Select a ledger</option>
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* To Date */}
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* Search Button */}
          <div className="flex-1 self-end">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Transaction Table */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-md">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-left whitespace-nowrap">
                  Date
                </th>
                <th className="py-2 px-4 bg-gray-200 text-left whitespace-nowrap">
                  Voucher No
                </th>
                <th className="py-2 px-4 bg-gray-200 text-left whitespace-nowrap">
                  Particulars
                </th>
                <th className="py-2 px-4 bg-gray-200 text-right whitespace-nowrap">
                  Debit Amount
                </th>
                <th className="py-2 px-4 bg-gray-200 text-right whitespace-nowrap">
                  Credit Amount
                </th>
                <th className="py-2 px-4 bg-gray-200 text-left whitespace-nowrap">
                  Balance
                </th>
                <th className="py-2 px-4 bg-gray-200 text-left whitespace-nowrap">
                  Dr/Cr
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="py-2 px-4 border-b text-left whitespace-nowrap">
                    {transaction.date}
                  </td>
                  <td className="py-2 px-4 border-b text-left whitespace-nowrap">
                    {transaction.voucher_no}
                  </td>
                  <td className="py-2 px-4 border-b text-left whitespace-nowrap">
                    {transaction.particulars.name}
                  </td>
                  <td className="py-2 px-4 border-b text-right whitespace-nowrap">
                    {transaction.debit_amount}
                  </td>
                  <td className="py-2 px-4 border-b text-right whitespace-nowrap">
                    {transaction.credit_amount}
                  </td>
                  <td className="py-2 px-4 border-b text-left whitespace-nowrap">
                    {transaction.balance_amount}
                  </td>
                  <td className="py-2 px-4 border-b text-left whitespace-nowrap">
                    {transaction.debit_credit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isSearching && (
          <div className="mt-6 text-center text-gray-500">
            No Ledger Report available
          </div>
        )
      )}
    </div>
  );
};

export default LedgerReport;
