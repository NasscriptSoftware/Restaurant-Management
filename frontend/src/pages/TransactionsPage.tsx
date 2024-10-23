import React, { useState } from "react";
import PayIn from "@/components/Transactions/PayIn";
import PayOut from "@/components/Transactions/PayOut";
import Ledger from "@/components/Transactions/Ledger";
import LedgerReport from "@/components/Transactions/LedgerReport";
import IncomeStatement from "@/components/Transactions/IncomeStatement "; // Import the new component
import BalanceSheet from "@/components/Transactions/BalanceSheet";
import Layout from "@/components/Layout/Layout";

const TransactionsPage: React.FC = () => {
  const [activeButton, setActiveButton] = useState("Ledger");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const renderContent = () => {
    switch (activeButton) {
      case "PayIn":
        return <PayIn />;
      case "PayOut":
        return <PayOut />;
      case "Ledger":
        return <Ledger />;
      case "Transactions":
        return <LedgerReport />;
      case "IncomeStatement": // Add case for IncomeStatement
        return <IncomeStatement />;
      case "BalanceSheet": // Add case for IncomeStatement
        return <BalanceSheet />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-100 min-h-screen">
        <header className="bg-white p-4 shadow-md rounded-md mb-4">
          <div className="flex flex-wrap sm:flex-nowrap w-full justify-between gap-2">
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "PayIn" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("PayIn")}
            >
              Pay In
            </button>
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "PayOut" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("PayOut")}
            >
              Pay Out
            </button>
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "Ledger" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("Ledger")}
            >
              Ledger
            </button>
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "Transactions" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("Transactions")}
            >
              Ledger Reports
            </button>
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "IncomeStatement" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("IncomeStatement")}
            >
              Income Statement
            </button>
            <button
              className={`py-2 px-4 rounded w-full ${
                activeButton === "BalanceSheet" ? "bg-[#6f42c1] text-white transition-all" : "text-purple-500 border border-purple-500 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() => handleButtonClick("BalanceSheet")}
            >
              BalanceSheet
            </button>
          </div>
        </header>
        <div className="bg-white p-4 rounded-md shadow-md">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionsPage;
