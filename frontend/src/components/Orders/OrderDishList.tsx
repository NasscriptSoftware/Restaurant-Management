import React from "react";
import OrderDishItem from "./OrderDishItem";
import { Dish } from "../../types/index";
import { motion } from 'framer-motion';

export interface OrderDishListProps {
  dishes: Dish[];
  onAddDish: (dish: Dish, size?: { id: number; size: string; price: string }) => void;
  showImage: boolean;
}

const OrderDishList: React.FC<OrderDishListProps> = ({ dishes, onAddDish, showImage }) => {
  return (
    <div className="container mx-auto px-2">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
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
            <OrderDishItem
              dish={dish}
              onAddDish={onAddDish}
              showImage={showImage}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default OrderDishList; 