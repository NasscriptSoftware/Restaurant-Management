import React from "react";
import { useNavigate } from "react-router-dom";

interface SettingItemProps {
  label: string;
  className?: string; 
  url?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, className, url }) => {
  const navigate = useNavigate();

  const handleClick = () => {

    if (url && label !== "Admin Pannel") {
      navigate(url);
    }
  };

  return (
    <div
      className={`bg-[#6a0dad] p-4 rounded-lg text-white text-center font-bold transition-transform transform hover:scale-105 hover:bg-[#8b00ff] ${className}`}
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
        // Local navigation for other items
        <span onClick={handleClick} className="cursor-pointer">
          {label}
        </span>
      )}
    </div>
  );
};

export default SettingItem;
