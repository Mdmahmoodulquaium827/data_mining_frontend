import { configureStore } from "@reduxjs/toolkit";
import navbarReducer from "./navbarSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      navbar: navbarReducer,
    },
  });
};