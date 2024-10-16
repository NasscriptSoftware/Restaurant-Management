import React from "react";
import { OrderItem, Dish } from "../../types/index";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

interface OrderItemsProps {
  orderItem: OrderItem;
  dishes: Dish[] | undefined;
  isNewlyAdded?: boolean;
}

const OrderItems: React.FC<OrderItemsProps> = ({
  orderItem,
  dishes,
  isNewlyAdded,
}) => {
  const dish = dishes ? dishes.find((d) => d.id === orderItem.dish) : undefined;

  if (!dish) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-xs">Image N/A</span>
          </div>
          <div>
            <h4 className="font-semibold">Dish not found</h4>
            <p className="text-sm text-gray-600">
              Quantity: {orderItem.quantity}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-semibold">Price: N/A</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg ${
        isNewlyAdded ? "border-2 border-green-500" : ""
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
            {dish.name}
          </h4>
          <p className="text-sm text-gray-600">
            Quantity: {orderItem.quantity}
          </p>
          {isNewlyAdded && (
            <span className="text-xs text-green-600">Newly Added</span>
          )}
        </div>
      </div>
      <div className="text-left sm:text-right">
        <div>
          <Button variant="ghost">
            <Trash />
          </Button>
        </div>
        <p className="font-semibold">
          QAR {(dish.price * orderItem.quantity).toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">QAR {dish.price} each</p>
      </div>
    </div>
  );
};

export default OrderItems;
