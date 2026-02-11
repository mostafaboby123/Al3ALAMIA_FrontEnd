import React, { forwardRef } from "react";
import styles from "./reviews.module.css";
import { FaStar, FaTint, FaPrint, FaBox, FaShoppingCart } from "react-icons/fa";

const Review = forwardRef(({ data: review, animated }, ref) => {
  // Icon mapping based on product type mentioned in review
  const getProductIcon = (productType) => {
    switch(productType?.toLowerCase()) {
      case 'ink':
      case 'ink cartridge':
      case 'toner':
        return <FaTint className={styles.productIcon} />;
      case 'printer':
      case 'printing machine':
      case 'scanner':
        return <FaPrint className={styles.productIcon} />;
      case 'accessory':
      case 'parts':
      case 'supplies':
        return <FaBox className={styles.productIcon} />;
      default:
        return <FaShoppingCart className={styles.productIcon} />;
    }
  };

  return (
    <div className={`${styles.review} ${animated ? styles.commentFadeIn : ""}`} ref={ref}>
      <div className={styles.productInfo}>
        {review.productName && (
          <>
            {getProductIcon(review.productType)}
            <span className={styles.productName}>{review.productName}</span>
          </>
        )}
      </div>
      
      <p className={styles.date}>{new Date(review.timestamp).toLocaleDateString()}</p>
      <p className={styles.time}>{new Date(review.timestamp).toLocaleTimeString()}</p>
      
      <div className={styles.header}>
        <div>
          <strong className={styles.clientName}>{review.clientName}</strong>
          {review.companyName && (
            <span className={styles.companyName}> - {review.companyName}</span>
          )}
        </div>
        <div className={styles.rating}>
          <FaStar className={styles.starIcon} />
          <span className={styles.ratingValue}>{review.rating}</span>
        </div>
      </div>
      
      <p className={styles.comment}>{review.comment}</p>
      
      {review.orderNumber && (
        <div className={styles.orderInfo}>
          <span className={styles.orderLabel}>Order #:</span>
          <span className={styles.orderNumber}>{review.orderNumber}</span>
        </div>
      )}
    </div>
  );
});

export default Review;