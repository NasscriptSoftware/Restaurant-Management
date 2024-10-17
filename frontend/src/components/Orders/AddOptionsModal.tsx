import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchFocProducts, api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, Minus } from "lucide-react";
import { Option, Order } from "@/types/index";

interface AddOptionsModalProps {
  onClose: () => void;
  onSubmit: (updatedOrder: Order) => void;
  orderId: number;
}

const AddOptionsModal: React.FC<AddOptionsModalProps> = ({
  onClose,
  onSubmit,
  orderId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [addedOptions, setAddedOptions] = useState<Option[]>([]);
  const [allFocProducts, setAllFocProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllFocProducts = async () => {
      try {
        const response = await fetchFocProducts();
        if (response) {
          setAllFocProducts(response);
        }
      } catch (error) {
        console.error("Error fetching FOC products:", error);
      }
    };

    fetchAllFocProducts();
  }, []);

  const filteredFocProducts = allFocProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOption = (option: Option) => {
    setAddedOptions((prevOptions) => {
      const existingOption = prevOptions.find((item) => item.id === option.id);
      if (existingOption) {
        return prevOptions;
      } else {
        return [...prevOptions, option];
      }
    });

    setSearchTerm("");
  };

  const handleRemoveOption = (id: number) => {
    setAddedOptions((prevOptions) => prevOptions.filter((item) => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    try {
      if (orderId === undefined) {
        throw new Error('Order ID is undefined');
      }

      const focProductIds = addedOptions.map(option => option.id);
      const payload = { foc_products: focProductIds };
      console.log('Sending payload:', payload);

      const response = await api.patch(`/orders/${orderId}/`, payload);

      if (response.status !== 200) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }

      const updatedOrder = response.data;
      console.log('Updated order:', updatedOrder);

      onSubmit(updatedOrder); // Call onSubmit with the updated order
      onClose();
    } catch (error) {
      console.error('Error updating order with FOC products:', error);
      // Add user-facing error handling here, e.g., show an error message
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add FOC to Order</DialogTitle>
          <p>{orderId}</p>
        </DialogHeader>
        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search FOC products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-grow overflow-hidden flex gap-4">
            <div className="flex-1 overflow-y-auto pr-2">
              <h4 className="text-lg font-semibold mb-2">Available FOC Products</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredFocProducts.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">Quantity: {item.quantity}</p>
                      <Button
                        onClick={() => handleAddOption(item)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add to Order
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 overflow-y-auto pl-2">
              <h4 className="text-lg font-semibold mb-2">Added Options</h4>
              <AnimatePresence>
                {addedOptions.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <Button
                        onClick={() => handleRemoveOption(item.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleFinalSubmit} variant="default">
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionsModal;
