import React from "react";
import { motion } from "framer-motion";
import { Truck, HandPlatter, ShoppingBag } from "lucide-react";

interface CardProps {
  card: {
    id: number;
    title: string;
    content: string;
    iconType: "Delivery" | "Takeaway" | "Dining";
  };
  onClick: () => void;
  isActive: boolean;
}

const HomeCard: React.FC<CardProps> = ({ card, onClick, isActive }) => {
  const renderIcon = () => {
    switch (card.iconType) {
      case "Delivery":
        return <Truck className="w-12 h-12" />;
      case "Dining":
        return <HandPlatter className="w-12 h-12" />;
      case "Takeaway":
        return <ShoppingBag className="w-12 h-12" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full p-4 ${
        isActive
          ? "bg-[#6f42c1] text-white"
          : "border border-purple-500 text-[#6f42c1]"
      } flex flex-col items-center justify-center cursor-pointer rounded-lg shadow-lg transition-colors duration-300`}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 0.5 }}
        className={`${isActive ? "opacity-100" : "opacity-80"}`}
      >
        {renderIcon()}
      </motion.div>
      <p className="mt-2 text-sm font-semibold">{card.iconType}</p>
    </motion.div>
  );
};

export default HomeCard;
