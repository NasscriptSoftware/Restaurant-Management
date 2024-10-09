"use client";

import  { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface Variant {
  id: number;
  dish: number;
  name: string;
}

interface OrderItem {
  id: number;
  category: number;
  description: string;
  image: string;
  name: string;
  price: string;
  quantity: number;
  variants: { variantId: number; name: string; quantity: number }[];
}

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  onUpdateOrderItems: (updatedItems: OrderItem[]) => void;
}

export default function MemoModal({
  isOpen,
  onClose,
  orderItems,
  onUpdateOrderItems,
}: MemoModalProps) {
  const [variantsCache, setVariantsCache] = useState<{
    [key: number]: Variant[];
  }>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [addedVariantsPerItem, setAddedVariantsPerItem] = useState<{
    [itemId: number]: { variantId: number; name: string; quantity: number }[];
  }>({});
  const [itemQuantities, setItemQuantities] = useState<{
    [itemId: number]: number;
  }>({});
  const [updatedOrderItems, setUpdatedOrderItems] =
    useState<OrderItem[]>(orderItems);

  useEffect(() => {
    if (isOpen) {
      const fetchVariants = async () => {
        const fetchedVariants: Variant[] = [];
        for (const item of orderItems) {
          if (variantsCache[item.id]) {
            fetchedVariants.push(...variantsCache[item.id]);
          } else {
            try {
              const response = await api.get(`/variants/?dish_id=${item.id}`);
              const itemVariants = response.data.results;
              fetchedVariants.push(...itemVariants);
              setVariantsCache((prevCache) => ({
                ...prevCache,
                [item.id]: itemVariants,
              }));
            } catch (error) {
              console.error("Error fetching variants:", error);
            }
          }
        }
        setVariants(fetchedVariants);
      };

      fetchVariants();
    }
  }, [isOpen, orderItems, variantsCache]);

  const handleAddVariant = (itemId: number) => {
    if (selectedVariant !== null) {
      const selectedVariantName =
        variants.find((v) => v.id === selectedVariant)?.name || "";
      const finalQuantity = itemQuantities[itemId] || 1;

      const existingVariants = addedVariantsPerItem[itemId] || [];
      const isVariantAlreadyAdded = existingVariants.some(
        (v) => v.variantId === selectedVariant
      );

      if (!isVariantAlreadyAdded) {
        const newVariant = {
          variantId: selectedVariant,
          name: selectedVariantName,
          quantity: finalQuantity,
        };

        setAddedVariantsPerItem((prev) => ({
          ...prev,
          [itemId]: [...existingVariants, newVariant],
        }));
      }

      setSelectedVariant(null);
      setItemQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    }
  };

  const updateOrderItemsWithVariants = useCallback(() => {
    const updatedItems = orderItems.map((item) => {
      const itemVariants = addedVariantsPerItem[item.id] || [];

      const totalQuantityFromVariants = itemVariants.reduce(
        (total, variant) => total + variant.quantity,
        0
      );
      const finalQuantity =
        totalQuantityFromVariants > 0
          ? totalQuantityFromVariants
          : item.quantity;

      return {
        ...item,
        quantity: finalQuantity,
        variants: itemVariants,
      };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(updatedOrderItems)) {
      setUpdatedOrderItems(updatedItems);
      onUpdateOrderItems(updatedItems);
    }
  }, [addedVariantsPerItem, orderItems, onUpdateOrderItems, updatedOrderItems]);

  useEffect(() => {
    updateOrderItemsWithVariants();
  }, [updateOrderItemsWithVariants]);

  const handleRemoveVariant = (itemId: number, variantId: number) => {
    setAddedVariantsPerItem((prev) => {
      const updatedVariants =
        prev[itemId]?.filter((v) => v.variantId !== variantId) || [];
      return { ...prev, [itemId]: updatedVariants };
    });
  };

  const handleQuantityChange = (itemId: number, increment: number) => {
    setItemQuantities((prev) => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = Math.max(1, currentQuantity + increment);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      const updatedItems = updatedOrderItems.filter(
        (item) => item.id !== itemId
      );
      setUpdatedOrderItems(updatedItems);
      onUpdateOrderItems(updatedItems);
    },
    [updatedOrderItems, onUpdateOrderItems]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto invisible-scrollbar shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Order Items</h2>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="space-y-8">
              <AnimatePresence>
                {updatedOrderItems.map((item) => {
                  const itemVariants = variants.filter(
                    (variant) => variant.dish === item.id
                  );

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="bg-gray-50 rounded-lg p-6 relative shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                      <div className="flex items-start space-x-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-md shadow-sm"
                        />
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {item.name}
                            </h3>
                            <p className="text-lg font-medium text-gray-600 mt-1">
                              QAR {item.price}
                            </p>
                          </div>
                          {itemVariants.length > 0 && (
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleQuantityChange(item.id, -1)
                                }
                                className="bg-white"
                              >
                                <Minus className="h-4 w-4" />
                                <span className="sr-only">
                                  Decrease quantity
                                </span>
                              </Button>
                              <span className="text-lg font-semibold text-gray-700">
                                {itemQuantities[item.id] || item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="bg-white"
                              >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">
                                  Increase quantity
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          {itemVariants.length > 0 ? (
                            <div className="space-y-3">
                              <select
                                value={selectedVariant || ""}
                                onChange={(e) =>
                                  setSelectedVariant(Number(e.target.value))
                                }
                                className="w-4/5 border border-gray-300 rounded-md p-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select variant</option>
                                {itemVariants.map((variant) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="outline"
                                onClick={() => handleAddVariant(item.id)}
                                className="w-4/5 bg-white hover:bg-gray-100 transition-colors"
                              >
                                Add Variant
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No variants available
                            </p>
                          )}
                          <AnimatePresence>
                            {addedVariantsPerItem[item.id]?.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4"
                              >
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Added Variants:
                                </h4>
                                <ul className="space-y-2">
                                  {addedVariantsPerItem[item.id]?.map(
                                    (addedVariant) => (
                                      <motion.li
                                        key={addedVariant.variantId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-between text-sm bg-white p-2 rounded-md shadow-sm"
                                      >
                                        <span className="text-gray-700">
                                          {addedVariant.name} - Qty:{" "}
                                          {addedVariant.quantity}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleRemoveVariant(
                                              item.id,
                                              addedVariant.variantId
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                          <X className="h-4 w-4" />
                                          <span className="sr-only">
                                            Remove variant
                                          </span>
                                        </Button>
                                      </motion.li>
                                    )
                                  )}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
