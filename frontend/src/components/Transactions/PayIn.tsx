import React, { useState } from "react";
import PayInReport from "./PayInReport";
import PayInForm from "./PayInForm";


const PayIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"payinform" | "payinreport">("payinreport");


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">PayIn</h1>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "payinform" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("payinform")}
        >
          Pay In Form
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "payinreport" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("payinreport")}
        >
          Pay In Report
        </button>
      </div>

      <div>
        {activeTab === "payinform" && <PayInForm />}
        {activeTab === "payinreport" && <PayInReport />}
      </div>

    </div>
  );
};

export default PayIn;