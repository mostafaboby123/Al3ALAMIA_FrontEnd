import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/home/Home";
import Login from "./pages/login and Register/Login";
import Register from "./pages/login and Register/Register";
import Market from "./pages/market/Market";
import MainPage from "./pages/MainPage";
import ProductInfo from "./components/products/product info/ProductInfo";
import ProtectedRoute from "./routes/ProtectedRoute";
import Cart from "./pages/cart/Cart";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import CheckOutProtected from "./routes/CheckOutProtected";
import Checkout from "./pages/checkout/Checkout";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";
import VerifyEmail from "./pages/verify email/VerifyEmail";
import Profile from "./pages/profile/profile";
import ProtectedRouteUserAdmin from "./routes/ProtectedRouteUserAdmin";
import ProtectedRouteUser from "./routes/ProtectedRouteUser";
import AdmenProfile from "./pages/admin profile/AdminProfile";
import ProtectedRouteAdmin from "./routes/ProtectedRouteAdmen";
import MarketManage from "./pages/market manage/MarketManage";

// Add these imports for i18next
import './i18n'; // Make sure this file exists (see below)
import { useTranslation } from 'react-i18next';

function App() {
  const [checkoutPageKey, setCheckoutPageKey] = useState(false);
  const location = useLocation();
  
  // Add language initialization effect
  useEffect(() => {
    // Initialize language from localStorage on app start
    const savedLang = localStorage.getItem("lang") || "en";
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, []);

  useEffect(() => {
    if (location.pathname !== "/checkout") {
      setCheckoutPageKey(false);
    }
  }, [location.pathname]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<Home />} />

          <Route path="/home" element={<Home />} />

          {/* Client And Admin Routes */}


          <Route path="/market" element={<Market />} />
          <Route path="/market/:id" element={<ProductInfo />} />

          {/* Client Routes */}
          <Route path="/" element={<ProtectedRouteUser />}>
            <Route path="/cart" element={<Cart setCheckoutPageKey={setCheckoutPageKey} />} />
            <Route
              path="/checkout"
              element={
                <CheckOutProtected checkoutPageKey={checkoutPageKey}>
                  <Checkout setCheckoutPageKey={setCheckoutPageKey} />
                </CheckOutProtected>
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<ProtectedRouteAdmin />}>
            <Route path="/adminProfile" element={<AdmenProfile />} />
            <Route path="/market_management" element={<MarketManage />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/sign_up" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<h1>Page Not Found :(</h1>} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;