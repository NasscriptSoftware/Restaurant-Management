import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import DishList from "../components/Dishes/DishList";
import OrderItem from "../components/Orders/OrderItem";
import { useDishes } from "../hooks/useDishes";
import { useOrders } from "../hooks/useOrders";
import { Dish, Category, OrderFormData } from "../types";
import { fetchUnreadCount, getCategories } from "../services/api";
import { useQuery } from "react-query";
import { CircleCheckBig } from "lucide-react";
import { useNavigate } from "react-router-dom";
type OrderType = "dining" | "takeaway" | "delivery";
type PaymentMethod = "cash" | "bank";

const DishesPage: React.FC = () => {
  const navigate = useNavigate();
  const { dishes, isLoading, isError, addDishToOrder, page, setPage } =
    useDishes();
  const { createOrder } = useOrders();
  const { data: categories } = useQuery("categories", getCategories);

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isOrderVisible, setIsOrderVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("dining");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash"); // Added state for payment method
  const [searchQuery, setSearchQuery] = useState("");

  const data = dishes?.results ? dishes.results : [];

  const handleAddDish = (dish: Dish) => {
    addDishToOrder(dish.id, 1);
    const existingItem = orderItems.find((item) => item.id === dish.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setOrderItems([...orderItems, { ...dish, quantity: 1 }]);
    }
    setIsOrderVisible(true);
  };

  const incrementQuantity = (id: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    const orderData: OrderFormData = {
      items: orderItems.map((item) => ({
        dish: item.id,
        quantity: item.quantity,
      })),
      total_amount: total.toFixed(2),
      status: "pending",
      order_type: orderType,
      payment_method: paymentMethod,
    };

    createOrder(orderData);
    setShowSuccessModal(true);
    setOrderItems([]);
    setIsOrderVisible(false);
  };

  const handleCloseBtnClick = () => {
    fetchUnreadCount();
    setShowSuccessModal(false);
    navigate("/orders");
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const filteredDishes = data.filter((dish) => {
    const categoryMatch =
      selectedCategory === null ||
      (typeof dish.category === "number"
        ? dish.category === selectedCategory
        : dish.category.id === selectedCategory);
    const searchMatch = dish.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading dishes</div>;

  const subtotal = orderItems
    .filter((item) => typeof item.dish !== "number")
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const gst = subtotal * 0.1;
  // const total = subtotal + gst;
  const total = subtotal;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row">
        <div className={`w-full pr-4`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Choose Categories</h2>
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border border-gray-300 rounded px-4 py-2 mr-2"
              />
              <button
                onClick={() => {}}
                className="bg-red-500 text-white rounded px-4 py-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m1.1-5.9a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-lg shadow-md ${
                selectedCategory === null
                  ? "bg-red-100 text-red-500"
                  : "bg-white"
              }`}
            >
              All items
            </button>
            {categories?.map((category: Category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-lg shadow-md ${
                  selectedCategory === category.id
                    ? "bg-red-100 text-red-500"
                    : "bg-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <DishList dishes={filteredDishes} onAddDish={handleAddDish} />
          <div className="flex justify-center mt-16">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-red-500 text-white rounded-l-lg disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-200">{page}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!dishes?.next}
              className="px-4 py-2 bg-red-500 text-white rounded-r-lg disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        {orderItems.length > 0 && (
          <div
            className={` bg-white p-8 ${
              isOrderVisible ? "block lg:w-[500px]" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-0">
              <h2 className="text-2xl font-bold mb-6">New Order</h2>
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <OrderItem
                    key={index}
                    orderItem={item}
                    incrementQuantity={incrementQuantity}
                    decrementQuantity={decrementQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>
              <div className="mt-8">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>QAR {subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between mb-2">
                  <span>GST (10%)</span>
                  <span>QR{gst.toFixed(2)}</span>
                </div> */}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>QAR {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8">
                <label htmlFor="orderType" className="block mb-2">
                  Order Type
                </label>
                <select
                  id="orderType"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as OrderType)} // Cast the value to OrderType
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="dining">Dining</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div className="mt-8">
                <label htmlFor="paymentMethod" className="block mb-2">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  } // Cast the value to PaymentMethod
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="cash">Cash</option>
                  {/* <option value="upi">UPI</option> */}
                  <option value="card">Bank</option>
                </select>
              </div>
              <button
                className="w-full bg-red-500 text-white py-3 rounded-lg mt-6"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="flex justify-center items-center">
              <CircleCheckBig size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Success</h2>
            <p>Your order has been placed successfully!</p>
            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg"
              onClick={handleCloseBtnClick}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DishesPage;
