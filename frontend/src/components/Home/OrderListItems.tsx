import React, { useState, useEffect } from "react";
import { OrderItem, DishSize, Size, Category } from "../../types/index";

import { fetchDishSizes } from "../../services/api";



export interface DishItemProps {
  dish: Dish;
  onAddDish: (dish: Dish) => void;
}
interface Dish {
  id: number | string;
  name: string;
  description: string;
  price: string | number;
  image: string;
  category: number | Category;
  sizes?: Size[];
  arabic_name: string;
}
interface OrderListItemsProps {
  orderItem: OrderItem;
  dishes: Dish[] | undefined;
  isNewlyAdded?: boolean;
  orderId: number;
  onItemDeleted: (deletedItemAmount: number) => void;
  order_status: string;
}

const OrderListItems: React.FC<OrderListItemsProps> = ({
  orderItem,
  dishes,
  isNewlyAdded,



}) => {


  const [dishSize, setDishSize] = useState<DishSize | null>(null);
  const dish = dishes ? dishes.find((d) => d.id === orderItem.dish) : undefined;


  useEffect(() => {
    if (orderItem.dish_size) {
      fetchDishSizes(Number(orderItem.dish_size))
        .then((data) => setDishSize(data))
        .catch((error) => console.error("Error fetching dish size:", error));
    }
  }, [orderItem.dish_size]);

  if (!dish) {
    return null;
  }



  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg ${isNewlyAdded ? "border-2 border-green-500" : ""
        }`}
    >
      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h4
            className={`font-semibold ${isNewlyAdded ? "text-green-600" : ""}`}
          >
            {dish.name} / {dish.arabic_name}
          </h4>
          {dishSize && (
            <p>
              Size: {dishSize.size}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Quantity: {orderItem.quantity}
          </p>
          {isNewlyAdded && (
            <span className="text-xs text-green-600">Newly Added</span>
          )}
        </div>
      </div>
      <div className="text-left sm:text-right">

        <p className="font-semibold">
          QAR {(
            (dishSize ? (dishSize.price as any) : dish.price) * Number(orderItem.quantity)
          ).toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          QAR {dishSize ? Number(dishSize.price).toFixed(2) : (dish.price)} each
        </p>
      </div>
    </div>
  );
};

export default OrderListItems;
