import { useNavigate } from "react-router-dom";
import styles from "./productCard.module.css";
import useCart from "../../../hooks/useCart";
import React from "react";
import { useSelector } from "react-redux";
import { FaMouse, FaKeyboard, FaPlug, FaSquare, FaPrint } from "react-icons/fa";
import { useTranslation } from "react-i18next";
function ProductCard({ data, children }) {
  const { t } = useTranslation();
  const { id, name, desc, price, url, type } = data;
  const { inCart, addToCartHandler, removeFromCartHandler } = useCart(data);

  const userRole = useSelector((state) => state?.auth?.user?.role);

  const navigate = useNavigate();

  const productInfoHandler = () => navigate(`/market/${id}`);

  // Determine badge styling based on perfume type
  const getTypeBadgeStyle = () => {
    switch (type) {
      case "Mouse":
        return `${styles.type_badge} ${styles.Mouse_badge}`;
      case "Keyboard":
        return `${styles.type_badge} ${styles.Keyboard_badge}`;
      case "Cables":
        return `${styles.type_badge} ${styles.cables_badge}`;
      case "Mouse Pad":
        return `${styles.type_badge} ${styles.Mousepad_badge}`;
      case "Inks":
        return `${styles.type_badge} ${styles.Inks_badge}`;
      default:
        return styles.type_badge;
    }
  };

  // Get appropriate icon for the type
  const getTypeIcon = () => {
    switch (type) {
      case "Mouse":
        return <FaMouse />;
      case "Keyboard":
        return <FaKeyboard />;
      case "Cables":
        return <FaPlug />;
      case "Mouse Pad":
        return <FaSquare />;
      case "Inks":
        return <FaPrint />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.box} id={id}>
      <div className={styles.image_con} onClick={productInfoHandler}>
        <div className={styles.top}>
          <div className={getTypeBadgeStyle()}>
            <span className={styles.type_icon}>{getTypeIcon()}</span>
            {t(type)}
          </div>
        </div>
        <img src={url} className={styles.product_image} alt={name} />
      </div>
      <div className={styles.data}>
        <h2 className={styles.box_title} onClick={productInfoHandler}>
          {name}
        </h2>
        <p className={styles.desc}>{desc.slice(0, 50)}...</p>
        {/* <p className={styles.sales}>Sold: {sales} Items</p> */}
        <div className={styles.main}>
          <p className={styles.price}>{price} {t("EGP")}</p>
          {userRole === "admin" ? (
            children
          ) : (
            <button
              className={`${styles.cart_btn} ${inCart ? styles.add_to_cart : styles.remove_from_cart}`}
              onClick={
                ["admin"].includes(userRole)
                  ? productInfoHandler
                  : inCart
                    ? removeFromCartHandler
                    : addToCartHandler
              }
            >
              {["admin"].includes(userRole)
                ? t("moreDetails")
                : inCart
                  ? t("removeFromCart")
                  : t("addToCart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
