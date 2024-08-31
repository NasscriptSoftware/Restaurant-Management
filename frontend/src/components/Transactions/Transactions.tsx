import React, { useEffect, useState } from "react";
import { api } from "@/services/api"; // Assuming you have an API service

interface Transaction {
  id: number;
  ledger: { name: string };
  date: string;
  transaction_type: string;
  debit_amount: string;
  credit_amount: string;
  remarks: string | null;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/transactions/")
      .then((response) => {
        setTransactions(response.data.results);
      })
      .catch((error) => {
        console.error("There was an error fetching the transactions!", error);
        setError("Could not load transactions. Please try again later.");
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200">Ledger</th>
              <th className="py-2 px-4 bg-gray-200">Date</th>
              <th className="py-2 px-4 bg-gray-200">Transaction Type</th>
              <th className="py-2 px-4 bg-gray-200">Debit Amount</th>
              <th className="py-2 px-4 bg-gray-200">Credit Amount</th>
              <th className="py-2 px-4 bg-gray-200">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-2 px-4 border-b">{transaction.ledger.name}</td>
                <td className="py-2 px-4 border-b">{transaction.date}</td>
                <td className="py-2 px-4 border-b">{transaction.transaction_type}</td>
                <td className="py-2 px-4 border-b">{transaction.debit_amount}</td>
                <td className="py-2 px-4 border-b">{transaction.credit_amount}</td>
                <td className="py-2 px-4 border-b">{transaction.remarks || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
