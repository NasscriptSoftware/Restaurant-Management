// slices/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orderData: null,
  },
  reducers: {
    setOrderData: (state, action) => {
      state.orderData = action.payload;
    },
    clearOrderData: (state) => {
      state.orderData = null;
    },
  },
});

export const { setOrderData, clearOrderData } = orderSlice.actions;
export default orderSlice.reducer;
