import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import BillCard from "../components/Bills/BillCard";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw } from "lucide-react";
import { Bill } from "../types";

const BillsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch bills data from API only once
    const fetchBills = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/bills/?page=1", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAllBills(data.results);
          setFilteredBills(data.results);
        } else {
          console.error("Failed to fetch bills:", response.status);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  useEffect(() => {
    // Dynamically filter bills based on search term and date range
    let filtered = allBills;

    if (fromDate && toDate) {
      const from = new Date(fromDate).setHours(0, 0, 0, 0);
      const to = new Date(toDate).setHours(23, 59, 59, 999);

      filtered = filtered.filter((bill) => {
        const billDate = new Date(bill.billed_at).getTime();
        return billDate >= from && billDate <= to;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((bill) =>
        bill.id.toString().includes(searchTerm)
      );
    }

    setFilteredBills(filtered);
    setCurrentPage(1); // Reset to the first page on new search/filter
  }, [fromDate, toDate, searchTerm]);

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm("");
    setFilteredBills(allBills);
  };

  const handleCancelBill = async (billId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bills/${billId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setFilteredBills(filteredBills.filter((bill) => bill.id !== billId));
      } else {
        console.error("Failed to cancel bill:", response.status);
      }
    } catch (error) {
      console.error("Error canceling bill:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Generated Bills</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Date Pickers */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <button
            onClick={handleReset}
            className="mt-7 p-2 rounded-full bg-red-500 text-white shadow-md"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Search Box */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search by Invoice Number</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 p-2 border rounded"
              placeholder="Enter invoice number"
            />
          </div>
          <button
            onClick={() => {}}
            className="mt-7 p-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </div>
      </div>

      {/* Bills Display */}
      {paginatedBills.length ? (
        <>
          {paginatedBills.map((bill: Bill) => (
            <BillCard key={bill.id} bill={bill} onCancel={handleCancelBill} />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredBills.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No bills found.</p>
      )}
    </Layout>
  );
};

export default BillsPage;
