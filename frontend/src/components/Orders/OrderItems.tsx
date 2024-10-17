import React, { useState } from "react";
import { OrderItem, Dish } from "../../types/index";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useOrder } from "@/hooks/useOrder";

interface OrderItemsProps {
  orderItem: OrderItem;
  dishes: Dish[] | undefined;
  isNewlyAdded?: boolean;
  orderId: number;
  onItemDeleted: (deletedItemAmount: number) => void;
  order_status: string;
}

const OrderItems: React.FC<OrderItemsProps> = ({
  orderItem,
  dishes,
  isNewlyAdded,
  orderId,
  onItemDeleted,
  order_status,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const dish = dishes ? dishes.find((d) => d.id === orderItem.dish) : undefined;
  const { refetch: refetchOrder } = useOrder(orderId);
  if (!dish || isDeleted) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/orders/${orderId}/remove-item/${orderItem.id}/`);
      setIsDeleted(true);
      const deletedItemAmount = dish.price * orderItem.quantity;
      onItemDeleted(deletedItemAmount);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      refetchOrder();
      setIsDeleting(false);
    }
  };

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={isDeleting || order_status === "delivered"}>
                {isDeleting ? "Deleting..." : <Trash />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this item from the order.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
