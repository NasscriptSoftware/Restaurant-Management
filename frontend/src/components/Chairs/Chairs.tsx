import { useState } from "react";
import ChairEditModal from "../modals/ChairEditModal";
import { parseISO, format, isValid } from 'date-fns';

interface ChairsProps {
  id: number;
  chair_name: string;
  customer_name: string | null;
  customer_mob: string | null;
  start_time: string;
  end_time: string;
  amount: string | number | null;
  is_active: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
  onUpdate: () => void;
}

export default function Chairs({
  id,
  chair_name,
  customer_name,
  customer_mob,
  start_time,
  end_time,
  amount,
  is_active,
  onModalOpen,
  onModalClose,
  onUpdate,
}: ChairsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
    onModalOpen();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose();
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    console.log(timeString);
    const date = parseISO(timeString);
    return isValid(date) ? format(date, 'p') : 'N/A';
  };

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${is_active ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className="text-xl font-bold mb-2">{chair_name}</h3>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Customer:</span> {customer_name || 'N/A'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Mobile:</span> {customer_mob || 'N/A'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Time:</span> {`${formatTime(start_time)} - ${formatTime(end_time)}`}
          </p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> {amount || 'N/A'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Status:</span>{" "}
            <span className={is_active ? "text-green-500" : "text-red-500"}>
              {is_active ? "Active" : "Inactive"}
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
      <ChairEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        chair={{
          id,
          chair_name,
          customer_name,
          customer_mob,
          start_time,
          end_time,
          amount,
          is_active,
        }}
        onUpdate={onUpdate}
      />
    </>
  );
}
