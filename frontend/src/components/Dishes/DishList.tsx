import React from "react";
import DishItem from "./DishItem";
import { Dish } from "../../types/index";
import { motion } from 'framer-motion';

export interface DishListProps {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  showImage: boolean;
}

const DishList: React.FC<DishListProps> = ({ dishes, onAddDish, showImage }) => {
  const handleAddDish = (dish: Dish) => {
    onAddDish(dish);
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {dishes.map((dish) => (
          <motion.div
            key={dish.id}
          >
            <DishItem
              dish={dish}
              onAddDish={handleAddDish}
              showImage={showImage}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DishList;
