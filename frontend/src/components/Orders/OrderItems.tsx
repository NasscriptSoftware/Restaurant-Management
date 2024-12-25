import React, { useState, useMemo } from "react";
import { Dish } from "../../types/index";
import { Trash, Pencil } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OrderItemsProps {
  orderItem: {
    id: number;
    dish_name: string;
    arabic_name?: string | null;
    price: string | number;
    size_name: string | null;
    quantity: number;
    is_newly_added?: boolean;
    variants: any[];
  };
  dishes: Dish[];
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newPrice, setNewPrice] = useState(orderItem.price.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  // Find the corresponding dish to get the image
  const dishImage = useMemo(() => {
    const dish = dishes.find(d => d.name === orderItem.dish_name);
    return dish?.image || '/default_dish_image.jpg';
  }, [dishes, orderItem.dish_name]);

  // Convert price to number if it's a string
  const itemPrice = typeof orderItem.price === 'string' ? parseFloat(orderItem.price) : orderItem.price;

  if (isDeleted) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Calculate the amount to be deducted
      const itemTotal = itemPrice * orderItem.quantity;
      
      await api.delete(`/orders/${orderId}/remove-item/${orderItem.id}/`);
      setIsDeleted(true);
      onItemDeleted(itemTotal);
    } catch (error) {
      console.error("Error deleting item:", error);
      setIsDeleting(false);
    }
  };

  const handleEditPrice = () => {
    setShowEditDialog(true);
  };

  const handleUpdatePrice = async () => {
    try {
      setIsUpdating(true);
      const response = await api.patch(`/order-items/${orderItem.id}/`, {
        price: parseFloat(newPrice),
      });

      if (response.status === 200) {
        // Calculate the difference in total amount
        const oldTotal = itemPrice * orderItem.quantity;
        const newTotal = parseFloat(newPrice) * orderItem.quantity;
        const difference = newTotal - oldTotal;
        
        // Call onItemDeleted with the price difference
        onItemDeleted(difference);
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error("Error updating price:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg ${
          isNewlyAdded ? "border-2 border-green-500" : ""
        }`}
      >
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          <img 
            src={dishImage} 
            alt={orderItem.dish_name}
            className="w-16 h-16 object-cover rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default_dish_image.jpg';
            }}
          />
          <div>
            <h4 className={`font-semibold ${isNewlyAdded ? "text-green-600" : ""}`}>
              {orderItem.dish_name}
              {orderItem.arabic_name && (
                <span className="mr-2 text-gray-600 ml-2">
                   / {orderItem.arabic_name}
                </span>
              )}
            </h4>
            {orderItem.size_name && (
              <p>Size: {orderItem.size_name}</p>
            )}
            <p className="text-sm text-gray-600">
              Quantity: {orderItem.quantity}
            </p>
            {isNewlyAdded && (
              <span className="text-xs text-green-600">Newly Added</span>
            )}
            {order_status !== "delivered" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPrice()}
                className="mt-2"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Price
              </Button>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isDeleting || order_status === "delivered"}
                >
                  {isDeleting ? "Deleting..." : <Trash />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this item from the order.
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
            QAR {(itemPrice * orderItem.quantity).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            QAR {itemPrice.toFixed(2)} each
          </p>
        </div>
      </div>
      
      {/* Add Edit Price Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price for {orderItem.dish_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Price:</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePrice}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Price"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderItems;
