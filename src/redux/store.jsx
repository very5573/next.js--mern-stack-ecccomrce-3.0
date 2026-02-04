"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";

// slices
import productReducer from "@/redux/slices/productSlice";
import authReducer from "@/redux/slices/authSlice";
import searchReducer from "@/redux/slices/searchSlice";
import shippingReducer from "@/redux/slices/shippingSlice";
import suggestionsReducer from "@/redux/slices/suggestionsSlice";
import cartReducer from "@/redux/slices/cartSlice";
import notificationReducer from "@/redux/slices/notificationSlice";

// root reducer without persist
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  search: searchReducer,
  shipping: shippingReducer,
  notifications: notificationReducer,
  product: productReducer,
  suggestions: suggestionsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
