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
import { Search, X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Option, Order } from "@/types/index";
import { Badge } from "@/components/ui/badge";

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

      onSubmit(updatedOrder);
      onClose();
    } catch (error) {
      console.error('Error updating order with FOC products:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[95vh] sm:h-[90vh] w-[95vw] overflow-hidden flex flex-col p-2 sm:p-6">
        <DialogHeader className="border-b pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <DialogTitle className="text-lg sm:text-2xl font-bold">Add FOC to Order</DialogTitle>
            <Badge variant="secondary" className="text-sm sm:text-lg w-fit">
              Order ID: #{orderId}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col py-2 sm:py-4">
          <div className="mb-2 sm:mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search FOC products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-h-[200px] sm:min-h-0">
              <h4 className="text-sm sm:text-lg font-semibold mb-2">Available FOC Products</h4>
              <div className="h-[30vh] sm:h-auto overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 gap-2">
                  <AnimatePresence>
                    {filteredFocProducts.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0 mr-2">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                            <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <Button
                            onClick={() => handleAddOption(item)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 sm:px-3"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Add</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] sm:min-h-0">
              <h4 className="text-sm sm:text-lg font-semibold mb-2 flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Added Options
                <Badge variant="secondary" className="ml-2 text-xs">{addedOptions.length}</Badge>
              </h4>
              <div className="h-[30vh] sm:h-auto overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {addedOptions.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-2 sm:p-4 rounded-lg shadow-sm mb-2 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                          <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <Button
                          onClick={() => handleRemoveOption(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-8 px-2 sm:px-3"
                        >
                          <Minus className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Remove</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto text-sm">
            Cancel
          </Button>
          <Button 
            onClick={handleFinalSubmit} 
            variant="default"
            disabled={addedOptions.length === 0}
            className="w-full sm:w-auto text-sm"
          >
            Add {addedOptions.length} FOC
            <span className="hidden sm:inline"> PRODUCT{addedOptions.length !== 1 ? 'S' : ''}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionsModal;
