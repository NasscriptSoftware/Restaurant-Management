import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Check, ChevronsUpDown, CircleCheck, Search, Cog } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../components/Layout/Layout";
import DishList from "../components/Dishes/DishList";
import OrderItem from "../components/Orders/OrderItem";
import { useDishes } from "../hooks/useDishes";
import { useOrders } from "../hooks/useOrders";
import MemoModal from "@/components/modals/MemoModal";
import KitchenNoteModal from "@/components/modals/KitchenNoteModal";
import { Dish, Category, OrderFormData, DeliveryDriver } from "../types/index";
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
import Loader from "@/components/Layout/Loader";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/features/store";
import {
  addItem,
  clearItems,
  setItems,
  updateQuantity,
} from "@/features/slices/orderSlice";

type OrderType = "dining" | "takeaway" | "delivery" | "onlinedelivery";

export type OrderDish = Dish & { quantity: number; variants: any[] };

// ... existing imports ...

// Add this type definition
type OnlineOrder = {
  id: string | number;
  name: string;
  logo: string;

  // Add other relevant fields
};
interface Size {
  size: string;
  price: string;
}

const DishesPage: React.FC = () => {
  const dispatch = useDispatch();
  const orderItems = useSelector((state: RootState) => state.order.items);
  const { dishes, isLoading, isError } = useDishes();

  const { createOrder } = useOrders();
  const { data: categories } = useQuery<Category[]>(
    "categories",
    getCategories
  );
  const { data: deliveryDriversList } = useQuery<{ results: DeliveryDriver[] }>(
    "deliveryDrivers",
    fetchDeliveryDrivers
  );
  const { data: onlinedeliveryList } = useQuery<{ results: OnlineOrder[] }>(
    "onlinedelivery",
    fetchOnlineOrders
  );

  const [isServicesView, setIsServicesView] = useState(false);

  // Move this definition up, before it's used
  const servicesCategory = categories?.find(
    (category) => category.name.toLowerCase() === "service"
  );

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showImage, setShowImage] = useState(() => {
    // Retrieve the value from localStorage on initial render
    const savedShowImage = localStorage.getItem("showImage");
    return savedShowImage !== null ? JSON.parse(savedShowImage) : true;
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const handleValueChange = (value: OrderType) => {
    setOrderType(value);
    if (value === "onlinedelivery") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  };
  const navigate = useNavigate();

  const data = dishes || [];

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

  useEffect(() => {
    if (customerSearchQuery.length >= 3) {
      fetchCustomerDetails().then((data) => {
        const filteredCustomers = data.filter((customer: any) =>
          customer.customer_name.toLowerCase().includes(customerSearchQuery.toLowerCase())
        );
        setCustomers(filteredCustomers);
      });
    } else {
      setCustomers([]);
    }
  }, [customerSearchQuery]);

  const handleSelectCustomer = (customer: any) => {
    setCustomerName(customer.customer_name);
    setDeliveryAddress(customer.address);
    setCustomerMobileNumber(customer.phone_number);
    setCustomers([]);
    setCustomerSearchQuery("");
  };

  const handleAddDish = (dish: Dish & { selectedSize?: Size }) => {
    if (dish.sizes && dish.sizes.length > 0) {
      // If the dish has sizes, add each size as a separate item
      dish.sizes.forEach((size) => {
        const newDish = {
          ...dish,
          id: `${dish.id}-${size.id}`, // Create a unique ID for each size
          price: parseFloat(size.price),
          quantity: 1,
          variants: [],
          selectedSize: size,
        };
        dispatch(addItem(newDish));
      });
    } else {
      // If the dish doesn't have sizes, add it as before
      const price = dish.price ? parseFloat(dish.price) : 0;
      const newDish = {
        ...dish,
        price,
        quantity: 1,
        variants: [],
      };
      dispatch(addItem(newDish));
    }
    setIsOrderVisible(true);
  };

  const updateQuantityFn = (id: number, change: number) => {
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
        if (!selectedDriver) {
          setError("A delivery driver must be selected for delivery orders.");
          return;
        }
      }
      const orderData: OrderFormData = {
        items: orderItems.map((item) => {
          let dishId = item.id;
          let sizeId = null;

          // Check if the item has a selectedSize property
          if (item.selectedSize && typeof item.selectedSize.id === "number") {
            sizeId = item.selectedSize.id;
            // If the item.id is a string, it might be the composite id
            if (typeof item.id === "string") {
              const parts = item.id.split("-");
              if (parts.length === 2) {
                dishId = parseInt(parts[0], 10);
                // We already have sizeId from selectedSize, so we don't need to parse it again
              } else {
                // If it's not in the expected format, use the whole string as dishId
                dishId = parseInt(item.id, 10) || item.id;
              }
            }
          } else {
            // If there's no selectedSize, treat the id as is
            dishId =
              typeof item.id === "string"
                ? parseInt(item.id, 10) || item.id
                : item.id;
          }

          return {
            id: dishId,
            dish: dishId,
            quantity: item.quantity || 0,
            variants: item.variants.map((variant) => ({
              variantId: variant.variantId,
              name: variant.name,
              quantity: variant.quantity,
            })),
            is_newly_added: false,
            ...(sizeId !== null ? { dish_size: sizeId } : {}),
          };
        }),
        total_amount: parseFloat(total.toFixed(2)),
        status: "pending",
        order_type: orderType,
        address: orderType === "delivery" ? deliveryAddress : "",
        customer_name: orderType === "delivery" ? customerName : "",
        customer_phone_number:
          orderType === "delivery" ? customerMobileNumber : "",
        delivery_charge:
          orderType === "delivery" ? parseFloat(deliveryCharge) : 0,
        delivery_driver_id:
          orderType === "delivery" && selectedDriver ? selectedDriver.id : null,
        kitchen_note: kitchenNote,
      };

      // Add online_order only if orderType is "onlinedelivery"
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

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setIsServicesView(false);
  };

  const handleServicesClick = () => {
    setIsServicesView(true);
    setSelectedCategory(servicesCategory?.id || null);
    setSearchQuery("");
  };

  const filteredDishes = data.filter((dish: Dish) => {
    const categoryMatch =
      selectedCategory === null ||
      (typeof dish.category === "number"
        ? dish.category === selectedCategory
        : dish.category.id === selectedCategory);
    const searchMatch = dish.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const serviceMatch = isServicesView
      ? dish.category === servicesCategory?.id
      : dish.category !== servicesCategory?.id;
    return categoryMatch && searchMatch && serviceMatch;
  });

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
        <Loader />
      </Layout>
    );
  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading dishes
      </div>
    );

  const subtotal = orderItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const total = subtotal;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full pr-4">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
            <h2 className="text-3xl font-bold mb-4 sm:mb-0 ml-10 mt-2">
              Choose Categories
            </h2>
            <div className="flex flex-col items-end w-full sm:w-auto">
              <div className="flex items-center w-full sm:w-auto mb-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full sm:w-64 mr-2"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {/* Image toggle button */}
              {/* ... */}
              {servicesCategory && (
                <Button
                  onClick={handleServicesClick}
                  variant={isServicesView ? "default" : "outline"}
                  className={`w-full sm:w-auto mt-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isServicesView
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-purple-500 hover:text-purple-500"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Cog className="mr-2 h-5 w-5" />
                    <span>Services</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              onClick={() => handleCategoryClick(null)}
              variant={
                selectedCategory === null && !isServicesView
                  ? "default"
                  : "outline"
              }
            >
              All items
            </Button>
            {categories
              ?.filter((category) => category.name.toLowerCase() !== "service")
              .map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  variant={
                    selectedCategory === category.id && !isServicesView
                      ? "default"
                      : "outline"
                  }
                >
                  {category.name}
                </Button>
              ))}
          </div>
          <DishList
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
              <div className="flex justify-center mt-4 space-x-4 sticky bottom-0 bg-white p-4 z-10">
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
            className={`w-full flex  md:justify-center items-center md:items-start flex-col md:flex-row lg:w-[550px] bg-white p-8 mt-2 ${
              isOrderVisible ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-0">
              <h2 className="text-2xl font-bold mb-4">New Order</h2>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 invisible-scrollbar">
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
              <div className="mt-8">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>QAR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>QAR {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8">
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
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
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Select Online Order Platform
                  </Label>
                  <Command className="rounded-lg border shadow-sm">
                    <CommandInput
                      placeholder="Search platforms..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No platforms found.</CommandEmpty>
                      <CommandGroup>
                        {onlinedeliveryList?.results.map((onlineOrder) => (
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
              {orderType === "delivery" && (
                <>
                  <div className="mt-4 flex flex-col gap-2">
                    <Label className="text-sm font-medium mb-2 block">
                      Select Customer
                    </Label>
                    <Command className="rounded-lg border shadow-sm">
                      <CommandInput
                        placeholder="Search Customer..."
                        value={customerSearchQuery}
                        onValueChange={setCustomerSearchQuery}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {customerSearchQuery && customers.length === 0
                            ? "No Customer found."
                            : "Type to search for a customer"}
                        </CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              onSelect={() => handleSelectCustomer(customer)}
                            >
                              {customer.customer_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Label htmlFor="customerMobileNumber">
                      Customer Number
                    </Label>
                    <Input
                      id="customerMobileNumber"
                      value={customerMobileNumber}
                      onChange={(e) => setCustomerMobileNumber(e.target.value)}
                      placeholder="Enter customer contact number"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                    <Input
                      id="deliveryCharge"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      placeholder="Enter delivery charge"
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
                                    className={`mr-2 h-4 w-4 ${
                                      selectedDriver?.id === driver.id
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
                </>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button className="w-full mt-6" onClick={handleCheckout}>
                Checkout
              </Button>
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
                price: Number(item.price),
              }))
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
