import { useState, useEffect } from "react";
import ChairEditModal from "../modals/ChairEditModal";
import { parseISO, format, isValid, differenceInSeconds } from 'date-fns';

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
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [clockEmoji, setClockEmoji] = useState<string>('🕛');

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
    const date = parseISO(timeString);
    return isValid(date) ? format(date, 'p') : 'N/A';
  };

  useEffect(() => {
    const updateRemainingTime = () => {
      if (start_time && end_time) {
        const now = new Date();
        const endDate = parseISO(end_time);
        
        if (!isValid(endDate)) {
          setRemainingTime('Invalid end time');
          setClockEmoji('❌');
          return;
        }

        const diffInSeconds = differenceInSeconds(endDate, now);
        
        if (diffInSeconds > 0) {
          const hours = Math.floor(diffInSeconds / 3600);
          const minutes = Math.floor((diffInSeconds % 3600) / 60);
          const seconds = diffInSeconds % 60;
          setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          
          // Update clock emoji
          const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
          setClockEmoji(clockEmojis[seconds % 12]);
        } else {
          setRemainingTime('Time up!');
          setClockEmoji('⏰');
        }
      } else {
        setRemainingTime('');
        setClockEmoji('');
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [start_time, end_time]);

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${is_active ? 'border-green-500 border-2' : 'border-red-500 border-2'} relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {remainingTime && (
          <div className="absolute top-2 right-2 bg-gray-200 rounded-full px-2 py-1 text-xs font-medium flex items-center">
            <span className="mr-1 animate-pulse">{clockEmoji}</span>
            <span className="animate-blink">{remainingTime}</span>
          </div>
        )}
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
            <span className="font-medium">Availability:</span>{" "}
            <span className={is_active ? "text-green-500" : "text-red-500"}>
              {is_active ? "Unoccupied" : "Occupied"}
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
          start_time: start_time || '',
          end_time: end_time || '',
          amount,
          is_active,
        }}
        onUpdate={onUpdate}
      />
    </>
  );
}
