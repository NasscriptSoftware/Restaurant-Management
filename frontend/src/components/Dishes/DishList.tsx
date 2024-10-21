import React from "react";
import DishItem from "./DishItem";
import { DishListProps, Dish } from "../../types/index";
import { motion } from 'framer-motion';

const DishList: React.FC<DishListProps> = ({ dishes, onAddDish, showImage }) => {
  const handleAddDish = (dish: Dish) => {
    onAddDish(dish);
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {dishes.map((dish, index) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
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