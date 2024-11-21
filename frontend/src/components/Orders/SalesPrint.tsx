import React from "react";
import { Order, Dish } from "../../types/index";
import { QRCodeSVG } from "qrcode.react";
import { fetchDishSizes } from "../../services/api";
import { Phone, MapPin, Mail } from "lucide-react";
import { GiRotaryPhone } from "react-icons/gi";

interface SalesPrintProps {
  order: Order;
  dishes: Dish[];
  logoInfo: {
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    mobileNumber: string;
    landlineNumber: string;
    location: string;
    companyNameArabic: string;
    printLogo: string;
    locationArabic: string;
    company_mail: string;
  } | null;
}

const SalesPrint: React.FC<SalesPrintProps> = ({ order, dishes, logoInfo }) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return date.toLocaleTimeString(undefined, options);
  };

  const totalQuantity = Array.isArray(order?.items)
    ? order.items.reduce(
        (total, item) =>
          total +
          (typeof item.quantity === "number"
            ? item.quantity
            : parseFloat(item.quantity)),
        0
      )
    : 0;

  const [dishSizes, setDishSizes] = React.useState<{
    [key: number]: { size: string; price: string };
  }>({});

  React.useEffect(() => {
    const fetchSizes = async () => {
      if (!order?.items) return;

      const sizePromises = order.items.map(async (item) => {
        if (item.dish_size) {
          const sizeData = await fetchDishSizes(Number(item.dish_size));
          return { [item.dish_size]: sizeData };
        }
        return null;
      });

      const sizes = await Promise.all(sizePromises);
      const sizeObject = Object.assign({}, ...sizes.filter(Boolean));
      setDishSizes(sizeObject);
    };

    fetchSizes();
  }, [order?.items]);

  return (
    <div className="print-container w-full max-w-sm mx-auto p-4 text-xs font-sans text-black border border-dotted border-black">
      {/* Header Section */}
      <div className="mb-4 pb-3 border-b-2 border-black">
        <div className="flex flex-col items-center">
          {logoInfo?.printLogo && (
            <img
              src={logoInfo.printLogo}
              alt="Logo"
              className="h-12 w-auto mb-4 object-contain"
            />
          )}
          <div className="text-center w-full">
            <h1 className="text-lg font-bold uppercase mb-3">
              {logoInfo?.companyName} {logoInfo?.companyNameArabic && (" / " + logoInfo?.companyNameArabic)}
            </h1>
            <div className="grid grid-cols-1 gap-2 mb-3">
              {logoInfo?.landlineNumber && (
                <div className="flex items-center justify-center space-x-2">
                  <GiRotaryPhone size={16} className="text-gray-700" />
                  <span className="font-medium">{logoInfo?.landlineNumber}</span>
                </div>
              )}
              <div className="flex justify-center space-x-4">
                {logoInfo?.mobileNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-700" />
                    <span className="font-medium">{logoInfo?.mobileNumber}</span>
                  </div>
                )}
                {logoInfo?.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-700" />
                    <span className="font-medium">{logoInfo?.phoneNumber}</span>
                  </div>
                )}
              </div>
              {logoInfo?.company_mail && (
                <div className="flex items-center justify-center space-x-2">
                  <Mail size={16} className="text-gray-700" />
                  <span className="font-medium">{logoInfo?.company_mail}</span>
                </div>
              )}
            </div>
            {logoInfo?.location && (
              <div className="flex items-start justify-between mt-3 px-2 pt-2 border-t border-gray-300">
                <MapPin size={16} className="text-gray-700 mt-1" />
                <div className="flex-1 flex justify-between px-2">
                  <span className="text-right text-sm">
                    {logoInfo?.location?.split(" ").map((part, index) => (
                      <React.Fragment key={index}>
                        {part.trim()}<br />
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="text-left text-sm mr-2">
                    {logoInfo?.locationArabic?.split(",").map((part, index) => (
                      <React.Fragment key={index}>
                        {part.trim()}<br />
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Info Section */}
      <div className="mb-4 pb-2 border-b border-black">
        <h2 className=" font-medium capitalize">
          Order Type:{" "}
          <span className="font-bold capitalize">{order.order_type}</span>
        </h2>
        <p className="text-center font-bold text-lg">ORDER #{order.id}</p>
        <div className="flex justify-between">
          <span>Date: {formatDate(order.created_at)}</span>
          <span>Time: {formatTime(order.created_at)}</span>
        </div>
        {order.payment_method === "credit" && (
          <p className="text-center font-bold mt-2 underline">*** CREDIT ***</p>
        )}
      </div>

      {/* Items Section */}
      <div className="mb-4">
        <div className="font-bold border-y border-black py-1">
          <div className="flex justify-between">
            <span className="w-1/2">Item</span>
            <span className="w-1/4 text-center">Qty</span>
            <span className="w-1/4 text-right">Price</span>
          </div>
        </div>
        <div>
          {Array.isArray(order?.items) && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const dish = dishes.find((dish) => dish.id === item.dish);
              const sizeInfo = item.dish_size
                ? dishSizes[Number(item.dish_size)]
                : null;
              return (
                <div
                  key={index}
                  className="flex justify-between py-1 border-b border-dotted border-black"
                >
                  <span className="w-1/2">
                    {dish ? dish.name : "Unknown Dish"} /{" "}
                    {dish ? dish.arabic_name : "Unknown Dish"}
                    {sizeInfo && (
                      <span className="text-xs ml-1">({sizeInfo.size})</span>
                    )}
                  </span>
                  <span className="w-1/4 text-center">{item.quantity}</span>
                  <span className="w-1/4 text-right">
                    QAR{" "}
                    {sizeInfo
                      ? parseFloat(sizeInfo.price) * Number(item.quantity)
                      : dish
                      ? parseFloat(String(dish.price)) * Number(item.quantity)
                      : 0}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-center py-2">No items found</p>
          )}
        </div>
      </div>

      {/* Chair Details Section */}
      {order.chair_details && order.chair_details.length > 0 && (
        <div className="mb-4">
          <p className="font-bold border-y border-black py-1">CHAIR DETAILS</p>
          <div>
            {order.chair_details.map((chair, index) => (
              <div
                key={index}
                className="flex justify-between py-1 border-b border-dotted border-black"
              >
                <span>{chair.chair_name}</span>
                <span>{chair.total_time} hrs</span>
                <span>{chair.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals Section */}
      <div className="mb-4 pb-2 border-b border-black">
        <div className="flex justify-between py-1">
          <span>Total Quantity:</span>
          <span>{totalQuantity}</span>
        </div>
        {order.chair_details && order.chair_details.length > 0 && (
          <div className="flex justify-between py-1">
            <span>Chair Amount:</span>
            <span>{order.chair_amount}</span>
          </div>
        )}
        {order.order_type === "delivery" && (
          <div className="flex justify-between py-1">
            <span>Delivery Charge:</span>
            <span>QAR{order.delivery_charge}</span>
          </div>
        )}
        <div className="flex justify-between py-1 font-bold border-t border-black">
          <span>TOTAL AMOUNT:</span>
          <span>QAR{order.total_amount}</span>
        </div>
      </div>

      {/* FOC Products Section */}
      {order.foc_product_details && order.foc_product_details.length > 0 && (
        <div className="mb-4">
          <p className="font-bold border-y border-black py-1">FOC PRODUCTS</p>
          <div>
            {order.foc_product_details.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between py-1 border-b border-dotted border-black"
              >
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Section */}
      {order.order_type === "delivery" && (
        <>
          <div className="mt-4 flex justify-center">
            <QRCodeSVG value={`${order.id}`} size={64} />
          </div>
          <p className="text-center text-xs mt-1">Scan for Order ID</p>
        </>
      )}

      <div className="text-center mt-4">
        <p className="font-bold">Thank you for your purchase!</p>
      </div>
    </div>
  );
};

export default SalesPrint;
