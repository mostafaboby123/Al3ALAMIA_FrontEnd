// Cart.jsx
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import CartItem from "../../components/products/cartItem/CartItem";
import styles from "./cart.module.css";
import { useNavigate } from "react-router-dom";
import { CartOperationsApi } from "../../redux/auth/authApis";
import { useProducts } from "../../redux/products/productsApis";
import { useAddBillToUserHistory ,useUserBillsHistory} from "../../redux/bills/billsApi";
import { successMessage, errorMessage } from "../../redux/toasts";
import { useTranslation } from "react-i18next";

function Cart({ setCheckoutPageKey }) {
  const { t } = useTranslation();
  const cartData = useSelector((state) => state?.auth?.user?.cartInfo);
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showAccessorySelection, setShowAccessorySelection] = useState(false);
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState({});
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Add bill mutation
  const { mutate: addBill, isLoading: isAddingBill } = useAddBillToUserHistory(user?.id);
  const { data: bills = [], isLoading, isError } = useUserBillsHistory(user?.id);
  // console.log(bills.length);
  // Fetch products dynamically
  const productsQuery = useProducts();
  const productsData = productsQuery.data;

  // Check if it's user's first order
  const isFirstOrder = bills.length === 0;

  // Calculate discounts
  const calculateDiscounts = () => {
    let discount = 0;
    let discountType = "";
    
    // First order discount (10%)
    if (isFirstOrder) {
      discount += cartData.totalPrice * 0.1;
      discountType = t("firstOrderDiscount10");
    }
    console.log(isFirstOrder)
    console.log(user?.billsHistory)
    
    // Discount code (20%)
    if (appliedDiscount) {
      discount += cartData.totalPrice * 0.2;
      discountType = appliedDiscount === "INK20" ? t("discountCodeINK20") : t("discountCodeTECH15");
    }
    
    return {
      amount: discount,
      type: discountType,
      finalPrice: cartData.totalPrice - discount
    };
  };

  const discounts = calculateDiscounts();

  // Apply discount code
  const applyDiscountCode = () => {
    if (discountCode === "INK20" || discountCode === "TECH15") {
      setAppliedDiscount(discountCode);
      const discountPercent = discountCode === "INK20" ? "20%" : "15%";
      alert(t("discountAppliedSuccessfully", { code: discountCode }));
    } else {
      alert(t("invalidDiscountCode"));
    }
  };

  // Remove discount code
  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  // Get computer accessories from API data, excluding starter kits
  const allAccessories =
    productsData
      ?.filter((product) => product.type === "accessory")
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
      })) || [];

  const clearHandler = () =>
    dispatch(CartOperationsApi({ operation: "clear", data: null }));

  // Check if cart contains Starter Kit
  const hasStarterKit = () => {
    return cartData?.cart?.some(
      (item) => item.product.name === t("inkStarterKit")
    );
  };

  // Get total selected accessories
  const getTotalSelectedAccessories = () => {
    return Object.values(selectedAccessories).reduce(
      (total, quantity) => total + quantity,
      0
    );
  };

  // Handle accessory quantity selection for Starter Kit
  const handleAccessoryQuantityChange = (accessoryId, change) => {
    const currentQuantity = selectedAccessories[accessoryId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const totalOthers = getTotalSelectedAccessories() - currentQuantity;

    // Check if adding this quantity would exceed maximum accessories
    if (totalOthers + newQuantity <= 5) {
      setSelectedAccessories((prev) => ({
        ...prev,
        [accessoryId]: newQuantity,
      }));

      // Remove accessory if quantity is 0
      if (newQuantity === 0) {
        const updatedAccessories = { ...selectedAccessories };
        delete updatedAccessories[accessoryId];
        setSelectedAccessories(updatedAccessories);
      }
    }
  };

  // Create bill object for WhatsApp order
  const createWhatsAppBill = () => {
    const billId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: billId,
      products: cartData.cart.map((item) => ({
        id: item.product.id,
        img: item.product.url,
        title: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      totalPrice: discounts.finalPrice,
      orderDate: new Date().toISOString(),
      location: customerAddress,
      paymentMethod: "WhatsApp",
      status: "pending",
      discount: discounts.amount > 0 ? discounts : null
    };
  };

  const generateWhatsAppMessage = () => {
    const customerName = user?.username || user?.name || t("valuedCustomer");
    let message = `🖨️ *${t("al3alamiaComputerSupplies")} - ${t("newOrder")}* 🖨️\n\n`;
    message += `👤 *${t("customer")}:* ${customerName}\n`;
    message += `📍 *${t("address")}:* ${customerAddress}\n\n`;
    message += `🛒 *${t("orderDetails")}:*\n`;

    cartData.cart.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;

      // Special handling for Starter Kit
      if (
        item.product.name === t("inkStarterKit") &&
        Object.keys(selectedAccessories).length > 0
      ) {
        message += `   🛠️ ${t("selectedAccessories")}:\n`;
        Object.entries(selectedAccessories).forEach(([accessoryId, quantity]) => {
          const accessory = allAccessories.find((a) => a.id === accessoryId);
          if (accessory && quantity > 0) {
            message += `      - ${accessory.name} (${accessory.category}) x${quantity}\n`;
          }
        });
        message += `   📦 ${t("totalAccessories")}: ${getTotalSelectedAccessories()}\n`;
      }

      message += `   💰 ${t("price")}: ${item.product.price} ${t("EGP")}\n`;
      message += `   🔢 ${t("quantity")}: ${item.quantity}\n`;
      message += `   💎 ${t("subtotal")}: ${(
        item.product.price * item.quantity
      ).toFixed(2)} ${t("EGP")}\n\n`;
    });

    // Add discount information
    if (discounts.amount > 0) {
      message += `🎫 *${t("discountApplied")}:* ${discounts.type}\n`;
      message += `💰 *${t("discountAmount")}:* -${discounts.amount.toFixed(2)} ${t("EGP")}\n\n`;
    }

    message += `💳 *${t("orderTotal")}:* ${discounts.finalPrice.toFixed(2)} ${t("EGP")}\n\n`;
    message += `✨ ${t("thankYouForChoosingUs")} ✨`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = (phoneNumber) => {
    if (!customerAddress.trim()) {
      alert(t("pleaseEnterDeliveryAddress"));
      return;
    }

    // Check if Starter Kit is in cart but no accessories selected
    if (hasStarterKit() && getTotalSelectedAccessories() === 0) {
      alert(t("selectAtLeastOneAccessory"));
      return;
    }

    // Create and save the bill to user history
    const newBill = createWhatsAppBill();
    
    addBill(newBill, {
      onSuccess: () => {
        successMessage(t("orderPlacedViaWhatsApp"), {
          position: "bottom-right",
          autoClose: 3000,
        });
        
        // Send WhatsApp message
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, "_blank");
        
        setShowWhatsAppModal(false);
        setShowAccessorySelection(false);
      },
      onError: (error) => {
        console.error("Error saving WhatsApp order:", error);
        errorMessage(t("failedToSaveOrder"), {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    });
  };

  const buyHandler = () => {
    // If cart contains Starter Kit, show accessory selection first
    if (hasStarterKit()) {
      setShowAccessorySelection(true);
    } else {
      setShowWhatsAppModal(true);
    }
  };

  return (
    <div className={styles.cartWrapper}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingCircle}></div>
        <div className={styles.floatingCircle}></div>
        <div className={styles.floatingCircle}></div>
      </div>

      <section className={styles.page}>
        <div className={`container ${styles.container}`}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🛒</span>
                {t("yourCart")}
                {cartData?.isEmpty && (
                  <span className={styles.emptyBadge}>{t("empty")}</span>
                )}
              </h1>
              {!cartData?.isEmpty && (
                <p className={styles.itemCount}>
                  {t("itemCount", { 
                    count: cartData.cart.length,
                    items: cartData.cart.length !== 1 ? t("items") : t("item")
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Main Content */}
          {cartData?.isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🖨️</div>
              <h3>{t("yourComputerSuppliesCartIsEmpty")}</h3>
              <p>
                {t("browseOurPremiumProducts")}
              </p>
              <button
                className={styles.continueShoppingBtn}
                onClick={() => navigate("/market")}
              >
                {t("exploreAl3alamiaProducts")}
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className={styles.cartContent}>
                <div className={styles.itemsList}>
                  {cartData.cart.map((p, index) => (
                    <div
                      key={p.product.id}
                      className={styles.itemWrapper}
                      style={{ "--delay": `${index * 0.1}s` }}
                    >
                      <CartItem
                        data={p.product}
                        quantity={p.quantity}
                        setCheckoutPageKey={setCheckoutPageKey}
                      />
                    </div>
                  ))}
                </div>

                {/* Cart Summary Sidebar */}
                <div className={styles.cartSummary}>
                  <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>{t("orderSummary")}</h3>

                    <div className={styles.summaryDetails}>
                      <div className={styles.summaryRow}>
                        <span>{t("subtotal")}</span>
                        <span>{cartData.totalPrice} {t("EGP")}</span>
                      </div>
                      
                      {/* Discount Code Section */}
                      <div className={styles.discountSection}>
                        <div className={styles.discountInput}>
                          <input
                            type="text"
                            placeholder={t("enterDiscountCodePlaceholder")}
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            disabled={appliedDiscount !== null}
                          />
                          {appliedDiscount ? (
                            <button 
                              className={styles.removeDiscountBtn}
                              onClick={removeDiscountCode}
                            >
                              {t("removeDiscount")}
                            </button>
                          ) : (
                            <button 
                              className={styles.applyDiscountBtn}
                              onClick={applyDiscountCode}
                            >
                              {t("applyDiscount")}
                            </button>
                          )}
                        </div>
                        {appliedDiscount && (
                          <div className={styles.discountApplied}>
                            {t("discountCodeApplied", { code: appliedDiscount })}
                          </div>
                        )}
                      </div>
                      
                      {/* Discounts Display */}
                      {discounts.amount > 0 && (
                        <>
                          <div className={styles.summaryRow}>
                            <span>{t("discounts")}</span>
                            <span className={styles.discount}>-{discounts.amount.toFixed(2)} {t("EGP")}</span>
                          </div>
                          <div className={styles.discountNote}>
                            {discounts.type}
                          </div>
                        </>
                      )}
                      
                      <div className={styles.summaryDivider}></div>
                      <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>{t("total")}</span>
                        <span>{discounts.finalPrice.toFixed(2)} {t("EGP")}</span>
                      </div>
                      
                      {/* First order discount notification */}
                      {isFirstOrder && !appliedDiscount && (
                        <div className={styles.firstOrderNote}>
                          🎉 {t("youQualifyForFirstOrderDiscount")}
                        </div>
                      )}
                    </div>

                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.buyAllBtn} 
                        onClick={buyHandler}
                        disabled={isAddingBill}
                      >
                        <span className={styles.btnIcon}>💬</span>
                        {isAddingBill ? t("processing") : t("orderViaWhatsApp")}
                      </button>
                      <button
                        className={styles.clearBtn}
                        onClick={clearHandler}
                      >
                        <span className={styles.btnIcon}>🗑️</span>
                        {t("clearCart")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* WhatsApp Order Modal */}
      {showWhatsAppModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>🖨️ {t("completeYourAl3alamiaOrder")}</h3>
              <button
                className={styles.closeModal}
                onClick={() => setShowWhatsAppModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.addressSection}>
                <label htmlFor="address">📍 {t("deliveryAddressLabel")}:</label>
                <textarea
                  id="address"
                  placeholder={t("deliveryAddressPlaceholder")}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className={styles.addressInput}
                  rows={3}
                />
              </div>

              <div className={styles.orderSummary}>
                <h4>📦 {t("yourOrderDetails")}:</h4>
                {cartData.cart.map((item, index) => (
                  <div key={item.product.id} className={styles.orderItem}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemDetails}>
                      {item.product.price} {t("EGP")} × {item.quantity} = 
                      {(item.product.price * item.quantity).toFixed(2)} {t("EGP")}
                    </span>
                  </div>
                ))}
                
                {/* Discount information in modal */}
                {discounts.amount > 0 && (
                  <>
                    <div className={styles.orderItem}>
                      <span className={styles.itemName}>{t("discount")}</span>
                      <span className={styles.itemDetails}>
                        -{discounts.amount.toFixed(2)} {t("EGP")}
                      </span>
                    </div>
                    <div className={styles.discountNoteModal}>
                      {discounts.type}
                    </div>
                  </>
                )}
                
                <div className={styles.orderTotal}>
                  <strong>{t("total")}: {discounts.finalPrice.toFixed(2)} {t("EGP")}</strong>
                </div>
              </div>

              <div className={styles.whatsappSection}>
                <p>📱 {t("selectWhatsAppNumberToSendOrder")}:</p>
                <div className={styles.whatsappButtons}>
                  <button
                    className={styles.whatsappBtn}
                    onClick={() => handleWhatsAppOrder("201140030112")}
                    disabled={isAddingBill}
                  >
                    <span className={styles.whatsappIcon}>📱</span>
                    {isAddingBill ? t("processing") : t("phoneNumber1")}
                  </button>
                  <button
                    className={styles.whatsappBtn}
                    onClick={() => handleWhatsAppOrder("201114939714")}
                    disabled={isAddingBill}
                  >
                    <span className={styles.whatsappIcon}>📱</span>
                    {isAddingBill ? t("processing") : t("phoneNumber2")}
                  </button>
                </div>
                <p className={styles.whatsappNote}>
                  💡 {t("whatsappConfirmationNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Accessory Selection Modal for Starter Kit */}
      {showAccessorySelection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "800px" }}>
            <div className={styles.modalHeader}>
              <h3>🛠️ {t("selectAccessoriesForYourStarterKit")}</h3>
              <button
                className={styles.closeModal}
                onClick={() => setShowAccessorySelection(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.selectionInfo}>
                <p>
                  {t("starterKitAccessoryLimit")}
                </p>
                <div className={styles.selectionCounter}>
                  {t("selected")}: {getTotalSelectedAccessories()} / 5 {t("accessories")}
                </div>
              </div>

              <div className={styles.accessoryGrid}>
                {allAccessories.map((accessory) => {
                  const quantity = selectedAccessories[accessory.id] || 0;
                  const isMaxReached = getTotalSelectedAccessories() >= 5;

                  return (
                    <div
                      key={accessory.id}
                      className={`${styles.accessoryOption} ${
                        quantity > 0 ? styles.selected : ""
                      }`}
                    >
                      <div className={styles.accessoryInfo}>
                        <span className={styles.accessoryName}>
                          {accessory.name}
                        </span>
                        <span className={styles.accessoryCategory}>
                          {accessory.category}
                        </span>
                      </div>

                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityBtn}
                          onClick={() =>
                            handleAccessoryQuantityChange(accessory.id, -1)
                          }
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className={styles.quantityDisplay}>
                          {quantity}
                        </span>
                        <button
                          className={styles.quantityBtn}
                          onClick={() =>
                            handleAccessoryQuantityChange(accessory.id, 1)
                          }
                          disabled={isMaxReached && quantity === 0}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.selectionActions}>
                <button
                  className={styles.confirmSelectionBtn}
                  onClick={() => {
                    if (getTotalSelectedAccessories() > 0) {
                      setShowAccessorySelection(false);
                      setShowWhatsAppModal(true);
                    } else {
                      alert(t("selectAtLeastOneAccessory"));
                    }
                  }}
                  disabled={getTotalSelectedAccessories() === 0}
                >
                  {t("confirmSelection")} ({getTotalSelectedAccessories()}/5)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;