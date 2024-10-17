import React from "react";
import { DishItemProps } from "../../types/index";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "../ui/button";

interface DishItemWithToggleProps extends DishItemProps {
  showImage: boolean;
}

const DishItem: React.FC<DishItemWithToggleProps> = ({
  dish,
  onAddDish,
  showImage,
}) => {
  return (
    <div
      className="group relative bg-gradient-to-br from-#6f42c1-50 to-amber-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => onAddDish(dish)}
    >
      {showImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ChefHat size={48} className="text-white" />
          </div>
        </div>
      )}
      <div className="p-5">
        <h3 className="text-2xl font-bold mb-3 text-gray-800">{dish.name}</h3>

        {/* New variant button design */}
        <div className="flex flex-col space-y-2 mb-4">
          {["Small", "Medium", "Large"].map((size) => (
            <div
              key={size}
              className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-sm font-medium text-gray-700">{size}</span>
              <div className="flex items-center">
                <span className="text-sm font-bold text-[#6f42c1;] mr-2">
                  QAR {dish.price}
                </span>
                <button
                  className="bg-[#6f42c1;] text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#6f42c1;] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddDish(dish);
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-md font-bold text-[#6f42c1;]">
            QAR {dish.price}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddDish(dish);
            }}
            className="bg-[#6f42c1;] hover:bg-[#6f42c1;] text-white transition-colors duration-200"
          >
            <Plus size={18} className="mr-1" /> Add to Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DishItem;
