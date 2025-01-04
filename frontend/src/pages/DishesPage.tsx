import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, UseQueryResult } from "react-query";
import { Check, ChevronsUpDown, CircleCheck, Search, Image, ImageOff, HandPlatter, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../components/Layout/Layout";
import DishList from "../components/Dishes/DishList";
import OrderItem from "../components/Orders/OrderItem";
import { useDishes } from "../hooks/useDishes";
import { useOrders } from "../hooks/useOrders";
import MemoModal from "@/components/modals/MemoModal";
import KitchenNoteModal from "@/components/modals/KitchenNoteModal";
import { Category, OrderFormData, DeliveryDriver, Dish } from "../types/index";
import {
  fetchDeliveryDrivers,
  getCategories,
  fetchOnlineOrders,
  fetchCustomerDetails,
} from "../services/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/features/store";
import {
  addItem,
  clearItems,
  setItems,
  updateQuantity,
} from "@/features/slices/orderSlice";
import debounce from 'lodash/debounce';
import { memo } from 'react';

type OrderType = "dining" | "takeaway" | "delivery" | "onlinedelivery";

export type OrderDish = Dish & { 
  quantity: number; 
  variants: any[]; 
  selectedSize?: Size;
  price: number;  // Ensure price is always number
};

// ... existing imports ...

// Add this type definition
type OnlineOrder = {
  id: string | number;
  name: string;
  logo: string;

  // Add other relevant fields
};
interface Size {
  id: number;
  size: string;
  price: string;
}

// Update the type definition
type OnlineOrdersResponse = OnlineOrder[];

// 1. Memoize category finding operations
const useCategoryByName = (categories: Category[] | undefined, name: string) => {
  return useMemo(() => 
    categories?.find(category => category.name.toLowerCase() === name.toLowerCase()),
    [categories, name]
  );
};

const DishesPage: React.FC = () => {
  const dispatch = useDispatch();
  const orderItems = useSelector((state: RootState) => state.order.items);
  const { dishes, isLoading, isError } = useDishes();

  const { createOrder } = useOrders();
  const { data: categories }: UseQueryResult<Category[], unknown> = useQuery(
    "categories",
    getCategories
  );
  const { data: deliveryDriversList } = useQuery<{ results: DeliveryDriver[] }>(
    "deliveryDrivers",
    fetchDeliveryDrivers
  );
  const { data: onlinedeliveryList } = useQuery<OnlineOrdersResponse>(
    "onlinedelivery",
    fetchOnlineOrders
  );

  const [isMainDishesView, setIsMainDishesView] = useState(false);
  const [isServicesView, setIsServicesView] = useState(false);

  // 2. Use memoized categories
  const mainDishesCategory = useCategoryByName(categories, "main dishes");
  const servicesCategory = useCategoryByName(categories, "services");

  const [isOrderVisible, setIsOrderVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("dining");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineDeliveryData, setOnlineDeliveryData] =
    useState<OnlineOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(
    null
  );

  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerMobileNumber, setCustomerMobileNumber] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("0.00");
  const [openDriverSelect, setOpenDriverSelect] = useState(false);
  const [error, setError] = useState("");
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isKitchenNoteModalOpen, setIsKitchenNoteModalOpen] = useState(false);
  const [kitchenNote, setKitchenNote] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);



  const [showImage, setShowImage] = useState(() => {
    // Retrieve the value from localStorage on initial render
    const savedShowImage = localStorage.getItem("showImage");
    return savedShowImage !== null ? JSON.parse(savedShowImage) : true;
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");


  const navigate = useNavigate();

  const data = dishes || [];

  // 3. Memoize filtered dishes
  const filteredDishes = useMemo(() => {
    return data.filter((dish: Dish) => {
      const categoryMatch =
        selectedCategory === null ||
        (typeof dish.category === "number"
          ? dish.category === selectedCategory
          : dish.category.id === selectedCategory);
      const searchMatch = dish.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const mainDishesMatch = isMainDishesView
        ? dish.category === mainDishesCategory?.id
        : true;
      const servicesMatch = isServicesView
        ? dish.category === servicesCategory?.id
        : true;
      return categoryMatch && searchMatch && mainDishesMatch && servicesMatch;
    });
  }, [data, selectedCategory, searchQuery, isMainDishesView, isServicesView, mainDishesCategory, servicesCategory]);

  // 4. Memoize the subtotal and total calculations
  const { subtotal, total } = useMemo(() => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { subtotal, total: subtotal };
  }, [orderItems]);

  // 5. Optimize customer search with debounce
  const debouncedCustomerSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 3) {
        fetchCustomerDetails().then((data) => {
          const lowercaseQuery = query.toLowerCase();
          const filteredCustomers = data.filter((customer: any) => {
            return customer.customer_name.toLowerCase().includes(lowercaseQuery) ||
                   customer.phone_number.includes(query);
          });
          setCustomers(filteredCustomers);
        });
      } else {
        setCustomers([]);
      }
    }, 300),
    []
  );

  // Update the customer search effect
  useEffect(() => {
    debouncedCustomerSearch(customerSearchQuery);
    return () => debouncedCustomerSearch.cancel();
  }, [customerSearchQuery, debouncedCustomerSearch]);

  const handleMainDishesClick = () => {
    setIsMainDishesView(true);
    setIsServicesView(false);
    setSelectedCategory(mainDishesCategory?.id || null);
    setSearchQuery("");
  };

  const handleServicesClick = () => {
    setIsServicesView(true);
    setIsMainDishesView(false);
    setSelectedCategory(servicesCategory?.id || null);
    setSearchQuery("");
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setIsMainDishesView(false);
    setIsServicesView(false);
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/orders");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate]);

  useEffect(() => {
    // Load order items from localStorage on component mount
    const savedOrderItems = localStorage.getItem("orderItems");
    if (savedOrderItems) {
      dispatch(setItems(JSON.parse(savedOrderItems)));
    }
  }, [dispatch]);

  useEffect(() => {
    // Save order items to localStorage whenever they change
    localStorage.setItem("orderItems", JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    // Save showImage to localStorage whenever it changes
    localStorage.setItem("showImage", JSON.stringify(showImage));
  }, [showImage]);

  const handleSelectCustomer = (customer: any) => {
    setCustomerName(customer.customer_name);
    setDeliveryAddress(customer.address);
    setCustomerMobileNumber(customer.phone_number);
    setCustomers([]);
    setCustomerSearchQuery("");
  };

  const handleAddDish = (dish: Dish & { selectedSize?: Size }) => {
    const isServiceDish = typeof dish.category === 'number' 
      ? dish.category === servicesCategory?.id
      : dish.category.id === servicesCategory?.id;

    if (isServiceDish) {
      const dishId = typeof dish.id === 'string' ? Number(dish.id) : dish.id;
      if (isNaN(dishId)) {
        throw new Error(`Invalid dish ID: ${dish.id}`);
      }

      const orderData: OrderFormData = {
        items: [{
          id: dishId,
          dish_name: dish.name,
          price: dish.price.toString(),
          quantity: 1,
          variants: [],
          is_newly_added: false,
          size_name: null
        }],
        total_amount: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
        status: "pending",
        order_type: "dining",
        address: "",
        customer_name: "",
        customer_phone_number: "",
        delivery_charge: 0,
        delivery_driver_id: null,
        kitchen_note: "",
      };

      createOrder(orderData);
      setShowSuccessModal(true);
    } else {
      if (dish.sizes && dish.sizes.length > 0) {
        dish.sizes.forEach((size) => {
          const newDish: OrderDish = {
            ...dish,
            id: `${dish.id}-${size.id}`,
            price: parseFloat(size.price),
            quantity: 1,
            variants: [],
            selectedSize: size,
          };
          dispatch(addItem(newDish));
        });
      } else {
        const newDish: OrderDish = {
          ...dish,
          price: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
          quantity: 1,
          variants: [],
        };
        dispatch(addItem(newDish));
      }
      setIsOrderVisible(true);
    }
  };

  const updateQuantityFn = (id: number | string, change: number) => {
    dispatch(updateQuantity({ id, change }));
  };

  const handleClearItems = () => {
    dispatch(clearItems());
  };

  const handleCheckout = () => {
    try {
      if (orderType === "delivery") {
        if (!customerMobileNumber) {
          setError("Delivery contact number is required.");
          return;
        }
        if (!deliveryAddress) {
          setError("Delivery address is required for delivery orders.");
          return;
        }
      }

      const orderData: OrderFormData = {
        items: orderItems.map((item) => {
          let dishId: number;
          let sizeId: number | null = null;

          if (item.selectedSize && typeof item.selectedSize.id === "number") {
            sizeId = item.selectedSize.id;
            if (typeof item.id === "string") {
              const parts = item.id.split("-");
              dishId = parts.length === 2 ? parseInt(parts[0], 10) : Number(item.id);
              if (isNaN(dishId)) {
                throw new Error(`Invalid dish ID: ${item.id}`);
              }
            } else {
              dishId = item.id;
            }
          } else {
            dishId = typeof item.id === "string" ? Number(item.id) : item.id;
            if (isNaN(dishId)) {
              throw new Error(`Invalid dish ID: ${item.id}`);
            }
          }

          return {
            id: dishId,
            dish_name: item.name,
            price: item.price.toString(),
            quantity: item.quantity || 0,
            variants: item.variants.map((variant) => ({
              variantId: variant.variantId,
              name: variant.name,
              quantity: variant.quantity,
            })),
            is_newly_added: false,
            size_name: item.selectedSize?.size || null,
            ...(sizeId !== null ? { dish_size: sizeId } : {}),
          };
        }),
        total_amount: parseFloat(total.toFixed(2)),
        status: "pending",
        order_type: orderType,
        address: deliveryAddress || "",
        customer_name: customerName || "",
        customer_phone_number: customerMobileNumber || "",
        delivery_charge: orderType === "delivery" ? parseFloat(deliveryCharge) : 0,
        delivery_driver_id: orderType === "delivery" && selectedDriver ? selectedDriver.id : null,
        kitchen_note: kitchenNote,
      };

      if (orderType === "onlinedelivery" && onlineDeliveryData) {
        orderData.online_order = JSON.stringify(onlineDeliveryData.id);
      }

      console.log("orderData", orderData);
      createOrder(orderData);
      setShowSuccessModal(true);
      handleClearItems();
      setIsOrderVisible(false);
    } catch (error) {
      console.error(`Error creating order:`, error);
      setError("An error occurred while creating the order. Please try again.");
    }
  };

  const handleOpenKitchenNoteModal = () => {
    setIsKitchenNoteModalOpen(true);
  };

  const handleSaveKitchenNote = (note: string) => {
    setKitchenNote(note);
  };

  const handleUpdateOrderItems = (updatedItems: OrderDish[]) => {
    dispatch(setItems(updatedItems));
  };

  const handleOpenMemoModal = () => {
    setIsMemoModalOpen(true);
  };

  const handleCloseMemoModal = () => {
    setIsMemoModalOpen(false);
  };

  // Helper function to filter out service dishes
  const filterOutServiceDishes = (dishes: Dish[]) => {
    return dishes.filter((dish) =>
      typeof dish.category === "number"
        ? dish.category !== servicesCategory?.id
        : dish.category.id !== servicesCategory?.id
    );
  };

  if (isLoading)
    return (
      <Layout>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full pr-4">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
              <div className="flex flex-col gap-2 ml-10 mt-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading dishes
      </div>
    );

  // 6. Memoize the DishList component
  const MemoizedDishList = memo(DishList);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full pr-4">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
            <h2 className="text-3xl font-bold mb-4 sm:mb-0 ml-10 mt-2">
              Choose Categories
            </h2>
            <div className="flex flex-col items-end w-full sm:w-auto">


              <div className="flex items-center w-full sm:w-auto">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full sm:w-64 mr-2"
                />
                <Button variant="outline" size="icon" className="mr-2">
                  <Search className="h-4 w-4" />
                </Button>
                <motion.div
                  className="relative w-28 h-8 bg-[#6f42c1] rounded-full p-1 cursor-pointer"
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
                  <div className="h-full flex items-center justify-around text-white text-[10px] font-bold">
                    <span className={showImage ? 'invisible' : ''}></span>
                    <span className={!showImage ? 'invisible' : ''}></span>
                  </div>
                </motion.div>
              </div>
              <div className="flex space-x-2 mt-2">
                {mainDishesCategory && (
                  <Button
                    onClick={handleMainDishesClick}
                    variant={isMainDishesView ? "default" : "outline"}
                    className={`w-full h-14 sm:w-auto px-4 py-2 rounded-lg transition-all duration-300 ${
                      isMainDishesView
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-purple-500 hover:text-purple-500"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <HandPlatter className="mr-2 h-5 w-5 animate-pulse" />
                      <span>Main Dishes</span>
                    </div>
                  </Button>
                )}
                {servicesCategory && (
                  <Button
                    onClick={handleServicesClick}
                    variant={isServicesView ? "default" : "outline"}
                    className={`w-full h-14 sm:w-auto px-4 py-2 rounded-lg transition-all duration-300 ${
                      isServicesView
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-purple-500 hover:text-purple-500"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Coffee className="mr-2 h-5 w-5 animate-pulse" />
                      <span>Services</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
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
          <MemoizedDishList
            dishes={
              isServicesView
                ? filteredDishes
                : filterOutServiceDishes(filteredDishes)
            }
            onAddDish={handleAddDish}
            showImage={showImage}
          />
          {orderItems.length > 0 &&
            !isMemoModalOpen &&
            !isKitchenNoteModalOpen && (
              <div className=" flex justify-center mt-4 space-x-4 sticky bottom-0 bg-white p-4 z-10">
                <Button
                  variant="outline"
                  className="w-full h-14 border hover:border-purple-600 bg-purple-600 hover:bg-purple-500 hover:text-white text-white"
                  onClick={handleOpenMemoModal}
                >
                  Memo
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-14 border hover:border-purple-600 bg-purple-600 text-white"
                  onClick={handleOpenKitchenNoteModal}
                >
                  Kitchen Note
                </Button>
              </div>
            )}
        </div>
        {orderItems.length > 0 && (
          <div
            className={`w-full lg:w-[550px] bg-white p-4 md:p-8 mt-2 ${
              isOrderVisible ? "block" : "hidden lg:block"
            }`}
          >
            <div className="w-full sticky top-0 max-h-[100vh] overflow-y-auto hidden-scrollbar px-0 md:px-2">
              <h2 className="text-2xl font-bold mb-4">New Order</h2>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-0 md:pr-2 invisible-scrollbar w-full">
                {orderItems.map((item) => (
                  <OrderItem
                    key={item.id}
                    orderItem={{
                      ...item,
                      category:
                        typeof item.category === "number"
                          ? item.category
                          : item.category.id,
                      price: item.price,
                    }}
                    incrementQuantity={() => updateQuantityFn(item.id, 1)}
                    decrementQuantity={() => updateQuantityFn(item.id, -1)}
                    removeItem={() =>
                      updateQuantityFn(item.id, -(item.quantity || 0))
                    }
                  />
                ))}
              </div>
              <div className="mt-8 w-full">
                <div className="flex justify-between mb-2 w-full">
                  <span>Subtotal</span>
                  <span>QAR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold w-full">
                  <span>Total</span>
                  <span>QAR {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8 w-full">
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  className="w-full"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="dining"
                      id="dining"
                      className="h-5 w-5"
                    />
                    <Label htmlFor="dining" className="text-sm">
                      Dining
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="takeaway"
                      id="takeaway"
                      className="h-5 w-5"
                    />
                    <Label htmlFor="takeaway" className="text-sm">
                      Takeaway
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="delivery"
                      id="delivery"
                      className="h-5 w-5"
                    />
                    <Label htmlFor="delivery" className="text-sm">
                      Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="onlinedelivery"
                      id="onlinedelivery"
                      className="h-5 w-5"
                    />
                    <Label htmlFor="onlinedelivery" className="text-sm">
                      Online Order
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {orderType === "onlinedelivery" && (
                <div className="mt-4 w-full">
                  <Label className="text-sm font-medium mb-2 block">
                    Select Online Order Platform
                  </Label>
                  <Command className="rounded-lg border shadow-sm w-full">
                    <CommandInput
                      placeholder="Search platforms..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No platforms found.</CommandEmpty>
                      <CommandGroup>
                        {onlinedeliveryList?.map((onlineOrder) => (
                          <CommandItem
                            key={onlineOrder.id}
                            value={onlineOrder.name}
                            onSelect={() => {
                              setOnlineDeliveryData(onlineOrder);
                              setOpenDriverSelect(false);
                            }}
                            className="flex items-center space-x-2 py-2 px-2 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                              <img
                                src={onlineOrder.logo}
                                alt={onlineOrder.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{onlineOrder.name}</p>
                            </div>
                            <Check
                              className={`flex-shrink-0 h-5 w-5 text-green-500 ${
                                onlineDeliveryData?.id === onlineOrder.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
              {(orderType === "dining" || orderType === "takeaway") && (
                <div className="w-full">
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    <Label className="text-sm font-medium mb-2 block">
                      Select Customer
                    </Label>
                    <Input
                      type="text"
                      placeholder="Search Customer..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="h-9 w-full"
                    />
                    {customers.length > 0 ? (
                      <ul className="mt-2 border rounded-md shadow-sm w-full">
                        {customers.map((customer) => (
                          <li
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {customer.customer_name} - {customer.phone_number}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      customerSearchQuery.length >= 3 && (
                        <p className="mt-2 text-sm text-gray-500">No customers found</p>
                      )
                    )}
                    <div className="w-full space-y-4">
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="customerName">Customer Name (Optional)</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="customerMobileNumber">Customer Number (Optional)</Label>
                        <Input
                          id="customerMobileNumber"
                          value={customerMobileNumber}
                          onChange={(e) => setCustomerMobileNumber(e.target.value)}
                          placeholder="Enter customer contact number"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Input
                          id="address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter address"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {orderType === "delivery" && (
                <div className="w-full">
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    <Label className="text-sm font-medium mb-2 block">
                      Select Customer
                    </Label>
                    <Input
                      type="text"
                      placeholder="Search Customer..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="h-9 w-full"
                    />
                    {customers.length > 0 ? (
                      <ul className="mt-2 border rounded-md shadow-sm w-full">
                        {customers.map((customer) => (
                          <li
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {customer.customer_name} - {customer.phone_number}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      customerSearchQuery.length >= 3 && (
                        <p className="mt-2 text-sm text-gray-500">No customers found</p>
                      )
                    )}
                    <div className="w-full space-y-4">
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Input
                          id="deliveryAddress"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter delivery address"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="customerMobileNumber">
                          Customer Number
                        </Label>
                        <Input
                          id="customerMobileNumber"
                          value={customerMobileNumber}
                          onChange={(e) => setCustomerMobileNumber(e.target.value)}
                          placeholder="Enter customer contact number"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                        <Input
                          id="deliveryCharge"
                          value={deliveryCharge}
                          onChange={(e) => setDeliveryCharge(e.target.value)}
                          placeholder="Enter delivery charge"
                          className="w-full"
                        />
                      </div>
                      <div className="mt-4">
                        <Label>Select Delivery Driver</Label>
                        <Popover
                          open={openDriverSelect}
                          onOpenChange={setOpenDriverSelect}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDriverSelect}
                              className="w-full justify-between"
                            >
                              {selectedDriver
                                ? selectedDriver.username
                                : "Select driver..."}{" "}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full m-10">
                            <Command>
                              <CommandInput placeholder="Search drivers..." />
                              <CommandList>
                                <CommandEmpty>No driver found.</CommandEmpty>
                                <CommandGroup>
                                  {deliveryDriversList?.results.map((driver) => (
                                    <CommandItem
                                      key={driver.id}
                                      value={driver.username}
                                      onSelect={() => {
                                        setSelectedDriver(driver);
                                        setOpenDriverSelect(false);
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${selectedDriver?.id === driver.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                          }`}
                                      />
                                      {driver.username}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 w-full">
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {orderType !== "onlinedelivery" && (
                  <Button className="w-full my-6" onClick={handleCheckout}>
                    Checkout
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        <MemoModal
          isOpen={isMemoModalOpen}
          onClose={handleCloseMemoModal}
          orderItems={orderItems.map((item) => ({
            ...item,
            category:
              typeof item.category === "number"
                ? item.category
                : item.category.id,
            price: item.price.toString(),
          }))}
          onUpdateOrderItems={(updatedItems) => {
            handleUpdateOrderItems(
              updatedItems.map((item) => ({
                ...item,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                })) as OrderDish[]
            );
          }}
        />

        <KitchenNoteModal
          isOpen={isKitchenNoteModalOpen}
          onClose={() => setIsKitchenNoteModalOpen(false)}
          onSave={handleSaveKitchenNote}
        />
      </div>
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white p-8 rounded-lg flex flex-col items-center shadow-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CircleCheck size={64} className="text-green-500 mb-4" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Order Successful!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Your order has been placed successfully.
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mt-4"
              >
                Redirecting to orders...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default DishesPage;     

