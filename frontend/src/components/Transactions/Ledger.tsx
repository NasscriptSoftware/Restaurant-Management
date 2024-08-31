import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  group: { name: string };
  debit_credit: string;
}

const Ledger: React.FC = () => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api
      .get("/ledgers/")
      .then((response) => {
        setLedgers(response.data.results);
      })
      .catch((error) => {
        console.error("There was an error fetching the ledgers!", error);
        setError("Could not load ledgers. Please try again later.");
      });
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ledger</h1>
        <button
          className="bg-[#6f42c1] text-white py-2 px-4 rounded hover:bg-purple-700"
          onClick={openModal}
        >
          Create Ledger
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-left">Name</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Mobile No</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Opening Balance</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Group</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Debit/Credit</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((ledger) => (
              <tr key={ledger.id} className="align-top">
                <td className="py-2 px-4 border-b">{ledger.name}</td>
                <td className="py-2 px-4 border-b">{ledger.mobile_no || "N/A"}</td>
                <td className="py-2 px-4 border-b">{ledger.opening_balance}</td>
                <td className="py-2 px-4 border-b">{ledger.group.name}</td>
                <td className="py-2 px-4 border-b">{ledger.debit_credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <LedgerCreationModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default Ledger;
