import styles from "./productInfo.module.css";
import {
  FaShoppingCart,
  FaArrowLeft,
  FaStar,
  FaStarHalfAlt,
  FaTint,
  FaPrint,
  FaBox,
  FaDesktop,
  FaKeyboard,
  FaMouse,
} from "react-icons/fa";
import useCart from "../../../hooks/useCart";
import { useNavigate, useParams } from "react-router-dom";
import { useProductById } from "../../../redux/products/productsApis";
import { useSelector } from "react-redux";
import Review from "../review/Review";
import PostReviewCon from "../postsAndReviewsContainer/PostReviewCon";
import { useTranslation } from "react-i18next";
const ProductInfo = () => {
  const { t } = useTranslation();
  const { id: productid } = useParams();
  const navigate = useNavigate();
  const { data, isPending, error } = useProductById(productid);
  const cartData = useCart(data);

  const userRole = useSelector((state) => state?.auth?.user?.role);

  // Loading state
  if (isPending)
    return <div className={styles.loading}>Loading product details...</div>;

  // Error state
  if (error)
    return <div className={styles.error}>Error loading product details.</div>;

  // No data
  if (!data) return <div className={styles.error}>Product not found.</div>;

  const {
    id,
    name,
    brand,
    desc,
    compatibility, // Changed from inspiredBy to compatibility
    price,
    maxQuantity,
    sales,
    url,
    reviews,
    rating,
    type,
  } = data;

  const { inCart, addToCartHandler, removeFromCartHandler } = cartData || {};

  const stockStatus =
    maxQuantity > 5
      ? t("inStock")
      : maxQuantity === 0
        ? t("outOfStock")
        : t("onlyLeft", { count: maxQuantity });

  const stockClass =
    maxQuantity > 5
      ? styles.available
      : maxQuantity === 0
        ? styles.notAvailable
        : styles.lowStock;

  // Get product icon based on type
  const getProductIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "Inks":
        return <FaPrint className={styles.typeIcon} />;
      case "Keyboard":
      case "Mouse":
      case "accessories":
        return <FaBox className={styles.typeIcon} />;
      default:
        return <FaBox className={styles.typeIcon} />;
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className={styles.star} />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={styles.star} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className={styles.emptyStar} />);
    }

    return stars;
  };

  const fieldsToDisplay = [
    { label: t("productName"), value: name },
    { label: t("brand"), value: brand },
    { label: t("description"), value: desc },
    { label: t("compatibility"), value: compatibility },

    { label: t("unitsSold"), value: sales },
  ].filter(({ value }) => value && value.toString().toLowerCase() !== "none");

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={`${styles.imageContainer}`}>
            <div className={styles.imageWrapper}>
              <img src={url} alt={name} className={styles.productImage} />
              <div className={styles.productTypeBadge}>
                {getProductIcon(type)}
                <span>{t(type) || "Accessory"}</span>
              </div>
            </div>
          </div>

          <div className={`${styles.infoContainer}`}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{name}</h1>
                <div className={styles.brandTag}>{brand || "AL 3ALAMIA"}</div>
              </div>
            </div>

            <div className={styles.stockStatus}>
              <span className={styles.stockLabel}>{t("availability")}:</span>
              <span className={`${styles.stockValue} ${stockClass}`}>
                {t(stockStatus)}
              </span>
            </div>

            <div className={styles.fieldsGrid}>
              {fieldsToDisplay.map(({ label, value }) => (
                <div key={label} className={styles.field}>
                  <span className={styles.label}>{label}:</span>
                  <span className={styles.value}>{value}</span>
                </div>
              ))}
            </div>

            {/* Rating section in info */}
            {rating && (
              <div className={styles.ratingSection}>
                <span className={styles.label}>{t("customerRating")}:</span>
                <div className={styles.ratingInfo}>
                  <div className={styles.starsContainer}>
                    {renderStars(rating)}
                  </div>
                  <span className={styles.ratingText}>
                    {rating} {t("outOfFiveStars")}
                  </span>
                  {reviews && reviews.length > 0 && (
                    <span className={styles.reviewCount}>
                      ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className={styles.priceContainer}>
              <div className={styles.price}>{price} {t("EGP")}</div>
              <button
                className={`${styles.button} ${
                  inCart ? styles.remove : styles.add
                }`}
                onClick={
                  ["admin", "doctor"].includes(userRole)
                    ? () =>
                        navigate(
                          `/${
                            userRole === "admin"
                              ? "market_management"
                              : "market"
                          }`,
                        )
                    : inCart
                      ? removeFromCartHandler
                      : addToCartHandler
                }
                disabled={
                  maxQuantity === 0 && !["admin", "doctor"].includes(userRole)
                }
              >
                <FaShoppingCart className="mr-2" />
                {["admin"].includes(userRole)
                  ? "Return To Store"
                  : maxQuantity === 0
                    ? (t("outOfStock"))
                    : inCart
                      ? (t("removeFromCart"))
                      : (t("addToCart"))}
              </button>
            </div>
            {!["admin"].includes(userRole) && (
              <button
                onClick={() => navigate(-1)}
                className={styles.backButton}
                aria-label="Back to Store"
              >
                <FaArrowLeft className="mr-2" />
                {t("BackToStore")}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`${styles.productReviewsContainer}`}>
        <PostReviewCon
          title="Product Reviews"
          data={reviews || []}
          Component={Review}
          type="review"
        />
      </div>
    </div>
  );
};

export default ProductInfo;
