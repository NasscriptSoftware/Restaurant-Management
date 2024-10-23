import { useMutation, useQueryClient } from "react-query";
import { updateOrderStatus as updateOrderStatusAPI } from "../services/api";
import { Order } from "../types/index";

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation(
    ({ orderId, status }: { orderId: number; status: Order["status"] }) =>
      updateOrderStatusAPI(orderId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("orders");
      },
    }
  );

  return {
    updateOrderStatus: mutate,
    isLoading,
    error,
  };
};
