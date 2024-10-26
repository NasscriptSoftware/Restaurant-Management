import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const Unauthorized: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-10 rounded-lg shadow-2xl text-center transform transition-all duration-500 hover:scale-105">
        <AlertTriangle className="text-purple-600 text-6xl w-full text-center mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold text-purple-600 mb-4">401 - Unauthorized</h1>
        <p className="text-lg text-gray-700 mb-6">
          Oops! You don't have permission to view this page.
        </p>
        <Link
          to="/home"
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-110"
        >
          Back to Main
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
