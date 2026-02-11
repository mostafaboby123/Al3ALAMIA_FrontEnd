import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { successMessage } from "../toasts";
import { updateCart } from "./authSlice";

const USERS_URL = "https://al3alamiabackend-production.up.railway.app/users";
const DOCTORS_URL = "https://al3alamiabackend-production.up.railway.app/doctors";

// Register user

export const signUpApi = createAsyncThunk("auth/signUp", async (userData, thunkAPI) => {
  try {
    const existingUser = await axios.get(USERS_URL, {
      params: {
        email: userData.email,
      },
    });

    if (existingUser.data.length > 0) {
      return thunkAPI.rejectWithValue("Invalid credentials!, email is already exists");
    }

    const user = {
      ...userData,
      role: "client",
      address: "",
      cartInfo: {
        cart: [],
        isEmpty: true,
        totalPrice: 0,
      },
      billsHistory: [],
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
      cardHolder: "",
      bannInfo: {
        isBanned: false,
        reason: "",
      }
    };

    const res = await axios.post(USERS_URL, user);

    if (res.status !== 201) {
      return thunkAPI.rejectWithValue("Failed to register user");
    }

    const fakeToken = Date.now().toString();

    // Return the user from the database response (includes the auto-generated ID)
    // instead of our local user object
    const userWithToken = { user: res.data, token: fakeToken };

    localStorage.setItem("user", JSON.stringify(userWithToken));

    return userWithToken;
  } catch (error) {
    console.error("❌ Signup Error:", error);
    return thunkAPI.rejectWithValue("Something went wrong!");
  }
});

// Login user

export const loginApi = createAsyncThunk("auth/login", async ({ email, password }, thunkAPI) => {
  try {
    // 1. Check if user is admin
    const adminRes = await axios.get("https://al3alamiabackend-production.up.railway.app/admin", {
      params: { email, password },
    });

    if (adminRes.data && adminRes.data.length > 0) {
      // Admin found, return admin user with token
      const fakeToken = Date.now().toString();
      const userWithToken = { user: adminRes.data[0], token: fakeToken };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      return userWithToken;
    }

    // 2. Check if user is doctor or client
    const checkRole = email.split("@")[0].split(".")[1];
    const BASE_URL = checkRole === "doc" ? DOCTORS_URL : USERS_URL;

    const res = await axios.get(BASE_URL, {
      params: { email, password },
    });

    if (res.data.length === 0) {
      return thunkAPI.rejectWithValue("Invalid credentials!, user is not exists");
    } else if (res.data[0]?.bannInfo?.isBanned) {
      return thunkAPI.rejectWithValue(`You was banned because ${res.data[0].bannInfo.reason}`);
    }

    const fakeToken = Date.now().toString();
    const userWithToken = { user: res.data[0], token: fakeToken };
    localStorage.setItem("user", JSON.stringify(userWithToken));
    return userWithToken;
  } catch (error) {
    console.error("Login Error:", error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong!");
  }
});

// Cart Thunk

export const CartOperationsApi = createAsyncThunk("auth/CartOperations", async ({ operation, data }, thunkAPI) => {
  try {
    const id = thunkAPI.getState().auth.user.id;
    console.log(id)
    let cartInfo = structuredClone(thunkAPI.getState().auth.user.cartInfo);
    let res;

    if (operation === "add") {
      cartInfo.cart.push({ product: { ...data }, quantity: 1 });
      cartInfo.totalPrice += data.price;
      cartInfo.isEmpty = false;
      successMessage("Added To Cart");
    } else if (operation === "remove") {
      const productIndex = cartInfo.cart.findIndex((p) => p.product.id === data);
      const currentProduct = cartInfo.cart[productIndex];
      cartInfo.totalPrice -= currentProduct.product.price * currentProduct.quantity;
      cartInfo.cart.splice(productIndex, 1);
      cartInfo.isEmpty = cartInfo.cart.length === 0;
      successMessage("Removed From Cart");
    } else if (operation === "increase") {
      const productIndex = cartInfo.cart.findIndex((p) => p.product.id === data);
      const currentProduct = cartInfo.cart[productIndex];

      if (currentProduct.quantity === currentProduct.product.maxQuantity) {
        successMessage("No more quantity available");
        return;
      }

      cartInfo.cart[productIndex].quantity += 1;
      cartInfo.totalPrice += currentProduct.product.price;
    } else if (operation === "decrease") {
      const productIndex = cartInfo.cart.findIndex((p) => p.product.id === data);
      const currentProduct = cartInfo.cart[productIndex];

      if (currentProduct.quantity === 1) {
        successMessage("The quantity cannot be less than 1");
        return;
      }

      cartInfo.cart[productIndex].quantity -= 1;
      cartInfo.totalPrice -= currentProduct.product.price;
    } else if (operation === "clear") {
      cartInfo = {
        cart: [],
        isEmpty: true,
        totalPrice: 0,
      };
      successMessage("Now your cart is empty");
    }

    res = await axios.patch(`${USERS_URL}/${id}`, { cartInfo });

    thunkAPI.dispatch(updateCart(cartInfo));

    return {
      message: "Added To Cart Successfully",
      cartInfo: res.data,
    };
  } catch (error) {
    console.error("Cart Update Error:", error);
    return thunkAPI.rejectWithValue("Failed to update cart");
  }
});

// Update user data

export const updateUserDataApi = createAsyncThunk("auth/updateUserData", async (userData, thunkAPI) => {
  try {
    const id = thunkAPI.getState().auth.user.id;
    const res = await axios.patch(`${USERS_URL}/${id}`, userData);

    const updatedUser = { ...thunkAPI.getState().auth.user, ...res.data };

    localStorage.setItem("user", JSON.stringify({ user: updatedUser, token: thunkAPI.getState().auth.token }));

    return updatedUser;
  } catch (error) {
    console.error("Update User Data Error:", error);
    return thunkAPI.rejectWithValue("Failed to update user data\n" + error.message);
  }
});

// User Appointments Thunk

export const AppointmentOperationsApi = createAsyncThunk("auth/AppointmentOperations", async ({ operation, data }, thunkAPI) => {
  const success_message = "Appointment Booked Successfully";
  const cancle_message = "Appointment Canceled !";
  try {
    if (operation === "add") {
      const appointmentsResponse = await axios.post("https://al3alamiabackend-production.up.railway.app/appointments", data);
      successMessage(success_message);
      return {
        message: success_message,
        appointment: appointmentsResponse.data,
      };
    }
    //
    else if (operation === "remove") {
      const appointmentsResponse = await axios.delete(`https://al3alamiabackend-production.up.railway.app/appointments/${data}`);
      successMessage(cancle_message);
      return {
        message: cancle_message,
        appointment: appointmentsResponse.data,
      };
    }
    //
    else {
      return thunkAPI.rejectWithValue("Appointment not found in user's appointments");
    }
  } catch (error) {
    console.error("Appointment operation error:", error);
    return thunkAPI.rejectWithValue("Failed to update appointments");
  }
});
