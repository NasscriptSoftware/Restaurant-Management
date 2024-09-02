import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { X } from 'lucide-react';
import { api } from "@/services/api";

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
    variants: { variantId: number; name: string; quantity: number }[]; // Variants field
}

interface MemoModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItems: OrderItem[]; // Pass orderItems as prop
    onUpdateOrderItems: (updatedItems: OrderItem[]) => void; // Callback function to pass updated items
}

const MemoModal: React.FC<MemoModalProps> = ({ isOpen, onClose, orderItems, onUpdateOrderItems }) => {
    const [variantsCache, setVariantsCache] = useState<{ [key: number]: Variant[] }>({});
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [addedVariants, setAddedVariants] = useState<{ variantId: number; name: string; quantity: number }[]>([]);
    const [updatedOrderItems, setUpdatedOrderItems] = useState<OrderItem[]>(orderItems);

    useEffect(() => {
        if (isOpen) {
            const fetchVariants = async () => {
                const fetchedVariants: Variant[] = [];
                for (const item of orderItems) {
                    // Check if variants for this item are already cached
                    if (variantsCache[item.id]) {
                        fetchedVariants.push(...variantsCache[item.id]);
                    } else {
                        try {
                            const response = await api.get(`/variants/?dish_id=${item.id}`);
                            const itemVariants = response.data.results;
                            fetchedVariants.push(...itemVariants);
                            setVariantsCache(prevCache => ({ ...prevCache, [item.id]: itemVariants }));
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
        console.log(itemId);
        
        if (selectedVariant !== null) {
            const selectedVariantName = variants.find(v => v.id === selectedVariant)?.name || '';

            // Check if the variant already exists for the specific item
            const isVariantAlreadyAdded = addedVariants.some(v => v.variantId === selectedVariant);

            if (!isVariantAlreadyAdded) {
                setAddedVariants(prev => [
                    ...prev,
                    { variantId: selectedVariant, name: selectedVariantName, quantity }
                ]);
            }

            setSelectedVariant(null);
            setQuantity(1);
        }
    };

    useEffect(() => {
        const updateOrderItemsWithVariants = () => {
            const updatedItems = orderItems.map(item => {
                // Find the variants added for this specific item
                const itemVariants = addedVariants.filter(variant => {
                    return variants.some(v => v.id === variant.variantId && v.dish === item.id);
                });

                // Calculate the total quantity from the variants or use the default item quantity
                const totalQuantityFromVariants = itemVariants.reduce((total, variant) => total + variant.quantity, 0);
                const finalQuantity = totalQuantityFromVariants > 0 ? totalQuantityFromVariants : item.quantity;

                // Merge existing item variants with new variants if any
                const existingVariants = item.variants || [];
                const mergedVariants = [
                    ...existingVariants,
                    ...itemVariants.filter(newVariant => !existingVariants.some(v => v.variantId === newVariant.variantId))
                ];

                return {
                    ...item,
                    quantity: finalQuantity,
                    variants: mergedVariants
                };
            });

            // Only update state if the new items are different from the previous state
            if (JSON.stringify(updatedItems) !== JSON.stringify(updatedOrderItems)) {
                setUpdatedOrderItems(updatedItems);
                onUpdateOrderItems(updatedItems); // Pass updated items back to parent component
            }
        };

        updateOrderItemsWithVariants();
    }, [addedVariants, variants, orderItems, onUpdateOrderItems]);

    console.log("UpdatedOrderItems", updatedOrderItems);

    const handleRemoveVariant = (variantId: number) => {
        setAddedVariants(prev => prev.filter(v => v.variantId !== variantId));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="flex flex-col space-y-4">
                    {updatedOrderItems.map(item => {
                        // Check if the item has variants
                        const itemVariants = variants.filter(variant => variant.dish === item.id);

                        return (
                            <div key={item.id} className="flex border-b pb-4">
                                <div className="flex-1 p-4">
                                    <div className="flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold">{item.name}</span>
                                            <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                            <span className="text-sm text-gray-500">QAR{item.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4">
                                    {itemVariants.length > 0 ? (
                                        <select
                                            value={selectedVariant || ''}
                                            onChange={(e) => setSelectedVariant(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded p-2"
                                        >
                                            <option value="">Select variant</option>
                                            {itemVariants.map(variant => (
                                                <option key={variant.id} value={variant.id}>
                                                    {variant.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p>No variants available</p>
                                    )}
                                </div>
                                <div className="flex-1 p-4">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                        className="w-full border border-gray-300 rounded p-2"
                                        min="1"
                                    />
                                </div>
                                {itemVariants.length > 0 && (
                                    <div className="flex-1 p-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleAddVariant(item.id)}
                                            className="w-full bg-purple-600"
                                        >
                                            Add
                                        </Button>
                                        <div className="mt-4">
                                            <h3 className="text-md font-semibold">Added Variants:</h3>
                                            <ul>
                                                {addedVariants.map(addedVariant => (
                                                    <li key={addedVariant.variantId} className="flex items-center justify-between mb-2">
                                                        <span>{addedVariant.name} - Qty: {addedVariant.quantity}</span>
                                                        <button
                                                            onClick={() => handleRemoveVariant(addedVariant.variantId)}
                                                            className="text-red-500"
                                                        >
                                                            <X />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MemoModal;
