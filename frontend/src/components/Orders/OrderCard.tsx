import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Order,
  CreditUser,
  DeliveryDriver,
  Chair,
  FOCProduct,
  Category,
  ChairDetail,
} from "../../types/index";
import OrderItems from "./OrderItems";
import { useReactToPrint } from "react-to-print";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import AddProductModal from "./AddProductModal";
import PrintConfirmationModal from "./PrintConfirmationModal";
import {
  api,
  fetchOnlineOrderData,
  updateOrderStatusNew,
} from "../../services/api";
import ReactSelect from "react-select";
import {
  BadgeInfo,
  Bike,
  HandPlatter,
  Mail,
  Phone,
  PlusCircle,
  ShoppingBag,
  Gift,
  Armchair,
  Banknote,
  Coffee,
  StickyNote,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { CreditUserModal } from "../modals/CreditUserModal";
import { Button } from "../ui/button"; // Assuming you have a Button component
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; // Assuming you have Popover components
import { ChevronsUpDown, Check } from "lucide-react"; // Icons from lucide-react library
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"; // Assuming you have a Command component and related subcomponents
// import { DeliveryDriver } from "@/types";
import { useQuery } from "react-query";
import { fetchDeliveryDrivers } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import AddOptionsModal from "./AddOptionsModal";
import { Textarea } from "@/components/ui/textarea";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
  creditUsers: CreditUser[];
  onCreditUserChange: () => void;
  selectedOrders: number[];
  onOrderSelection: (selectedOrderIds: number[]) => void;
  onStatusUpdated: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
  refetchOrders: () => void;
  logoInfo: {
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    location: string;
    companyNameArabic: string;
    printLogo: string;
    locationArabic: string;
    mobileNumber: string;
    landlineNumber: string;
    company_mail: string;
  } | null;
  chairs: Chair[];
}
interface Dish {
  id: number | string;
  name: string;
  description: string;
  price: string | number;
  image: string;
  category: number | Category;
  arabic_name: string;
}

interface OnlineOrderData {
  id: number;
  order_id: number;
  order_type: string;
  name: string;
  address: string;
  phone_number: number;
  delivery_charge: number;
  logo: string;
}
type OrderType = "dining" | "takeaway" | "delivery" | "onlinedelivery" | string;

type PaymentType = "cash" | "bank" | "cash-bank" | "credit" | string;

const OrderCard: React.FC<OrderCardProps> = ({
  order: initialOrder,
  dishes,
  creditUsers,
  selectedOrders,
  onOrderSelection,
  onStatusUpdated,
  onCreditUserChange,
  logoInfo,
  chairs,
  onOrderUpdated,
}) => {
  const [status, setStatus] = useState<string>(initialOrder.status);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAddProductModal, setShowAddProductModal] =
    useState<boolean>(false);
  const [showAddOptionsModal, setShowAddOptionsModal] =
    useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showPrintConfirmationModal, setShowPrintConfirmationModal] =
    useState<boolean>(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("kitchen");
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("cash");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [order, setOrder] = useState<Order>(initialOrder);

  const kitchenPrintRef = useRef<HTMLDivElement>(null);
  const salesPrintRef = useRef<HTMLDivElement>(null);
  const [selectedCreditUser, setSelectedCreditUser] =
    useState<CreditUser | null>(null);
  const [isCreditUserModalOpen, setIsCreditUserModalOpen] =
    useState<boolean>(false);

  const [showOrderTypeModal, setShowOrderTypeModal] = useState<boolean>(false);
  const [newOrderType, setNewOrderType] = useState<OrderType>(order.order_type);
  const [customerName, setCustomerName] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [customerMobileNumber, setCustomerMobileNumber] = useState<string>("");
  const [deliveryCharge, setDeliveryCharge] = useState<string>("0.00");
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(
    null
  );
  const [openDriverSelect, setOpenDriverSelect] = useState<boolean>(false);
  const [chairData, setChairData] = useState({
    chair_name: "",
    customer_name: "",
    customer_mob: "",
    start_time: "",
    end_time: "",
    amount: "",
    is_active: true,
  });

  const { data: deliveryDriversList } = useQuery<{ results: DeliveryDriver[] }>(
    "deliveryDrivers",
    fetchDeliveryDrivers
  );

  const [onlineOrderData, setOnlineOrderData] =
    useState<OnlineOrderData | null>(null);

  useEffect(() => {
    if (order.order_type === "onlinedelivery" && order.online_order) {
      fetchOnlineOrderData(Number(order.online_order))
        .then((data) => setOnlineOrderData(data))
        .catch((error) =>
          console.error("Error fetching online order data:", error)
        );
    }
  }, [order.order_type, order.online_order]);

  // Separate print handlers
  const handlePrintKitchenBill = useReactToPrint({
    content: () => kitchenPrintRef.current,
  });

  const handlePrintSalesBill = useReactToPrint({
    content: () => salesPrintRef.current,
  });

  const handleAddOptionsSubmit = (updatedOrder: Order) => {
    setOrder(updatedOrder);
    onOrderUpdated(updatedOrder);
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
      setStatus(newStatus);

      try {
        await updateOrderStatusNew(Number(order.id), "approved");
        onStatusUpdated();
      } catch (error) {
        console.error("Error updating status to approved:", error);
        Swal.fire("Error", "Failed to update status to approved.", "error");
      }
    } else if (newStatus === "delivered") {
      setShowPaymentModal(true);
    } else if (newStatus === "cancelled") {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel the order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await updateOrderStatusNew(Number(order.id), "cancelled");
            setStatus("cancelled");
            Swal.fire("Cancelled!", "The order has been cancelled.", "success");
            onStatusUpdated();
          } catch (error) {
            console.error("Error cancelling order:", error);
            Swal.fire(
              "Error",
              "There was an error cancelling the order.",
              "error"
            );
          }
        } else {
          setStatus(order.status);
        }
      });
    } else {
      try {
        await updateOrderStatusNew(
          Number(order.id),
          newStatus as "pending" | "approved" | "cancelled" | "delivered"
        );
        onStatusUpdated();
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus(order.status);
      }
    }
  };
  const handleOrderSelection = () => {
    onOrderSelection(
      selectedOrders.includes(Number(order.id))
        ? selectedOrders.filter((id) => id !== Number(order.id))
        : [...selectedOrders, Number(order.id)]
    );
  };

  const disableAllActions = () => {
    setShowModal(false);
    setShowAddProductModal(false);
    setShowPaymentModal(false);
  };

  const handleItemDeleted = async () => {
    try {
      // Get the latest order data
      const response = await api.get(`/orders/${order.id}/`);
      const updatedOrder = response.data;
      
      // Update local state with the fresh data
      setOrder(updatedOrder);
      
      // Notify parent component about the update
      onOrderUpdated(updatedOrder);
      
      // Force a refetch of the orders list
      // refetchOrders();
    } catch (error) {
      console.error("Error updating order after item deletion:", error);
    }
  };

  const handleAddProductSubmit = async (
    products: {
      dish_name: string;
      price: number;
      size_name: string | null;
      quantity: number;
      is_newly_added: boolean;
    }[]
  ) => {
    try {
      // Calculate new total amount with proper decimal handling
      const currentTotal = parseFloat(order.total_amount?.toString() || '0');
      const productsTotal = products.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      // Round to 2 decimal places
      const newTotalAmount = Number((currentTotal + productsTotal).toFixed(2));

      const response = await api.put(`/orders/${order.id}/`, {
        items: products,
        total_amount: newTotalAmount
      });

      if (response.status === 200) {
        setOrder(response.data);
        onOrderUpdated(response.data);
        setShowAddProductModal(false);
      }
    } catch (error) {
      console.error("Error adding products:", error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to add products to the order',
        icon: 'error',
      });
    }
  };

  const handleGenerate = () => {
    if (billType === "kitchen") {
      handlePrintKitchenBill();
    } else {
      handlePrintSalesBill();
    }
    setShowModal(false);
    onStatusUpdated();
  };

  const handlePaymentMethodChange = (method: PaymentType) => {
    setPaymentMethod(method);
    const totalAmount = parseFloat(order.total_amount.toString());

    if (method === "cash-bank") {
      setCashAmount(totalAmount / 2);
      setBankAmount(totalAmount / 2);
    } else {
      setCashAmount(totalAmount);
      setBankAmount(0);
    }
  };

  const handleCashAmountChange = (amount: number) => {
    const totalAmount = parseFloat(order.total_amount.toString());

    if (amount < 0) {
      amount = 0;
    }
    if (amount > totalAmount) {
      amount = totalAmount;
    }
    setCashAmount(amount);
    setBankAmount(totalAmount - amount);
  };

  const handlePaymentSubmit = async () => {
    try {
      let additionalData: any = {};

      if (paymentMethod === "cash") {
        additionalData = {
          payment_method: "cash",
          cash_amount: order.total_amount,
          bank_amount: 0,
        };
      } else if (paymentMethod === "bank") {
        additionalData = {
          payment_method: "bank",
          cash_amount: 0,
          bank_amount: order.total_amount,
        };
      } else if (paymentMethod === "cash-bank") {
        additionalData = {
          payment_method: "cash-bank",
          cash_amount: cashAmount,
          bank_amount: bankAmount,
        };
      } else if (paymentMethod === "credit") {
        additionalData = {
          payment_method: "credit",
          cash_amount: 0,
          bank_amount: 0,
          credit_amount: order.total_amount,
          credit_user_id: selectedCreditUser
            ? selectedCreditUser.id
            : undefined,
        };
      }

      const response = await updateOrderStatusNew(
        Number(order.id),
        "delivered",
        additionalData
      );

      if (response && response.detail) {
        const UpdatedOrder = await api.get(`/orders/${initialOrder.id}`);
        setOrder(UpdatedOrder.data);

        const billsResponse = await api.post("/bills/", {
          order_id: Number(order.id),
          total_amount: order.total_amount,
          paid: true,
        });

        if (billsResponse && billsResponse.status === 201) {
          // Clear the chair after billing
          if (order.chair_details && order.chair_details.length > 0) {
            const chairId = order.chair_details[0].chair_id;
            await api.patch(`/chairs/${chairId}/`, {
              is_active: true,
              order: null,
              customer_name: null,
              customer_mob: null,
              start_time: null,
              end_time: null,
              amount: null,
              total_time: null,
            });
          }

          setShowPaymentModal(false);
          setStatus("delivered");
          disableAllActions();

          setShowPrintConfirmationModal(true);

          onStatusUpdated();
        } else {
          throw new Error("Failed to create the bill");
        }
      } else {
        throw new Error("Failed to update the order status");
      }
      setShowPaymentModal(false);
      setStatus("delivered");
      disableAllActions();

      setShowPrintConfirmationModal(true);

      onStatusUpdated();
    } catch (error) {
      console.error("Failed to update payment method and status:", error);
      Swal.fire(
        "Error",
        "Failed to process the payment and update status.",
        "error"
      );
    }
  };

  const handlePrintConfirmation = () => {
    setBillType("sales");
    setShowModal(true);
    setShowPrintConfirmationModal(false);
  };

  const handleCreditUserCreated = (newCreditUser: CreditUser | undefined) => {
    if (newCreditUser) {
      setSelectedCreditUser(newCreditUser);
    }
    onCreditUserChange();
  };

  const handleOrderTypeChange = async () => {
    if (order.status === "delivered") {
      Swal.fire(
        "Error",
        "You cannot change the order type after it is delivered.",
        "error"
      );
      return;
    }

    const deliveryData =
      newOrderType === "delivery"
        ? {
            customer_name: customerName,
            address: deliveryAddress,
            customer_phone_number: customerMobileNumber,
            delivery_charge: parseFloat(deliveryCharge),
            ...(selectedDriver && { delivery_driver_id: selectedDriver.id }),
            delivery_order_status: "pending",
          }
        : {};

    try {
      const response = await api.put(`/order-type/${order.id}/change-type/`, {
        order_type: newOrderType,
        ...deliveryData,
      });

      if (response.status === 200) {
        const updatedOrderData = response.data;

        // Update local state
        setOrder(updatedOrderData);

        // Call the parent's update function
        onOrderUpdated(updatedOrderData);

        // Close modal and show success message
        setShowOrderTypeModal(false);

        // Trigger a refetch of orders to ensure everything is in sync
        onStatusUpdated(); // If you have this prop
        window.location.reload();
        Swal.fire({
          title: "Success",
          text: "Order type updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          // Optional: Additional actions after the success message
        });
      } else {
        throw new Error("Failed to update order type");
      }
    } catch (error) {
      console.error("Failed to update order type:", error);
      Swal.fire("Error", "Failed to update order type.", "error");
    }
  };

  const [isChairModalOpen, setIsChairModalOpen] = useState(false);

  const handleChairInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChairData({ ...chairData, [name]: value });

    // Automatically close the modal for start_time and end_time inputs
    if (name === "start_time" || name === "end_time") {
      const inputElement = e.target as HTMLInputElement;
      inputElement.blur(); // Remove focus from the input to close the modal
    }
  };

  const handleChairSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const chairId = chairs.find(
        (chair) => chair.chair_name === chairData.chair_name
      )?.id;

      if (!chairId) {
        console.error("Chair not found");
        return;
      }

      // Calculate total time
      const startTime = new Date(chairData.start_time);
      const endTime = new Date(chairData.end_time);

      // Calculate the difference in milliseconds
      const timeDiff = endTime.getTime() - startTime.getTime();

      // Convert to hours and minutes
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      // Format the time difference
      const totalTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      // Calculate chair amount (assuming the amount is per hour)
      const totalHours = hours + minutes / 60;
      const chairAmount = totalHours * parseFloat(chairData.amount);

      // Create chair details object
      const chairDetails: ChairDetail = {
        id: order.id, // Generate a temporary id
        chair_id: chairId,
        chair_name: chairData.chair_name,
        customer_name: chairData.customer_name,
        customer_mob: chairData.customer_mob,
        start_time: chairData.start_time,
        end_time: chairData.end_time,
        amount: chairAmount.toFixed(2),
        total_time: totalTime,
        order: Number(order.id),
      };

      // Update chair data
      const updatedChairData = {
        ...chairData,
        order: order.id,
        is_active: false,
        amount: chairAmount.toFixed(2),
        total_time: totalTime,
      };

      await api.patch(`/chairs/${chairId}/`, updatedChairData);

      // Update order with new chair details and amount
      const updatedOrder: Order = {
        ...order,
        chair_amount: (
          parseFloat(order.chair_amount || "0") + chairAmount
        ).toFixed(2),
        total_amount: (
          parseFloat(order.total_amount.toString()) + chairAmount
        ).toFixed(2),
        chair_details: [...(order.chair_details || []), chairDetails],
      };

      // Update the order in the backend with chair details
      await api.patch(`/orders/${order.id}/`, {
        chair_amount: updatedOrder.chair_amount,
        total_amount: updatedOrder.total_amount,
        chair_details: updatedOrder.chair_details,
      });

      setOrder(updatedOrder);
      onStatusUpdated();
      setIsChairModalOpen(false);
    } catch (error) {
      console.error("Failed to update chair and order:", error);
    }
  };

  // Add state for the delivery info modal
  const [showDeliveryInfoModal, setShowDeliveryInfoModal] = useState(false);

  const [showChairDetails, setShowChairDetails] = useState<boolean>(false);

  const [showKitchenNoteModal, setShowKitchenNoteModal] = useState(false);
  const [kitchenNoteInput, setKitchenNoteInput] = useState("");

  return (
    <div
      key={order.id}
      className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200"
    >
      <div className="flex flex-col space-y-4 md:space-y-0 mb-4">
        {/* Top Section - Order ID and Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Order ID and Checkbox */}
          <div className="flex items-center mb-4 md:mb-0">
            <input
              type="checkbox"
              checked={selectedOrders.includes(Number(order.id))}
              onChange={handleOrderSelection}
              className="mr-4 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800">
                Order #{order.id}
              </h2>
              {order.kitchen_note && (
                <div className="mt-2">
                  <div className="flex items-center mb-2">
                    <StickyNote className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm font-semibold text-amber-700">Kitchen Notes:</span>
                  </div>
                  <ul className="list-disc list-inside pl-6 space-y-1">
                    {order.kitchen_note.split(',').map((note, index) => (
                      <li key={index} className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full inline-block mr-2 mb-2">
                        {note.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!order.kitchen_note && (
                <button
                  onClick={() => setShowKitchenNoteModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <StickyNote size={16} />
                  <span className="text-sm font-medium">Add Kitchen Note</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:items-center">
            {/* FOC Button */}
            <button
              onClick={() => setShowAddOptionsModal(true)}
              disabled={status === "delivered"}
              className={`flex items-center justify-center px-3 py-2 rounded-lg border ${
                status === "delivered"
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : "border-red-200 hover:bg-red-50"
              }`}
              title="Add Options"
            >
              <Coffee
                size={20}
                className={`${
                  status !== "delivered" ? "animate-pulse" : ""
                } text-red-500 mr-2`}
              />
              <span className="text-red-500 text-sm">FOC</span>
            </button>

            {/* Print Kitchen Bill Button */}
            {status === "approved" && (
              <button
                onClick={handlePrintKitchenBill}
                className="flex items-center justify-center px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50"
                title="Print Kitchen Bill"
              >
                <svg
                  className="w-5 h-5  text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 9V2h12v7M6 18h12v5H6v-5zm2-3h8v3H8v-3zM6 11h12v4H6v-4z"
                  ></path>
                </svg>
              </button>
            )}

            {/* Print Sales Bill Button */}
            {status === "delivered" && (
              <button
                onClick={handlePrintSalesBill}
                className="flex items-center justify-center px-3 py-2 rounded-lg border border-green-200 hover:bg-green-50"
                title="Print Sales Bill"
              >
                <svg
                  className="w-5 h-5  text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 9V2h12v7M6 18h12v5H6v-5zm2-3h8v3H8v-3zM6 11h12v4H6v-4z"
                  ></path>
                </svg>
              </button>
            )}

            {/* Status Select */}
            <select
              value={status}
              onChange={handleStatusChange}
              className="px-3 py-2 text-sm border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              disabled={status === "delivered" || status === "cancelled"}
            >
              <option value="pending" disabled={status === "approved"}>
                Pending
              </option>
              <option value="approved">Kitchen Bill</option>
              <option value="cancelled">Cancelled</option>
              <option value="delivered">Order Success</option>
            </select>

            {/* Add Product Button */}
            <button
              onClick={() => setShowAddProductModal(true)}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition 
                ${
                  status === "delivered" || status === "cancelled"
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#6f42c1] text-white hover:bg-[#6f42c1]/90"
                }`}
              disabled={status === "delivered" || status === "cancelled"}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span className="text-sm">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="space-y-3">
        {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
          order.items.map((item) => (
            <OrderItems
              key={item.id}
              orderItem={item}
              dishes={dishes}
              isNewlyAdded={item.is_newly_added}
              orderId={Number(order.id)}
              onItemDeleted={handleItemDeleted}
              order_status={order.status}
            />
          ))
        ) : (
          <p>No items found for this order.</p>
        )}

        <div className="mt-6">
          {order.foc_product_details &&
            order.foc_product_details.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg border border-blue-200 transition-all duration-300 hover:shadow-xl">
                <h4 className="text-2xl font-bold text-blue-800 flex items-center mb-4">
                  <Gift size={28} className="mr-3 text-blue-500" />
                  <span>Complimentary Items</span>
                </h4>
                <div className="space-y-3">
                  {order.foc_product_details.map(
                    (product: FOCProduct, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:bg-blue-100 transition-all duration-200"
                      >
                        <span className="text-blue-700 font-medium">
                          {product.name}
                        </span>
                        <span className="bg-blue-200 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
                          x{product.quantity}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-5 text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    These special items are complimentary. Enjoy!
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
          {order?.order_type === "delivery" && (
            <>
              <Button
                variant="outline"
                className={`w-full md:w-auto font-semibold text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 ${
                  order.status === "delivered" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setShowDeliveryInfoModal(true)}
              >
                <BadgeInfo
                  size={18}
                  className={`${
                    order.status === "delivered"
                      ? "opacity-50 cursor-not-allowed"
                      : "animate-bounce"
                  }`}
                />
                <span>Delivery Info</span>
              </Button>

              <Dialog open={showDeliveryInfoModal} onOpenChange={setShowDeliveryInfoModal}>
                <DialogContent className="w-80 p-6 bg-white rounded-lg">
                  <DialogHeader>
                    <DialogTitle>Delivery Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Delivery Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Status:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order?.delivery_order_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order?.delivery_order_status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order?.delivery_order_status === "accepted" ||
                              order?.delivery_order_status === "in_progress"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order?.delivery_order_status?.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Delivery Driver Details */}
                    <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                      <h4 className="font-semibold text-gray-700">
                        Driver Details
                      </h4>
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center text-sm">
                        <Bike size={16} className="text-gray-400" />
                        <span>{order?.delivery_driver?.username || "N/A"}</span>
                        <Phone size={16} className="text-gray-400" />
                        <span>
                          {order?.delivery_driver?.mobile_number || "N/A"}
                        </span>
                        <Mail size={16} className="text-gray-400" />
                        <span>{order?.delivery_driver?.email || "N/A"}</span>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                      <h4 className="font-semibold text-gray-700">
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span>{order?.customer_phone_number || "N/A"}</span>
                        <Mail size={16} className="text-gray-400" />
                        <span>{order?.address || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {order?.order_type === "dining" && (
            <Button
              variant="outline"
              className={`w-full md:w-auto font-semibold text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 ${
                order.status === "delivered"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => setShowOrderTypeModal(true)}
            >
              <HandPlatter
                size={18}
                className={`${
                  order.status === "delivered"
                    ? "opacity-50 cursor-not-allowed"
                    : "animate-bounce"
                }`}
              />
              {order?.order_type?.charAt(0).toUpperCase() +
                order?.order_type?.slice(1)}
            </Button>
          )}

          {order?.order_type === "takeaway" && (
            <Button
              variant="outline"
              className={`w-full md:w-auto font-semibold text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 ${
                order.status === "delivered"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => setShowOrderTypeModal(true)}
            >
              <ShoppingBag
                size={18}
                className={`${
                  order.status === "delivered"
                    ? "opacity-50 cursor-not-allowed"
                    : "animate-bounce"
                }`}
              />
              <span className="tracking-wide">
                {order?.order_type?.charAt(0).toUpperCase() +
                  order?.order_type?.slice(1)}
              </span>
            </Button>
          )}
          {order?.order_type === "onlinedelivery" && onlineOrderData && (
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full font-semibold text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <Bike size={18} className="animate-bounce" />
                <span className="tracking-wide">{onlineOrderData.name}</span>
                {onlineOrderData.logo && (
                  <div className="w-10 h-10 relative overflow-hidden rounded-full">
                    <img
                      src={onlineOrderData.logo}
                      alt={`${onlineOrderData.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </Button>
            </div>
          )}
          {order?.order_type === "dining" && (
            <Button
              variant="outline"
              className={`w-full md:w-auto font-semibold text-sm px-5 py-2.5 rounded-full
                bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800
                hover:from-purple-300 hover:to-purple-400 transition-all duration-300 shadow-md hover:shadow-lg
                flex items-center justify-center gap-3 transform hover:scale-105
                ${
                  (order.chair_details && order.chair_details.length > 0) ||
                  order.status === "delivered"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              onClick={() => setIsChairModalOpen(true)}
              disabled={
                (order.chair_details && order.chair_details.length > 0) ||
                order.status === "delivered"
              }
            >
              <Armchair
                size={18}
                className={`${
                  (order.chair_details && order.chair_details.length > 0) ||
                  order.status === "delivered"
                    ? "opacity-50 cursor-not-allowed"
                    : "animate-bounce"
                }`}
              />
              <span className="tracking-wide">Select Chair</span>
            </Button>
          )}
        </div>

        <div className="w-full md:w-auto bg-gray-50 rounded-lg p-4 shadow-inner">
          <div className="flex flex-col space-y-2">
            {order.order_type === "dining" &&
            order.chair_amount &&
            parseFloat(order.chair_amount) > 0 ? (
              <div className="flex items-center justify-between md:justify-start md:space-x-2">
                <Banknote
                  size={20}
                  className="text-purple-600 animate-pulse"
                />
                <span className="text-sm md:text-base font-medium text-gray-700">
                  Chair Amount:
                </span>
                <span className="text-sm md:text-lg font-semibold text-purple-600">
                  QAR {parseFloat(order.chair_amount).toFixed(2)}
                </span>
              </div>
            ) : null}
            {order.order_type === "delivery" &&
            order.delivery_charge &&
            parseFloat(order.delivery_charge.toString()) > 0 ? (
              <div className="flex items-center space-x-2">
                <Bike size={20} className="text-green-500 animate-pulse" />
                <span className="text-sm md:text-base font-medium text-gray-700">
                  Delivery Charge:
                </span>
                <span className="text-sm md:text-xl font-bold text-green-600">
                  QAR {order.delivery_charge.toString()}
                </span>
              </div>
            ) : null}

            <div className="flex items-center space-x-2">
              <Banknote size={20} className="text-green-500 animate-pulse" />
              <span className="text-sm md:text-base font-medium text-gray-700">
                Total Amount:
              </span>
              <span className="text-sm md:text-xl font-bold text-green-600">
                QAR {parseFloat((order?.total_amount || 0).toString()).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {billType === "kitchen" ? "Kitchen Bill" : "Sales Bill"}
            </h3>
            {status === "delivered" && (
              <select
                value={billType}
                onChange={(e) =>
                  setBillType(e.target.value as "kitchen" | "sales")
                }
                className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Sales Bill</option>
                <option value="kitchen">Kitchen Bill</option>
              </select>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                disabled={!billType}
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleAddProductSubmit}
        />
      )}
      {showAddOptionsModal && (
        <AddOptionsModal
          orderId={Number(order.id)}
          onClose={() => setShowAddOptionsModal(false)}
          onSubmit={handleAddOptionsSubmit}
        />
      )}

      {/* Add the Print Confirmation Modal */}
      <PrintConfirmationModal
        isOpen={showPrintConfirmationModal}
        onClose={() => setShowPrintConfirmationModal(false)}
        onPrint={handlePrintConfirmation}
      />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Choose Payment Method
            </h3>
            <select
              value={paymentMethod}
              onChange={(e) =>
                handlePaymentMethodChange(e.target.value as PaymentType)
              }
              className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash-bank">Cash with Bank</option>
              <option value="credit">Credit</option>
            </select>

            {paymentMethod === "cash-bank" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) =>
                      handleCashAmountChange(Number(e.target.value))
                    }
                    className="border rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Bank Amount
                  </label>
                  <input
                    type="number"
                    value={bankAmount}
                    readOnly
                    className="border rounded-md p-2 w-full text-gray-700 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "credit" && (
              <div className="mt-4">
                <div className="flex justify-between">
                  {" "}
                  <label className="block text-gray-700 mb-1">
                    Select Credit User
                  </label>
                  <PlusCircle
                    size={24}
                    className="cursor-pointer"
                    onClick={() => setIsCreditUserModalOpen(true)}
                  />
                </div>
                <ReactSelect
                  options={creditUsers.map((user) => ({
                    value: user.id,
                    label: user.username,
                  }))}
                  value={
                    selectedCreditUser
                      ? {
                          value: selectedCreditUser.id,
                          label: selectedCreditUser.username,
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedCreditUser(
                      creditUsers.find(
                        (user) => user.id === selectedOption?.value
                      ) || null
                    )
                  }
                  placeholder="Search for a credit user..."
                  isSearchable
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* credit modal for selecting credit users */}
      <CreditUserModal
        isOpen={isCreditUserModalOpen}
        onClose={() => setIsCreditUserModalOpen(false)}
        creditUserId={null}
        onCreditUserChange={handleCreditUserCreated}
      />

      {order.status !== "delivered" && (
        <>
          {showOrderTypeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all duration-300 ease-out">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  Change Order Type
                </h3>

                <div className="space-y-4">
                  {/* Radio buttons to select order type */}
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value="dining"
                      checked={newOrderType === "dining"}
                      onChange={(e) =>
                        setNewOrderType(e.target.value as OrderType)
                      }
                      className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full transition duration-200 ease-in-out"
                    />
                    <span className="text-base text-gray-700">Dining</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value="takeaway"
                      checked={newOrderType === "takeaway"}
                      onChange={(e) =>
                        setNewOrderType(e.target.value as OrderType)
                      }
                      className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full transition duration-200 ease-in-out"
                    />
                    <span className="text-base text-gray-700">Takeaway</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={newOrderType === "delivery"}
                      onChange={(e) =>
                        setNewOrderType(e.target.value as OrderType)
                      }
                      className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full"
                    />
                    <span className="text-base text-gray-700">Delivery</span>
                  </label>

                  {/* If the selected order type is delivery, show additional fields */}
                  {newOrderType === "delivery" && (
                    <div className="mt-6 space-y-4">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="customerName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Customer Name
                        </label>
                        <input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="deliveryAddress"
                          className="text-sm font-medium text-gray-700"
                        >
                          Delivery Address
                        </label>
                        <input
                          id="deliveryAddress"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter delivery address"
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="customerMobileNumber"
                          className="text-sm font-medium text-gray-700"
                        >
                          Customer Number
                        </label>
                        <input
                          id="customerMobileNumber"
                          value={customerMobileNumber}
                          onChange={(e) =>
                            setCustomerMobileNumber(e.target.value)
                          }
                          placeholder="Enter customer contact number"
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="deliveryCharge"
                          className="text-sm font-medium text-gray-700"
                        >
                          Delivery Charge
                        </label>
                        <input
                          id="deliveryCharge"
                          value={deliveryCharge}
                          onChange={(e) => setDeliveryCharge(e.target.value)}
                          placeholder="Enter delivery charge"
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Select Delivery Driver
                        </label>
                        <Popover
                          open={openDriverSelect}
                          onOpenChange={setOpenDriverSelect}
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="p-2 border border-gray-300 rounded-md bg-white w-full text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                            >
                              {selectedDriver
                                ? selectedDriver.username
                                : "Select driver..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full m-10">
                            <Command>
                              <CommandInput placeholder="Search drivers..." />
                              <CommandList>
                                <CommandEmpty>No driver found.</CommandEmpty>
                                <CommandGroup>
                                  {deliveryDriversList?.results?.map(
                                    (driver) => (
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
                                    )
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowOrderTypeModal(false)}
                      className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleOrderTypeChange}
                      className="px-5 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 ease-in-out"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* modal for changing the order type */}

      <div className="hidden">
        <div ref={kitchenPrintRef}>
          <KitchenPrint 
            order={order} 
            dishes={dishes} 
          />
        </div>
        <div ref={salesPrintRef}>
          <SalesPrint 
            order={order} 
            dishes={dishes} 
            logoInfo={logoInfo} 
          />
        </div>
      </div>

      {/* Add this near the end of the component, before the closing div */}
      <Dialog open={isChairModalOpen} onOpenChange={setIsChairModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Chair</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChairSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="chair_name"
                className="block text-sm font-medium text-gray-700"
              >
                Chair Name
              </label>
              <select
                id="chair_name"
                name="chair_name"
                value={chairData.chair_name}
                onChange={handleChairInputChange}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a chair</option>

                {chairs && chairs.length > 0 ? (
                  chairs
                    .filter((chair) => chair.is_active)
                    .map((chair) => (
                      <option key={chair.id} value={chair.chair_name}>
                        {chair.chair_name}
                      </option>
                    ))
                ) : (
                  <option value="none" disabled>
                    No active chairs available
                  </option>
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Name
              </label>
              <Input
                id="customer_name"
                name="customer_name"
                value={chairData.customer_name}
                onChange={handleChairInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="customer_mob"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Mobile
              </label>
              <Input
                id="customer_mob"
                name="customer_mob"
                value={chairData.customer_mob}
                onChange={handleChairInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="start_time"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <Input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={chairData.start_time}
                onChange={handleChairInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="end_time"
                className="block text-sm font-medium text-gray-700"
              >
                End Time
              </label>
              <Input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={chairData.end_time}
                onChange={handleChairInputChange}
              />
            </div>
            <div></div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={chairData.amount}
                onChange={handleChairInputChange}
              />
            </div>
            <Button type="submit">Save Chair Booking</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add this section at the bottom of the card, before the closing div */}
      {order.chair_details && order.chair_details.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center mb-3">
            <Armchair className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-purple-800">Chair Details</h3>
            <button
              onClick={() => setShowChairDetails(!showChairDetails)}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors ml-2"
              title={showChairDetails ? "Hide Details" : "Show Details"}
            >
              {showChairDetails ? (
                <EyeOff className="h-5 w-5 text-purple-600" />
              ) : (
                <Eye className="h-5 w-5 text-purple-600" />
              )}
            </button>
          </div>
          
          {showChairDetails && (
            <div className="animate-in slide-in-from-top duration-300">
              {order.chair_details.map((chair) => (
                <div 
                  key={chair.id}
                  className="bg-purple-50 rounded-lg p-4 space-y-2"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Chair Name</p>
                      <p className="font-semibold">{chair.chair_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Customer</p>
                      <p className="font-semibold">{chair.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Mobile</p>
                      <p className="font-semibold">{chair.customer_mob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Start Time</p>
                      <p className="font-semibold">
                        {new Date(chair.start_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">End Time</p>
                      <p className="font-semibold">
                        {new Date(chair.end_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Duration</p>
                      <p className="font-semibold">{chair.total_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Amount</p>
                      <p className="font-semibold text-green-600">
                        QAR {typeof chair.amount === 'string' ? parseFloat(chair.amount).toFixed(2) : chair.amount.toFixed(2)}
                      </p>
                    </div>
                    {chair.booking_id && (
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Booking ID</p>
                        <p className="font-semibold">#{chair.booking_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showKitchenNoteModal} onOpenChange={setShowKitchenNoteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Kitchen Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Textarea
                id="kitchen-note"
                placeholder="Enter kitchen notes (separate multiple notes with commas)"
                value={kitchenNoteInput}
                onChange={(e) => setKitchenNoteInput(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowKitchenNoteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await api.patch(`/orders/${order.id}/`, {
                      kitchen_note: kitchenNoteInput
                    });
                    
                    if (response.status === 200) {
                      setOrder({
                        ...order,
                        kitchen_note: kitchenNoteInput
                      });
                      
                      onOrderUpdated(response.data);
                      
                      setShowKitchenNoteModal(false);
                      setKitchenNoteInput("");
                      
                    }
                  } catch (error) {
                    console.error('Failed to update kitchen note:', error);

                  }
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderCard;
