import React, { useState } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import LedgerInfo from "./LedgerInfo";
import MainGroups from "./MainGroups";

const Ledger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "report">("info");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 ">
        <h1 className="text-2xl font-bold">Ledger</h1>
        <button
          className="bg-[#6f42c1] text-white py-2 px-4 rounded hover:bg-purple-700"
          onClick={openModal}
        >
          Create Ledger
        </button>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${activeTab === "info" ? "bg-gray-400" : "bg-gray-200"} text-black hover:bg-gray-300`}
          onClick={() => setActiveTab("info")}
        >
          Ledger Info
        </button>
        <button
          className={`py-2 px-4 rounded ${activeTab === "report" ? "bg-gray-400" : "bg-gray-200"} text-black hover:bg-gray-300`}
          onClick={() => setActiveTab("report")}
        >
         Main Groups
        </button>
      </div>

      {activeTab === "info" && <LedgerInfo />}
      {activeTab === "report" && <MainGroups />}

      {isModalOpen && <LedgerCreationModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default Ledger;
