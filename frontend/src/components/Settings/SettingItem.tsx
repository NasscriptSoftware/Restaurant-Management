import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeveloperOptionModal from "./DeveloperOptionModal";

interface SettingItemProps {
  label: string;
  className?: string;
  url?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, className, url }) => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  
  // State for selected menu items
  const [selectedMenuItems, setSelectedMenuItems] = useState<{ [key: string]: boolean }>({
    // Initialize with default values if needed
    option1: false,
    option2: false,
    // Add more options as necessary
  });

  const handleClick = () => {
    if (label === "Developer Option") {
      setModalOpen(true); // Show the modal when Developer Option is clicked
    } else if (url && label !== "Admin Pannel") {
      navigate(url);
    }
  };

  // Function to handle option selection
  const handleOptionSelect = (options: { [key: string]: boolean }) => {
    setSelectedMenuItems(options); // Update selected menu items state
  };

  return (
    <div>
      <div
        className={`bg-[#6a0dad] p-4 rounded-lg text-white text-center font-bold transition-transform transform hover:scale-105 hover:bg-[#8b00ff] ${className}`}
        onClick={handleClick}
      >
        {label === "Admin Pannel" ? (
          <a
            href={import.meta.env.VITE_APP_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white"
          >
            {label}
          </a>
        ) : (
          <span className="cursor-pointer">{label}</span>
        )}
      </div>

      {/* Modal for Developer Option */}
      <DeveloperOptionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onOptionSelect={handleOptionSelect} // Pass the option select handler
        selectedMenuItems={selectedMenuItems} // Pass the current selections
      />
    </div>
  );
};

export default SettingItem;
