import axios, { AxiosInstance } from "axios";
import {
  Dish,
  ApiResponse,
  Category,
  OrderFormData,
  AnalyticsData,
  Order,
  Bill,
  DashboardData,
  DeliveryOrder,
  DeliveryDriver,
  PaginatedResponse,
} from "../types";
import store from "@/features/store";
import { setTokenExpired } from "@/features/slices/authSlice";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response.status === 401 &&
      error.response.data.messages &&
      error.response.data.messages[0] &&
      error.response.data.messages[0].message === "Token is invalid or expired"
    ) {
      store.dispatch(setTokenExpired(true));

      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const login = (credentials: any) => api.post("/login/", credentials);

export const loginWithPasscode = (passcode: { passcode: string }) => api.post("/login-passcode/", passcode);

export const logout = async () => {
  const refresh_token = localStorage.getItem("refresh");
  try {
    await api.post("/logout/", { refresh_token });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
  }
};

export const getCategories = () =>
  api
    .get<ApiResponse<Category>>("/categories/")
    .then((response) => response.data.results);

export const getDishes = (page: number = 1, pageSize: number = 10) =>
  api
    .get<ApiResponse<Dish>>(`/dishes/?page=${page}&page_size=${pageSize}`)
    .then((response) => response.data);

export const fetchDish = async (dishId: number) => {
  const response = await api.get(`/dishes/${dishId}/`);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

export const fetchOrders = async (page: number) => {
  const response = await api.get(`/orders/?page=${page}`);
  return response.data;
};

export const fetchOrder = async (orderId: number) => {
  const response = await api.get(`/orders/${orderId}/`);
  return response.data;
};

export const createOrder = async (orderData: OrderFormData) => {
  const response = await api.post("/orders/", orderData);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: Order["status"]
) => {
  const response = await api.patch<Order>(`/orders/${orderId}/`, { status });
  return response.data;
};

export const deleteOrder = async (orderId: number) => {
  const response = await api.delete<Order>(`/orders/${orderId}/`);
  return response.data;
};

export const generateBill = async (orderId: number, totalAmount: number) => {
  const response = await api.post<Bill>("/bills/", {
    order: orderId,
    total_amount: totalAmount,
  });
  return response.data;
};

export const fetchBills = async (page: number) => {
  const response = await api.get(`/bills/?page=${page}`);
  return response.data;
};

export const fetchUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread/");
    return response.data.length;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
  }
};

export const getAnalytics = () =>
  api
    .get<AnalyticsData>("/orders/analytics/")
    .then((response) => response.data);

export const fetchDashboardData = async (
  timeRange: string
): Promise<DashboardData> => {
  const [dashboardResponse, trendsResponse] = await Promise.all([
    api.get(`/orders/dashboard_data/?time_range=${timeRange}`),
    api.get(`/orders/sales_trends/?time_range=${timeRange}`),
  ]);

  const dashboardData = dashboardResponse.data;

  const trendsData = trendsResponse.data;

  return { ...dashboardData, ...trendsData };
};

// Fetch driver orders
export const fetchDriverOrders = () => {
  return api.get<PaginatedResponse<DeliveryOrder>>("/delivery-orders/");
};

// Fetch delivery drivers
export const fetchDeliveryDrivers = async () => {
  const response = await api.get<PaginatedResponse<DeliveryDriver>>(`/delivery-drivers/`);
  return response.data;
};

// Fetch driver profile
export const fetchDriverProfile = (driverId: number) => {
  return api.get<DeliveryDriver>(`/delivery-drivers/${driverId}/`);
};

// Update driver status
export const updateDriverStatus = (driverId: number, action: string) => {
  return api.patch(`/delivery-drivers/${driverId}/${action}/`);
};

// Update delivery status
export const updateDeliveryOrderStatus = (orderId: number, status: string) => {
  return api.patch(`/delivery-orders/${orderId}/update_status/`, {
    status: status,
  });
};

// Delete delivery status
export const deleteDeliveryOrder = (orderId: number) => {
  return api.delete(`/delivery-orders/${orderId}/`);
};
