import { useState } from "react";
import { api } from "@/services/api"; // Ensure this is the correct path to your API
import Modal from "./Modal";

interface TableProps {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  seatsCount: number;
  capacity: number;
  isReady: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
  onUpdate: (table: { id: number; startTime: string; endTime: string; seatsCount: number; isReady: boolean; }) => void;
}

export default function Table({
  id,
  name,
  startTime,
  endTime,
  seatsCount,
  capacity,
  isReady,
  onModalOpen,
  onModalClose,
  onUpdate,
}: TableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tableDetails, setTableDetails] = useState({
    id,
    startTime,
    endTime,
    seatsCount,
    isReady,
  });


  const handleEditClick = async () => {
    try {
      const response = await api.get(`/tables/${id}/`);
      setTableDetails(response.data);
      setIsModalOpen(true);
      onModalOpen();
    } catch (error) {
      console.error("Error fetching table details:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose();
  };

  const handleUpdate = () => {
    setIsModalOpen(false);
    onUpdate(tableDetails); // Pass updated table details to the parent component
    onModalClose();
  };

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${isReady ? 'border-green-500 border-2' : 'border-red-500 border-2'
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Time:</span> {startTime} - {endTime}
          </p>
          <p className="text-sm">
            <span className="font-medium">Seats:</span> {seatsCount} / {capacity}
          </p>
          <p className="text-sm">
            <span className="font-medium">Status:</span>{" "}
            <span className={isReady ? "text-green-500" : "text-red-500"}>
              {isReady ? "Ready" : "Not Ready"}
            </span>
          </p>
        </div>
        {isHovered && (
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600 transition-colors duration-300"
            onClick={handleEditClick}
          >
            Update
          </button>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={tableDetails}
        onUpdate={handleUpdate} // Pass handleUpdate here
      />

    </>
  );
}
