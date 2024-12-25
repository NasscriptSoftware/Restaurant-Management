import React, { useState, useEffect, useRef } from "react";
import { Dish } from "../../types/index";
import { api } from "../../services/api";
import OrderDishList from "./OrderDishList";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Image, ImageOff } from "lucide-react";
import { useQuery } from "react-query";
import { getCategories } from "../../services/api";
import { Category } from "../../types/index";
import { HandPlatter, Coffee } from "lucide-react";

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (products: {
    dish_name: string;
    price: number;
    size_name: string | null;
    quantity: number;
    is_newly_added: boolean;
  }[]) => void;
}

interface Size {
  id: number;
  size: string;
  price: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [productSearch, setProductSearch] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Dish[]>([]);
  const [addedProducts, setAddedProducts] = useState<
    { dish: Dish; quantity: number; selectedSize?: Size }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showImage, setShowImage] = useState(() => {
    const savedShowImage = localStorage.getItem("showImage");
    return savedShowImage !== null ? JSON.parse(savedShowImage) : true;
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isMainDishesView, setIsMainDishesView] = useState(false);
  const [isServicesView, setIsServicesView] = useState(false);

  const { data: categories } = useQuery<Category[], unknown>(
    "categories",
    getCategories
  );

  const mainDishesCategory = categories?.find(
    (category) => category.name.toLowerCase() === "main dishes"
  );

  const servicesCategory = categories?.find(
    (category) => category.name.toLowerCase() === "services"
  );

  const { data: dishes } = useQuery<Dish[]>("dishes", () => 
    api.get("dishes/").then(response => response.data)
  );

  useEffect(() => {
    if (dishes) {
      setSuggestions(dishes);
    }
  }, [dishes]);

  useEffect(() => {
    if (productSearch.length > 1) {
      const filteredDishes = dishes?.filter(dish =>
        dish.name.toLowerCase().includes(productSearch.toLowerCase())
      ) || [];
      setSuggestions(filteredDishes);
    } else {
      setSuggestions(dishes || []);
    }
  }, [productSearch, dishes]);

  const handleAddProduct = (dish: Dish, selectedSize?: { id: number; size: string; price: string }) => {
    setAddedProducts((prevProducts) => {
      if (selectedSize) {
        const existingProduct = prevProducts.find(
          (product) => 
            product.dish.id === dish.id && 
            product.selectedSize?.id === selectedSize.id
        );

        if (existingProduct) {
          return prevProducts.map((product) =>
            product.dish.id === dish.id && 
            product.selectedSize?.id === selectedSize.id
              ? { ...product, quantity: product.quantity + 1 }
              : product
          );
        } else {
          return [...prevProducts, { 
            dish: {
              ...dish,
              price: parseFloat(selectedSize.price)
            }, 
            quantity: 1, 
            selectedSize: selectedSize 
          }];
        }
      } else {
        const existingProduct = prevProducts.find(
          (product) => 
            product.dish.id === dish.id && 
            !product.selectedSize
        );

        if (existingProduct) {
          return prevProducts.map((product) =>
            product.dish.id === dish.id && !product.selectedSize
              ? { ...product, quantity: product.quantity + 1 }
              : product
          );
        } else {
          return [...prevProducts, { 
            dish: {
              ...dish,
              price: dish.price ? parseFloat(dish.price.toString()) : 0
            }, 
            quantity: 1 
          }];
        }
      }
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setAddedProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].quantity = Math.max(quantity, 1);
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index: number) => {
    setAddedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
  };

  const calculateTotal = () => {
    const totalValue = addedProducts.reduce(
      (sum, product) => sum + product.quantity * Number(product.selectedSize?.price || product.dish.price),
      0
    );
    setTotalAmount(totalValue);
  };

  useEffect(() => {
    calculateTotal();
  }, [addedProducts]);

  const handleFinalSubmit = () => {
    const productsToSubmit = addedProducts.map(product => ({
      dish_name: product.dish.name,
      price: product.selectedSize 
        ? parseFloat(product.selectedSize.price) 
        : parseFloat(product.dish.price.toString()),
      size_name: product.selectedSize?.size || null,
      quantity: product.quantity,
      is_newly_added: true
    }));
  
    onSubmit(productsToSubmit);
    onClose();
  };

  const handleMainDishesClick = () => {
    setIsMainDishesView(true);
    setIsServicesView(false);
    setSelectedCategory(mainDishesCategory?.id || null);
    setProductSearch("");
  };

  const handleServicesClick = () => {
    setIsServicesView(true);
    setIsMainDishesView(false);
    setSelectedCategory(servicesCategory?.id || null);
    setProductSearch("");
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setProductSearch("");
    setIsMainDishesView(false);
    setIsServicesView(false);
  };

  const getFilteredDishes = () => {
    const mainDishesId = mainDishesCategory?.id;
    const servicesId = servicesCategory?.id;

    if (selectedCategory) {
      return suggestions.filter(dish => dish.category === selectedCategory);
    }

    if (isMainDishesView) {
      return suggestions.filter(dish => dish.category === mainDishesId);
    }

    if (isServicesView) {
      return suggestions.filter(dish => dish.category === servicesId);
    }

    return suggestions.filter(dish => 
      dish.category !== mainDishesId && 
      dish.category !== servicesId
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">Add Products to Order</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Input
                  type="text"
                  value={productSearch}
                  ref={inputRef}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-48 mr-2"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <motion.div
                className="relative w-24 h-7 bg-[#6f42c1] rounded-full p-1 cursor-pointer"
                onClick={() => setShowImage(!showImage)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white rounded-full shadow-lg flex items-center justify-center"
                  animate={{ left: showImage ? '2px' : 'calc(50% + 0px)' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {showImage ? (
                    <Image size={12} className="text-[#6f42c1]" />
                  ) : (
                    <ImageOff size={12} className="text-[#6f42c1]" />
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            <Button
              onClick={() => handleCategoryClick(null)}
              variant={
                selectedCategory === null && !isMainDishesView && !isServicesView
                  ? "default"
                  : "outline"
              }
            >
              All items
            </Button>
            {mainDishesCategory && (
              <Button
                onClick={handleMainDishesClick}
                variant={isMainDishesView ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <HandPlatter className="h-4 w-4" />
                <span>Main Dishes</span>
              </Button>
            )}
            {servicesCategory && (
              <Button
                onClick={handleServicesClick}
                variant={isServicesView ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Coffee className="h-4 w-4" />
                <span>Services</span>
              </Button>
            )}
            {categories
              ?.filter(category => 
                category.name.toLowerCase() !== "main dishes" && 
                category.name.toLowerCase() !== "services"
              )
              .map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  variant={
                    selectedCategory === category.id && !isMainDishesView && !isServicesView
                      ? "default"
                      : "outline"
                  }
                >
                  {category.name}
                </Button>
              ))}
          </div>

          <div className="mb-4">
            <OrderDishList
              dishes={getFilteredDishes()}
              onAddDish={handleAddProduct}
              showImage={showImage}
            />
          </div>

          {addedProducts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Added Products:</h4>
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Product</th>
                    <th className="border p-2 text-left">Size</th>
                    <th className="border p-2 text-left">Qty</th>
                    <th className="border p-2 text-left">Price</th>
                    <th className="border p-2 text-left">Total</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {addedProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="border p-2">{product.dish.name}</td>
                      <td className="border p-2">{product.selectedSize?.size || 'Regular'}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, parseInt(e.target.value))
                          }
                          className="border rounded p-1 w-16 text-center"
                          min="1"
                        />
                      </td>
                      <td className="border p-2">
                        QAR {product.selectedSize?.price || product.dish.price}
                      </td>
                      <td className="border p-2">
                        QAR {product.quantity * Number(product.selectedSize?.price || product.dish.price)}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t bg-white p-3 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">
              Total: QAR {totalAmount.toFixed(2)}
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => inputRef.current?.focus()}
                variant="outline"
                size="sm"
              >
                Add More
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                variant="default"
                size="sm"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
