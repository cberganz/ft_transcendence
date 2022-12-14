import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../Api/apiSlice";
import authReducer from "../Hooks/authSlice"

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		auth: authReducer
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true
})