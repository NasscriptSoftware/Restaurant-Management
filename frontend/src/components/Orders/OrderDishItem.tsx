import React from "react";
import { Dish } from "../../types/index";
import { motion } from "framer-motion";
import { ImageOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDishItemProps {
  dish: Dish;
  onAddDish: (dish: Dish, size?: { id: number; size: string; price: string }) => void;
  showImage: boolean;
}

const OrderDishItem: React.FC<OrderDishItemProps> = ({ dish, onAddDish, showImage }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border h-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!dish.sizes || dish.sizes.length === 0) {
          onAddDish(dish);
        }
      }}
    >
      <div className="p-2">
        {showImage ? (
          <div className="relative w-full pb-[60%] mb-2 bg-gray-100 rounded-md overflow-hidden">
            {dish.image ? (
              <img
                src={dish.image}
                alt={dish.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.png";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <ImageOff className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        ) : null}
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{dish.name}</h3>
          {dish.sizes && dish.sizes.length > 0 ? (
            <div className="space-y-1">
              {dish.sizes.map((size) => (
                <div 
                  key={size.id} 
                  className="flex items-center justify-between gap-2 text-xs text-gray-600"
                >
                  <span>{size.size}: QAR {size.price}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 px-1.5 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddDish(dish, size);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-600">QAR {dish.price}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDishItem; 