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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Add FOC to Order</DialogTitle>
            <Badge variant="secondary" className="text-lg mt-2">Order ID: #{orderId}</Badge>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-hidden flex flex-col py-4">
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
          <div className="flex-grow overflow-hidden flex gap-6">
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <h4 className="text-lg font-semibold mb-3">Available FOC Products</h4>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {filteredFocProducts.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 group"
                      onClick={() => handleAddOption(item)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{item.name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <Button
                          onClick={() => handleAddOption(item)}
                          variant="outline"
                          size="sm"
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 overflow-y-auto pl-4 custom-scrollbar">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Added Options
                <Badge variant="secondary" className="ml-2">{addedOptions.length}</Badge>
              </h4>
              <AnimatePresence>
                {addedOptions.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-4 rounded-lg shadow-sm mb-3 border border-gray-200 group hover:bg-gray-50 transition-all z-10 hover:z-20 hover:shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <Button
                        onClick={() => handleRemoveOption(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Minus className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleFinalSubmit} 
            variant="default"
            disabled={addedOptions.length === 0}
          >
            Add {addedOptions.length} {addedOptions.length === 1 ? 'FOC PRODUCT' : 'FOC PRODUCTS'} TO ORDER
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionsModal;
