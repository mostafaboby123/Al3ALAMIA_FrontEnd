import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  FaCreditCard,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaLock,
  FaShoppingBag,
  FaCheck,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";
import styles from "./checkout.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddBillToUserHistory } from "../../redux/bills/billsApi.js";
import { successMessage, errorMessage } from "../../redux/toasts.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearCart } from "../../redux/auth/authSlice";






// Validation schema using Yup (same as Checkout.jsx)
const validationSchema = Yup.object({
  nameOnCard: Yup.string()
    .required("Please enter the name on your card")
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .test("no-numbers", "Name cannot contain numbers or special characters", (value) => {
      return value ? !/\d/.test(value) : true;
    }),

  cardNumber: Yup.string()
    .required("Please enter your card number")
    .matches(/^\d{16}$/, "Card number must be exactly 16 digits")
    .test("not-all-same", "Card number cannot be all the same digit", (value) => {
      if (!value) return false;
      const firstDigit = value.charAt(0);
      return value.split("").some((digit) => digit !== firstDigit);
    }),

  expiryDate: Yup.string()
    .required("Please enter the expiry date")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Date must be in MM/YY format (e.g., 12/25)")
    .test("not-expired", "Your card has expired. Please use a different card", (value) => {
      if (!value || !value.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) return false;
      const [month, year] = value.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth());
      return expiry >= currentMonth;
    })
    .test("reasonable-future", "Expiry date seems too far in the future", (value) => {
      if (!value || !value.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) return false;
      const [month, year] = value.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const tenYearsFromNow = new Date();
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
      return expiry <= tenYearsFromNow;
    }),

  cvv: Yup.string()
    .required("Please enter your CVV code")
    .matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits only")
    .test("cvv-length", "CVV should be 3 digits for most cards, 4 for American Express", (value) => {
      return value && (value.length === 3 || value.length === 4);
    }),

  location: Yup.string()
    .required("Please enter your location")
    .min(3, "Location must be at least 3 characters long")
    .max(100, "Location cannot exceed 100 characters")
    .matches(/^[a-zA-Z0-9\s,.-]+$/, "Location can only contain letters, numbers, spaces, commas, periods, and hyphens"),
});

function ModernCheckout() {
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();
  const { type, products, quantity, totalPrice } = useLocation().state || {};
  const navigate = useNavigate();
  const { mutate: addBill, isLoading, error: mutationError } = useAddBillToUserHistory(user?.id);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // Redirect if no checkout data
  if (!products || !totalPrice) {
    navigate("/cart");
    return null;
  }

  const manyProducts = type === "all";

  // Initial form values
  const initialValues = {
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    location: "",
  };

  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + "/" + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  const handleSubmit = (values, { setSubmitting, setFieldError, resetForm }) => {
    setGeneralError("");

    // Generate unique bill ID
    const billId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create bill object
    const newBill = {
      id: billId,
      products: manyProducts
        ? products.map((item) => ({
            id: item.product.id,
            img: item.product.url,
            title: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          }))
        : products.map((item) => ({
            id: item.id,
            img: item.url,
            title: item.name,
            price: item.price,
            quantity: quantity,
          })),
      totalPrice: totalPrice,
      orderDate: new Date().toISOString(),
      location: values.location,
    };

    addBill(newBill, {
      onSuccess: () => {
        dispatch(clearCart());
        successMessage("Your order has been placed", {
          position: "bottom-right",
          autoClose: 3000,
          closeOnClick: false,
          toastId: `success_${billId}`,
        });
        setShowSuccessMessage(true);
        resetForm();

        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      },
      onError: (error) => {
        console.error("Payment error:", error);
        setGeneralError("Payment failed. Please check your details and try again.");
        errorMessage("Payment failed. Please try again.", {
          position: "bottom-right",
          autoClose: 3000,
          closeOnClick: false,
          toastId: `error_${billId}`,
        });

        if (error.message?.includes("card")) {
          setFieldError("cardNumber", "There was an issue with your card number");
        }
        if (error.message?.includes("expired")) {
          setFieldError("expiryDate", "Your card appears to be expired");
        }
        if (error.message?.includes("location")) {
          setFieldError("location", "Invalid location provided");
        }

        setSubmitting(false);
      },
    });
  };

  return (
    <>
      <div className={styles.container}>
        {/* Animated background elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.backgroundBubble1}></div>
          <div className={styles.backgroundBubble2}></div>
          <div className={styles.backgroundBubble3}></div>
        </div>

        <div className={styles.mainContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>Complete Your Order</h1>
          </div>

          <div className={styles.gridLayout}>
            {/* Order Summary Card */}
            <div className={styles.orderSummaryOrder}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconPrimary}`}>
                    <FaShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={styles.cardTitle}>Order Summary</h2>
                </div>

                {/* User Info */}
                <div className={styles.userInfo}>
                  <div className={styles.userInfoHeader}>
                    <div className={styles.userAvatar}>
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={styles.userName}>{user?.username}</p>
                      <p className={styles.userEmail}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className={styles.productsList}>
                  {manyProducts
                    ? products.map((item, index) => (
                        <div key={index} className={styles.productItem}>
                          <div className={styles.productCard}>
                            <div className={styles.productContent}>
                              <div className={styles.productImage}>
                                <img
                                  src={item.product.url}
                                  alt={item.product.name}
                                  className={styles.productImageEl}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center";
                                  }}
                                />
                              </div>
                              <div className={styles.productDetails}>
                                <h3 className={styles.productName}>{item.product.name}</h3>
                                <div className={styles.productMeta}>
                                  <p className={styles.productQuantity}>Qty: {item.quantity}</p>
                                  <p className={styles.productPrice}>
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : products.map((item, index) => (
                        <div key={index} className={styles.productItem}>
                          <div className={styles.productCard}>
                            <div className={styles.productContent}>
                              <div className={styles.productImage}>
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className={styles.productImageEl}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center";
                                  }}
                                />
                              </div>
                              <div className={styles.productDetails}>
                                <h3 className={styles.productName}>{item.name}</h3>
                                <div className={styles.productMeta}>
                                  <p className={styles.productQuantity}>Qty: {quantity}</p>
                                  <p className={styles.productPrice}>
                                    ${(item.price * quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>

                {/* Total */}
                <div className={styles.totalSection}>
                  <div className={styles.totalContent}>
                    <span className={styles.totalLabel}>Total Amount</span>
                    <span className={styles.totalAmount}>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className={styles.paymentFormOrder}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconSuccess}`}>
                    <FaCreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={styles.cardTitle}>Payment Details</h2>
                </div>

                {/* Success Message */}
                {showSuccessMessage && (
                  <div className={`${styles.successMessage} ${styles.fadeIn}`}>
                    <div className={styles.successContent}>
                      <div className={styles.successIcon}>
                        <FaCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={styles.successTitle}>Payment Successful!</h3>
                        <p className={styles.successText}>Your order has been processed successfully.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Error */}
                {generalError && (
                  <div className={`${styles.successMessage} ${styles.fadeIn}`}>
                    <div className={styles.successContent}>
                      <div className={styles.successIcon}>
                        <FaExclamationCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className={styles.successTitle}>Payment Failed</h3>
                        <p className={styles.successText}>{generalError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mutation Error */}
                {mutationError && (
                  <div className={`${styles.successMessage} ${styles.fadeIn}`}>
                    <div className={styles.successContent}>
                      <div className={styles.successIcon}>
                        <FaExclamationCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className={styles.successTitle}>System Error</h3>
                        <p className={styles.successText}>Something went wrong. Please try again later.</p>
                      </div>
                    </div>
                  </div>
                )}

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                    <Form className={styles.formContainer}>
                      {/* Name on Card */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <FaUser className="w-4 h-4" />
                          Name on Card
                        </label>
                        <div
                          className={`${styles.inputContainer} ${
                            focusedField === "nameOnCard" ? styles.inputContainerFocused : ""
                          }`}
                        >
                          <Field
                            type="text"
                            name="nameOnCard"
                            onFocus={() => setFocusedField("nameOnCard")}
                            onBlur={() => setFocusedField(null)}
                            className={`${styles.inputField} ${
                              errors.nameOnCard && touched.nameOnCard
                                ? styles.inputFieldError
                                : styles.inputFieldDefault
                            }`}
                            placeholder="Enter full name as on card"
                            maxLength="50"
                          />
                          {focusedField === "nameOnCard" && <div className={styles.inputGlow}></div>}
                        </div>
                        <ErrorMessage
                          name="nameOnCard"
                          component="p"
                          className={styles.errorMessage}
                        />
                      </div>

                      {/* Card Number */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <FaCreditCard className="w-4 h-4" />
                          Card Number
                        </label>
                        <div
                          className={`${styles.inputContainer} ${
                            focusedField === "cardNumber" ? styles.inputContainerFocused : ""
                          }`}
                        >
                          <Field name="cardNumber">
                            {({ field }) => (
                              <input
                                {...field}
                                type="text"
                                onFocus={() => setFocusedField("cardNumber")}
                                onBlur={() => setFocusedField(null)}
                                maxLength="19"
                                className={`${styles.inputField} ${
                                  errors.cardNumber && touched.cardNumber
                                    ? styles.inputFieldError
                                    : styles.inputFieldDefault
                                }`}
                                placeholder="1234 5678 9012 3456"
                                value={formatCardNumber(field.value)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFieldValue("cardNumber", formatCardNumber(value));
                                }}
                              />
                            )}
                          </Field>
                          {focusedField === "cardNumber" && <div className={styles.inputGlow}></div>}
                        </div>
                        <ErrorMessage
                          name="cardNumber"
                          component="p"
                          className={styles.errorMessage}
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className={styles.gridTwoColumns}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <FaCalendarAlt className="w-4 h-4" />
                            Expiry
                          </label>
                          <div
                            className={`${styles.inputContainer} ${
                              focusedField === "expiryDate" ? styles.inputContainerFocused : ""
                            }`}
                          >
                            <Field name="expiryDate">
                              {({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  onFocus={() => setFocusedField("expiryDate")}
                                  onBlur={() => setFocusedField(null)}
                                  maxLength="5"
                                  className={`${styles.inputField} ${
                                    errors.expiryDate && touched.expiryDate
                                      ? styles.inputFieldError
                                      : styles.inputFieldDefault
                                  }`}
                                  placeholder="MM/YY"
                                  value={formatExpiryDate(field.value)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setFieldValue("expiryDate", formatExpiryDate(value));
                                  }}
                                />
                              )}
                            </Field>
                            {focusedField === "expiryDate" && (
                              <div className={styles.inputGlow}></div>
                            )}
                          </div>
                          <ErrorMessage
                            name="expiryDate"
                            component="p"
                            className={styles.errorMessageSmall}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <FaLock className="w-4 h-4" />
                            CVV
                          </label>
                          <div
                            className={`${styles.inputContainer} ${
                              focusedField === "cvv" ? styles.inputContainerFocused : ""
                            }`}
                          >
                            <Field
                              type="text"
                              name="cvv"
                              onFocus={() => setFocusedField("cvv")}
                              onBlur={() => setFocusedField(null)}
                              maxLength="4"
                              className={`${styles.inputField} ${
                                errors.cvv && touched.cvv
                                  ? styles.inputFieldError
                                  : styles.inputFieldDefault
                              }`}
                              placeholder="123"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 4) {
                                  setFieldValue("cvv", value);
                                }
                              }}
                            />
                            {focusedField === "cvv" && <div className={styles.inputGlow}></div>}
                          </div>
                          <ErrorMessage
                            name="cvv"
                            component="p"
                            className={styles.errorMessageSmall}
                          />
                        </div>
                      </div>

                      {/* Delivery Location */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <FaMapMarkerAlt className="w-4 h-4" />
                          Delivery Location
                        </label>
                        <div
                          className={`${styles.inputContainer} ${
                            focusedField === "location" ? styles.inputContainerFocused : ""
                          }`}
                        >
                          <Field
                            type="text"
                            name="location"
                            onFocus={() => setFocusedField("location")}
                            onBlur={() => setFocusedField(null)}
                            className={`${styles.inputField} ${
                              errors.location && touched.location
                                ? styles.inputFieldError
                                : styles.inputFieldDefault
                            }`}
                            placeholder="Enter your delivery address"
                            maxLength="100"
                          />
                          {focusedField === "location" && <div className={styles.inputGlow}></div>}
                        </div>
                        <ErrorMessage
                          name="location"
                          component="p"
                          className={styles.errorMessage}
                        />
                      </div>

                      {/* Security Info */}
                      <div className={styles.securityInfo}>
                        <div className={styles.securityContent}>
                          <FaLock className="w-5 h-5 text-green-400" />
                          <div>
                            <p className={styles.securityTitle}>Secure Payment</p>
                            <p className={styles.securityText}>
                              Your payment information is encrypted and secure
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading || showSuccessMessage}
                        className={`${styles.submitButton} ${
                          isSubmitting || isLoading || showSuccessMessage
                            ? styles.submitButtonDisabled
                            : styles.submitButtonActive
                        }`}
                      >
                        <div className={styles.submitButtonContent}>
                          {isSubmitting || isLoading ? (
                            <>
                              <FaSpinner className="w-6 h-6 animate-spin" />
                              Processing Payment...
                            </>
                          ) : showSuccessMessage ? (
                            <>
                              <FaCheck className="w-6 h-6" />
                              Payment Completed
                            </>
                          ) : (
                            <>
                              <FaCreditCard className="w-6 h-6" />
                              Pay ${totalPrice.toFixed(2)} Now
                            </>
                          )}
                        </div>
                      </button>

                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default ModernCheckout;