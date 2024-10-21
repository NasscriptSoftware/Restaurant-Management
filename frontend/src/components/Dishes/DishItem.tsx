import React from "react";
import { DishItemProps } from "../../types/index";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "../ui/button";

interface DishItemWithToggleProps extends DishItemProps {
  showImage: boolean;
}

interface Size {
  size: string;
  price: string;
}

const DishItem: React.FC<DishItemWithToggleProps> = ({
  dish,
  onAddDish,
  showImage,
}) => {
  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onClick={() =>
        dish.sizes && dish.sizes.length > 0 ? null : onAddDish(dish)
      }
    >
      {showImage && (
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           
          >
            <ChefHat size={48} className="text-white" />
          </div>
        </div>
      )}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
            {dish.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {dish.description}
          </p>
        </div>
        <div className="space-y-3">
          {dish.sizes && dish.sizes.length > 0 ? (
            dish.sizes.map((size: Size) => (
              <div
                key={size.size}
                className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-1.5 sm:px-4 sm:py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDish({ ...dish, sizes: [size], price: size.price });
                }}  
              >
                <span className="text-xs sm:text-[0.725rem] font-bold text-gray-700">
                  {size.size}
                </span>
                <div className="flex items-center">
                  <span className="text-xs sm:text-[0.725rem] font-bold text-purple-700 mr-1">
                    QAR {size.price}
                  </span>
                  <button
                    className="bg-purple-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-purple-700 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddDish({ ...dish, sizes: [size], price: size.price });
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm sm:text-md font-bold text-purple-700">
                QAR {dish.price}
              </span>
              <Button
                variant="default"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDish({ ...dish, price: dish.price });
                }}
                className="bg-purple-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-purple-700 transition-colors duration-200"
              >
                <Plus size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishItem;
