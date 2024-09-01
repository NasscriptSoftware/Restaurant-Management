import { api } from "@/services/api";
import React, { useState, useEffect } from "react";
interface LedgerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LedgerCreationModal: React.FC<LedgerCreationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<string>("");
  const [openingBalance, setOpeningBalance] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [debitCredit, setDebitCredit] = useState<string>("DEBIT");
  const [groupOptions, setGroupOptions] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch groups for the dropdown
    api.get("/main-groups/")
      .then((response) => {
        const data = response.data.results;
        if (Array.isArray(data)) {
          setGroupOptions(data);
        } else {
          console.error("Unexpected API response format for groups", data);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the groups!", error);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ledgerData = {
      name,
      mobile_no: mobileNo,
      opening_balance: openingBalance ? parseFloat(openingBalance) : 0,
      group,
      debit_credit: debitCredit,
    };

    api.post("/ledgers/", ledgerData)
      .then((response) => {
        console.log("Ledger created successfully:", response.data);
        onClose(); // Close the modal on successful submission
      })
      .catch((error) => {
        console.error("There was an error creating the ledger!", error);
        setError("There was an error creating the ledger. Please try again.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Create Ledger</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Mobile No</label>
            <input
              type="text"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-2">Opening Balance</label>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="border rounded p-2 w-full"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Group</label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="">Select a group</option>
              {groupOptions.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Debit/Credit</label>
            <select
              value={debitCredit}
              onChange={(e) => setDebitCredit(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="bg-[#6f42c1] text-white py-2 px-4 rounded"
            >
              Create
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default LedgerCreationModal;