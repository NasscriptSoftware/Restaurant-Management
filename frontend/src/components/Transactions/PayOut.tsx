import React, { useState } from "react";
import PayOutReport from "./PayoutReport";
import PayOutForm from "./PayOutForm";


const PayOut: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"payoutform" | "payoutreport">("payoutreport");


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">PayOut</h1>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "payoutform" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("payoutform")}
        >
          Pay Out Form
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "payoutreport" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("payoutreport")}
        >
          Pay Out Report
        </button>
      </div>

      <div>
        {activeTab === "payoutform" && <PayOutForm />}
        {activeTab === "payoutreport" && <PayOutReport />}
      </div>

    </div>
  );
};

export default PayOut;