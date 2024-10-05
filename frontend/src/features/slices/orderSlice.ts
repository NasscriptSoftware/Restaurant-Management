import { OrderDish } from "@/pages/DishesPage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderState {
  items: OrderDish[];
}

const initialState: OrderState = {
  items: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<OrderDish>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; change: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(
          (item.quantity || 0) + action.payload.change,
          0
        );
      }
      state.items = state.items.filter((item) => item.quantity > 0);
    },
    clearItems: (state) => {
      state.items = [];
    },
    setItems: (state, action: PayloadAction<OrderDish[]>) => {
      if (JSON.stringify(state.items) !== JSON.stringify(action.payload)) {
        state.items = action.payload;
      }
    },
  },
});

export const { addItem, updateQuantity, clearItems, setItems } =
  orderSlice.actions;

export default orderSlice.reducer;
