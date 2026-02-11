import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./cartItem.module.css";
import { useDispatch } from "react-redux";
import { CartOperationsApi } from "../../../redux/auth/authApis";
import { useProducts } from "../../../redux/products/productsApis";
import { FaTint, FaPrint, FaDesktop, FaBox, FaTools } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function CartItem({ data, quantity }) {
  const { t } = useTranslation();
  const { id, name, price, url, productType } = data;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showAccessorySelection, setShowAccessorySelection] = useState(false);
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState({});

  // Fetch products dynamically
  const productsQuery = useProducts();
  const productsData = productsQuery.data;

  // Get product icon based on type
  const getProductIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'ink':
      case 'toner':
      case 'cartridge':
        return <FaTint className={styles.techIcon} />;
      case 'printer':
      case 'scanner':
      case 'multifunction':
        return <FaPrint className={styles.techIcon} />;
      case 'computer':
      case 'laptop':
      case 'pc':
        return <FaDesktop className={styles.techIcon} />;
      case 'accessory':
      case 'parts':
      case 'components':
        return <FaTools className={styles.techIcon} />;
      default:
        return <FaBox className={styles.techIcon} />;
    }
  };

  // Get compatible accessories for combo packs
  const compatibleAccessories = 
    productsData
      ?.filter(product => {
        // Filter for accessories compatible with this product
        if (productType?.toLowerCase().includes('printer')) {
          return product.category?.toLowerCase().includes('printer') || 
                 product.compatibility?.toLowerCase().includes('printer');
        }
        if (productType?.toLowerCase().includes('ink')) {
          return product.category?.toLowerCase().includes('ink') || 
                 product.compatibility?.toLowerCase().includes('cartridge');
        }
        return false;
      })
      .map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        compatibility: product.compatibility
      })) || [];

  const productInfoHandler = () => {
    navigate(`/market/${id}`, { state: { selectedProduct: data } });
  };

  // Check if this is a combo/bundle product
  const isComboProduct = () => {
    return name?.toLowerCase().includes('combo') || 
           name?.toLowerCase().includes('bundle') || 
           name?.toLowerCase().includes('kit');
  };

  // Get total selected accessories
  const getTotalSelectedAccessories = () => {
    return Object.values(selectedAccessories).reduce(
      (total, quantity) => total + quantity,
      0
    );
  };

  // Handle accessory quantity selection for combo products
  const handleAccessoryQuantityChange = (accessoryId, change) => {
    const currentQuantity = selectedAccessories[accessoryId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const totalOthers = getTotalSelectedAccessories() - currentQuantity;

    // Check if adding this quantity would exceed 10 accessories per combo
    const maxAccessoriesPerCombo = 10 * quantity;
    if (totalOthers + newQuantity <= maxAccessoriesPerCombo) {
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

  const generateWhatsAppMessage = () => {
    const customerName = user?.username || user?.name || t("valuedCustomer");
    const companyName = user?.company || "";
    let message = `🖨️ *${t("al3alamiaComputerAccessories")} - ${t("order")}* 🖨️\n\n`;
    message += `👤 *${t("customer")}:* ${customerName}\n`;
    if (companyName) {
      message += `🏢 *${t("company")}:* ${companyName}\n`;
    }
    message += `📍 *${t("address")}:* ${customerAddress}\n\n`;
    message += `🛍️ *${t("productOrder")}:*\n`;
    message += `*${name}*\n`;
    message += `📋 *${t("type")}:* ${productType || t('computerAccessory')}\n`;

    // Special handling for combo products
    if (isComboProduct() && Object.keys(selectedAccessories).length > 0) {
      message += `   🔧 ${t("selectedAccessories")}:\n`;
      Object.entries(selectedAccessories).forEach(([accessoryId, accessoryQuantity]) => {
        const accessory = compatibleAccessories.find((a) => a.id === accessoryId);
        if (accessory && accessoryQuantity > 0) {
          message += `      - ${accessory.name} (${accessory.category || t('accessory')}) x${accessoryQuantity}\n`;
        }
      });
      message += `   📦 ${t("totalAccessories")}: ${getTotalSelectedAccessories()}\n`;
    }

    message += `💰 ${t("price")}: ${price} ${t("EGP")}\n`;
    message += `🔢 ${t("quantity")}: ${quantity}\n`;
    message += `💎 ${t("total")}: ${(price * quantity).toFixed(2)} ${t("EGP")}\n\n`;
    message += `⚙️ *${t("orderSummary")}:*\n`;
    message += `   - ${t("product")}: ${name}\n`;
    message += `   - ${t("unitPrice")}: ${price}${t("EGP")}\n`;
    message += `   - ${t("quantity")}: ${quantity}\n`;
    if (Object.keys(selectedAccessories).length > 0) {
      message += `   - ${t("selectedAccessories")}: ${getTotalSelectedAccessories()} ${t("items")}\n`;
    }
    message += `   - ${t("totalAmount")}: ${(price * quantity).toFixed(2)} ${t("EGP")}\n\n`;
    message += `📞 *${t("contactInfo")}:*\n`;
    message += `   ${t("name")}: ${customerName}\n`;
    if (companyName) {
      message += `   ${t("company")}: ${companyName}\n`;
    }
    message += `   ${t("address")}: ${customerAddress}\n\n`;
    message += `🛠️ ${t("thankYouForChoosingAl3alamia")}`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = (phoneNumber) => {
    if (!customerAddress.trim()) {
      alert(t("pleaseEnterDeliveryAddress"));
      return;
    }

    // Check if combo product but no accessories selected
    if (isComboProduct() && getTotalSelectedAccessories() === 0) {
      alert(t("selectAtLeastOneAccessoryForCombo"));
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setShowWhatsAppModal(false);
    setShowAccessorySelection(false);
  };

  const buyHandler = () => {
    // If this is a combo product, show accessory selection first
    if (isComboProduct() && compatibleAccessories.length > 0) {
      setShowAccessorySelection(true);
    } else {
      setShowWhatsAppModal(true);
    }
  };

  const removeHandler = () => {
    dispatch(CartOperationsApi({ operation: "remove", data: id }));
  };

  const increaseHandler = () => {
    dispatch(CartOperationsApi({ operation: "increase", data: id }));
  };

  const decreaseHandler = () => {
    dispatch(CartOperationsApi({ operation: "decrease", data: id }));
  };

  return (
    <>
      <div className={styles.cartItem} id={id}>
        {/* Product Image */}
        <div className={styles.imageContainer} onClick={productInfoHandler}>
          <div className={styles.imageWrapper}>
            <img src={url} alt={name} className={styles.productImage} />
            <div className={styles.productTypeBadge}>
              {getProductIcon(productType)}
            </div>
          </div>
          <div className={styles.viewOverlay}>
            <span className={styles.viewIcon}>🖨️</span>
            <span>{t("viewProduct")}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <div className={styles.productTitleSection}>
              <h3 className={styles.productName} onClick={productInfoHandler}>
                {name}
              </h3>
              <div className={styles.productType}>
                {productType || t('computerAccessory')}
              </div>
            </div>
            <button className={styles.removeBtn} onClick={removeHandler}>
              <span className={styles.removeIcon}>✕</span>
            </button>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>{t("unitPrice")}</span>
            <span className={styles.unitPrice}>{price} {t("EGP")}</span>
          </div>

          {/* Quantity Controls */}
          <div className={styles.quantitySection}>
            <span className={styles.quantityLabel}>{t("quantity")}</span>
            <div className={styles.quantityControls}>
              <button
                className={styles.quantityBtn}
                onClick={decreaseHandler}
                disabled={quantity <= 1}
              >
                <span>−</span>
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button className={styles.quantityBtn} onClick={increaseHandler}>
                <span>+</span>
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>{t("subtotal")}</span>
            <span className={styles.totalPrice}>
              {(price * quantity).toFixed(2)} {t("EGP")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.buyNowBtn} onClick={buyHandler}>
              <span className={styles.btnIcon}>💬</span>
              {t("orderViaWhatsApp")}
            </button>
          </div>
        </div>

        {/* Hover Effects */}
        <div className={styles.hoverGlow}></div>
      </div>

      {/* Accessory Selection Modal for Combo Products */}
      {showAccessorySelection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "800px" }}>
            <div className={styles.modalHeader}>
              <h3>⚙️ {t("selectAccessoriesFor")} {name}</h3>
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
                  {t("comboProductAccessoryLimit", { max: 10 * quantity })}
                </p>
                <div className={styles.selectionCounter}>
                  {t("selected")}: {getTotalSelectedAccessories()} / {10 * quantity} {t("accessories")}
                </div>
              </div>

              <div className={styles.accessoryGrid}>
                {compatibleAccessories.map((accessory) => {
                  const accessoryQuantity = selectedAccessories[accessory.id] || 0;
                  const isMaxReached = getTotalSelectedAccessories() >= 10 * quantity;

                  return (
                    <div
                      key={accessory.id}
                      className={`${styles.accessoryOption} ${
                        accessoryQuantity > 0 ? styles.selected : ""
                      }`}
                    >
                      <div className={styles.accessoryInfo}>
                        <span className={styles.accessoryName}>
                          {accessory.name}
                        </span>
                        <span className={styles.accessoryCategory}>
                          {accessory.category || t('accessory')}
                        </span>
                        {accessory.compatibility && (
                          <span className={styles.compatibility}>
                            {t("compatibleWith")}: {accessory.compatibility}
                          </span>
                        )}
                      </div>

                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityBtn}
                          onClick={() =>
                            handleAccessoryQuantityChange(accessory.id, -1)
                          }
                          disabled={accessoryQuantity === 0}
                        >
                          -
                        </button>
                        <span className={styles.quantityDisplay}>
                          {accessoryQuantity}
                        </span>
                        <button
                          className={styles.quantityBtn}
                          onClick={() =>
                            handleAccessoryQuantityChange(accessory.id, 1)
                          }
                          disabled={isMaxReached && accessoryQuantity === 0}
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
                      alert(t("selectAtLeastOneAccessoryForCombo"));
                    }
                  }}
                  disabled={getTotalSelectedAccessories() === 0}
                >
                  {t("confirmSelection")} ({getTotalSelectedAccessories()}/{10 * quantity})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Order Modal */}
      {showWhatsAppModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>🖨️ {t("order")} {name}</h3>
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
                <h4>📦 {t("yourProduct")}:</h4>
                <div className={styles.orderItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>{name}</span>
                    <span className={styles.itemType}>{productType}</span>
                  </div>
                  <span className={styles.itemDetails}>
                    {price} {t("EGP")} × {quantity} = {(price * quantity).toFixed(2)} {t("EGP")}
                  </span>
                </div>

                {/* Show selected accessories for combo products */}
                {isComboProduct() && Object.keys(selectedAccessories).length > 0 && (
                  <div className={styles.selectedAccessoriesDisplay}>
                    <h5>{t("selectedAccessories")}:</h5>
                    {Object.entries(selectedAccessories).map(([accessoryId, accessoryQuantity]) => {
                      const accessory = compatibleAccessories.find((a) => a.id === accessoryId);
                      if (accessory && accessoryQuantity > 0) {
                        return (
                          <div key={accessoryId} className={styles.selectedAccessoryItem}>
                            <span>{accessory.name} ({accessory.category || t('accessory')})</span>
                            <span>x{accessoryQuantity}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div className={styles.totalAccessories}>
                      {t("totalAccessories")}: {getTotalSelectedAccessories()}
                    </div>
                  </div>
                )}

                <div className={styles.orderTotal}>
                  <strong>{t("total")}: {(price * quantity).toFixed(2)} {t("EGP")}</strong>
                </div>
              </div>

              <div className={styles.whatsappSection}>
                <p>📱 {t("selectWhatsAppNumberToSendOrder")}:</p>
                <div className={styles.whatsappButtons}>
                  <button
                    className={styles.whatsappBtn}
                    onClick={() => handleWhatsAppOrder("201140030112")}
                  >
                    <span className={styles.whatsappIcon}>📱</span>
                    {t("phoneNumber1")}
                  </button>
                  <button
                    className={styles.whatsappBtn}
                    onClick={() => handleWhatsAppOrder("201149260444")}
                  >
                    <span className={styles.whatsappIcon}>📱</span>
                    {t("phoneNumber2")}
                  </button>
                </div>
                <p className={styles.whatsappNote}>
                  💡 {t("whatsappConfirmationNoteCartItem")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CartItem;