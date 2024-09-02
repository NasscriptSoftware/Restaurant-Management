import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import DishList from "../components/Dishes/DishList";
import OrderItem from "../components/Orders/OrderItem";
import { useDishes } from "../hooks/useDishes";
import { useOrderById, useUpdateOrder } from "../hooks/useOrders"; // Custom hooks for fetching and updating an order
import { Dish, OrderFormData } from "../types";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { order, isLoading: orderLoading } = useOrderById(orderId!); // Fetch the existing order
  const { dishes, isLoading: dishesLoading, isError } = useDishes();
  const { updateOrder } = useUpdateOrder(); // Hook to update the order with new items

  const [orderItems, setOrderItems] = useState(order?.items || []);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddDish = (dish: Dish) => {
    const existingItem = orderItems.find((item) => item.dish === dish.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.dish === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setOrderItems([...orderItems, { dish: dish.id, quantity: 1, name: dish.name }]);
    }
  };

  const incrementQuantity = (id: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.dish === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.dish === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setOrderItems(orderItems.filter((item) => item.dish !== id));
  };

  const handleSubmit = async () => {
    const updatedOrder: OrderFormData = {
      ...order,
      items: orderItems,
    };

    await updateOrder(orderId!, updatedOrder);

    // Redirect to the order listing page with a query param indicating to show the kitchen bill
    navigate(`/orders?showKitchenBill=true&orderId=${orderId}`);
  };

  const filteredDishes = dishes?.results.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (orderLoading || dishesLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading dishes</div>;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/3 pr-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Add Products to Order #{orderId}</h2>
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border border-gray-300 rounded px-4 py-2 mr-2"
              />
            </div>
          </div>
          <DishList dishes={filteredDishes} onAddDish={handleAddDish} />
        </div>
        <div className="lg:w-1/3 bg-white p-8">
          <h2 className="text-2xl font-bold mb-6">Current Order</h2>
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
          <button className="w-full bg-red-500 text-white py-3 rounded-lg mt-6" onClick={handleSubmit}>
            Update Order and Generate Kitchen Bill
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AddProductPage;
