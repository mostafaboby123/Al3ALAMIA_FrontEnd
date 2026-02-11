/* eslint-disable no-unused-vars */
import { useRef, useState } from "react";
import { LoaderPage } from "../../common/loadingSpinners/Loaders";
import styles from "./postReviewCon.module.css";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import StarRatingInput from "../../common/starRating/StarRatingInput";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import {
  useAddReview,
  useUpdateReview,
} from "../../../redux/reviews/reviewsApis";
import { motion, AnimatePresence } from "framer-motion";
import { FaTint, FaPrint, FaDesktop, FaCogs } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const PostReviewCon = ({ title, data, Component, type }) => {
  const { t } = useTranslation();
  const productId = useParams().id;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const reviewInputRef = useRef(null);
  const firstReviewRef = useRef(null);
  const [highlightFirstReview, setHighlightFirstReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);

  // Find if the user has already submitted a review
  const userReview = data.find(
    (review) => review.clientName === user?.username,
  );
  const isUpdateMode = !!userReview;

  const scrollToFirstReview = () => {
    setTimeout(() => {
      setHighlightFirstReview(true);
      firstReviewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      setTimeout(() => setHighlightFirstReview(false), 1000);
    }, 400);
  };

  const { mutate: addReview } = useAddReview(productId, scrollToFirstReview);
  const { mutate: updateReview } = useUpdateReview(
    productId,
    scrollToFirstReview,
  );

  const initialValues = {
    clientId: user?.id,
    clientName: user?.username,
    companyName: user?.company || "",
    comment: isUpdateMode ? userReview.comment : "",
    rating: isUpdateMode ? userReview.rating : 0,
    productType: isUpdateMode ? userReview.productType : "",
  };

  const validationSchema = Yup.object({
    comment: Yup.string().required(t("validationCommentRequired")),
    rating: Yup.number()
      .min(1, t("validationRatingMin"))
      .required(t("validationRatingRequired")),
  });

  const handleSubmit = (values, { resetForm }) => {
    if (isUpdateMode) {
      updateReview({
        ...values,
        timestamp: new Date().toISOString(),
      });
    } else {
      addReview({
        ...values,
        timestamp: new Date().toISOString(),
      });
    }
    setShowForm(false);
    resetForm();
  };

  const toggleForm = () => {
    if (!isAuthenticated) return navigate("/login");
    setShowForm(!showForm);
    setIsFormFocused(!showForm);
    if (!showForm) {
      setTimeout(() => reviewInputRef.current?.focus(), 350);
    }
  };

  // Get product icon for empty state
  const getProductIcon = () => {
    const icons = [
      <FaTint key="tint" className={styles.techIcon} />,
      <FaPrint key="print" className={styles.techIcon} />,
      <FaDesktop key="desktop" className={styles.techIcon} />,
      <FaCogs key="cogs" className={styles.techIcon} />,
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  // Calculate average rating
  const averageRating =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.rating, 0) / data.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t(title)}</h3>
        {type === "review" && (
          <div className={styles.reviewStats}>
            <div className={styles.ratingBadge}>
              {averageRating}
              <span>/5</span>
            </div>
            <div className={styles.reviewCount}>
              {data.length}{" "}
              {data.length === 1 ? t("Product Review") : t("Product Reviews")}
            </div>
          </div>
        )}
      </div>
      <div
        className={`${styles.innerCon} ${type === "review" ? styles.review : ""}`}
      >
        {type === "review" && data.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <div className={styles.techIconContainer}>{getProductIcon()}</div>
              <div className={styles.plusIcon}>+</div>
            </div>
            <p>{t("noProductReviews")}</p>
            <p>{t("beFirstToReview")}</p>
            <button className={styles.ctaButton} onClick={toggleForm}>
              {t("shareYourExperience")}
            </button>
          </div>
        ) : (
          <div className={styles.data}>
            {type === "review" &&
              Array.isArray(data) &&
              data.map((d, i) => (
                <Component
                  key={i}
                  data={d}
                  animated={i === 0 && highlightFirstReview}
                  ref={i === 0 ? firstReviewRef : null}
                />
              ))}
          </div>
        )}
      </div>

      {type === "review" && (
        <AnimatePresence>
          {showForm && (
            <motion.div
              className={`${styles.formCon} ${isFormFocused ? styles.focused : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.formHeader}>
                <h4>
                  {isUpdateMode
                    ? t("updateProductReview")
                    : t("shareProductExperience")}
                </h4>
                <button className={styles.closeButton} onClick={toggleForm}>
                  <IoMdClose />
                </button>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty, values, setFieldValue }) => (
                  <Form className={styles.form}>
                    {user?.company && (
                      <div className={styles.formGroup}>
                        <label>Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={user.company}
                          className={styles.companyInput}
                          disabled
                        />
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>{t("RateThisProduct")}</label>
                      <div className={styles.ratingContainer}>
                        <Field
                          name="rating"
                          component={StarRatingInput}
                          className={styles.ratingInput}
                        />
                        <div className={styles.ratingValue}>
                          {values.rating ? Number(values.rating.toFixed(1)) : 0}
                          /5
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>{t("YourExperience")}</label>
                      <Field
                        as="textarea"
                        name="comment"
                        placeholder={t("TellUsAboutProductExperience")}
                        innerRef={reviewInputRef}
                        className={styles.textarea}
                        onFocus={() => setIsFormFocused(true)}
                        onBlur={() => setIsFormFocused(false)}
                      />
                    </div>

                    <div className={styles.formActions}>
                      <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={!(isValid && dirty)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isUpdateMode
                          ? t("updateProductReview")
                          : t("submitReview")}
                      </motion.button>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {type === "review" && !showForm && (
        <div className={styles.fabContainer}>
          {user?.role !== "admin" && (
            <motion.button
              className={styles.fabButton}
              onClick={toggleForm}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IoMdAdd className={styles.fabIcon} />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostReviewCon;
