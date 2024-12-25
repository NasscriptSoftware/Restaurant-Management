import React, { useState, useEffect } from "react";
import { OrderItem } from "../../types/index";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderListItemsProps {
  orderItem: OrderItem;
  isNewlyAdded?: boolean;
  orderId: number;
  onItemDeleted: (deletedItemAmount: number) => void;
  order_status: string;
}

interface Dish {
  id: number;
  name: string;
  image: string;
}

const OrderListItems: React.FC<OrderListItemsProps> = ({
  orderItem,
  isNewlyAdded,
}) => {
  const [dishImage, setDishImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDishImage = async () => {
      try {
        const response = await api.get('/dishes/');
        const dishes: Dish[] = response.data;
        const dish = dishes.find(d => d.name === orderItem.dish_name);
        if (dish?.image) {
          setDishImage(dish.image);
        }
      } catch (error) {
        console.error('Error fetching dish image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishImage();
  }, [orderItem.dish_name]);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg ${
        isNewlyAdded ? "border-2 border-green-500" : ""
      }`}
    >
      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
        {isLoading ? (
          <Skeleton className="h-12 w-12 rounded-md" />
        ) : (
          dishImage && (
            <img
              src={dishImage}
              alt={orderItem.dish_name}
              className="h-12 w-12 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.jpg'; // Add a placeholder image
              }}
            />
          )
        )}
        <div>
          <h4 className={`font-semibold ${isNewlyAdded ? "text-green-600" : ""}`}>
            {orderItem.dish_name}
          </h4>
          {orderItem.size_name && (
            <p className="text-sm text-gray-600">Size: {orderItem.size_name}</p>
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
          QAR {(Number(orderItem.price) * orderItem.quantity).toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          QAR {Number(orderItem.price).toFixed(2)} each
        </p>
      </div>
    </div>
  );
};

export default OrderListItems;
