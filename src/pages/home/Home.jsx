import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaChevronRight,
  FaUser,
  FaPrint,
  FaShoppingCart,
  FaTruck,
  FaGift,
  FaLeaf,
  FaGem,
} from "react-icons/fa";
import styles from "./home.module.css";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const [selectedReview, setSelectedReview] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigateToMarket = () => {
    navigate("/market");
  };

  const reviews = [
    {
      name: t("reviewerAhmedName"),
      review: t("reviewerAhmedText"),
      stars: 5,
      profession: t("reviewerAhmedProfession"),
    },
    {
      name: t("reviewerMonaName"),
      review: t("reviewerMonaText"),
      stars: 5,
      profession: t("reviewerMonaProfession"),
    },
    {
      name: t("reviewerOmarName"),
      review: t("reviewerOmarText"),
      stars: 5,
      profession: t("reviewerOmarProfession"),
    },
  ];

  const services = [
    {
      icon: <FaShoppingCart className={styles.serviceIcon} />,
      title: t("serviceRetailWholesaleTitle"),
      description: t("serviceRetailWholesaleDesc"),
      color: styles.gradientAmber,
      iconBg: styles.iconBgAmber,
    },
    {
      icon: <FaLeaf className={styles.serviceIcon} />,
      title: t("serviceProductVarietyTitle"),
      description: t("serviceProductVarietyDesc"),
      color: styles.gradientEmerald,
      iconBg: styles.iconBgEmerald,
    },
    {
      icon: <FaGift className={styles.serviceIcon} />,
      title: t("serviceOriginalInksTitle"),
      description: t("serviceOriginalInksDesc"),
      color: styles.gradientRose,
      iconBg: styles.iconBgRose,
    },
    {
      icon: <FaTruck className={styles.serviceIcon} />,
      title: t("serviceFastDeliveryTitle"),
      description: t("serviceFastDeliveryDesc"),
      color: styles.gradientBlue,
      iconBg: styles.iconBgBlue,
    },
  ];

  const workSteps = [
    {
      step: 1,
      title: t("stepCreateAccountTitle"),
      description: t("stepCreateAccountDesc"),
      icon: <FaUser className={styles.stepIcon} />,
      delay: "0s",
    },
    {
      step: 2,
      title: t("stepBrowseProductsTitle"),
      description: t("stepBrowseProductsDesc"),
      icon: <FaPrint className={styles.stepIcon} />,
      delay: "0.2s",
    },
    {
      step: 3,
      title: t("stepSelectItemsTitle"),
      description: t("stepSelectItemsDesc"),
      icon: <FaShoppingCart className={styles.stepIcon} />,
      delay: "0.4s",
    },
    {
      step: 4,
      title: t("stepFastDeliveryTitle"),
      description: t("stepFastDeliveryDesc"),
      icon: <FaTruck className={styles.stepIcon} />,
      delay: "0.6s",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Floating Background Elements */}
      <div className={styles.floatingBackground}>
        <div className={`${styles.floatingCircle} ${styles.circleAmber}`}></div>
        <div
          className={`${styles.floatingCircle} ${styles.circleEmerald}`}
        ></div>
        <div className={`${styles.floatingCircle} ${styles.circleRose}`}></div>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <FaGem className={styles.badgeIcon} />
                {t("premiumComputerAccessoriesCollection")}
              </div>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleGradient}>
                  {t("discover")}
                </span>
                <br />
                <span className={styles.heroTitleGradientEmerald}>
                  {t("computerAccessories")}
                </span>{" "}
                <span>&</span>{" "}
                <span className={styles.heroTitleGradient}>{t("Inks")}</span>
                <br />
                <span>{t("at")}</span>{" "}
                <span className={styles.heroTitleGradientAL3ALAMIA}>
                  {t("siteName")}
                </span>
              </h1>
              <p className={styles.heroDescription}>
                {t("heroTrustedSourceDescription")}
              </p>
              <div className={styles.heroButtons}>
                <button
                  className={styles.exploreButton}
                  onClick={handleNavigateToMarket}
                >
                  <span className={styles.buttonContent}>
                    {t("exploreCollection")}{" "}
                    <FaChevronRight className={styles.buttonIcon} />
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.heroImage}>
              <div className={styles.cardContainer}>
                <div
                  className={styles.mainCard}
                  style={{ transform: `translateY(${scrollY * 0.02}px)` }}
                >
                  <div className={styles.cardGlow}></div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardIconContainer}>
                      {t("siteName")}
                    </div>
                    <div className={styles.cardTitle}>
                      {t("welcomeToSite", { site: t("siteName") })}
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardInfoLabel}>{t("Since")}</div>
                      <div className={styles.cardInfoYear}>2024</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.accentCircle} ${styles.accentRose}`}
                ></div>
                <div
                  className={`${styles.accentCircle} ${styles.accentBlue}`}
                ></div>
                <div
                  className={`${styles.accentCircle} ${styles.accentPurple}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.worksSection}>
        <div className={styles.worksContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>{t("simpleProcess")}</div>
            <h2 className={styles.sectionTitle}>
              {t("howIt")}{" "}
              <span className={styles.sectionTitleGradient}>{t("works")}</span>
            </h2>
            <p className={styles.sectionDescription}>
              {t("experienceShoppingInFourSteps")}
            </p>
          </div>

          <div className={styles.worksGrid}>
            {workSteps.map((step, index) => (
              <div
                key={index}
                className={styles.workStep}
                style={{ animationDelay: step.delay }}
              >
                {index < workSteps.length - 1 && (
                  <div className={styles.connectionLine}></div>
                )}
                <div className={styles.stepContent}>
                  <div className={styles.stepIconContainer}>
                    <div className={styles.stepIcon}>{step.icon}</div>
                  </div>
                  <div className={styles.stepNumber}>{step.step}</div>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadgeAmber}>
              {t("premiumServices")}
            </div>
            <h2 className={styles.sectionTitle}>
              {t("our")}{" "}
              <span className={styles.sectionTitleGradientEmerald}>
                {t("services")}
              </span>
            </h2>
            <p className={styles.sectionDescription}>
              {t("elevatingYourShoppingExperience")}
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div
                key={index}
                className={`${styles.serviceCard} ${service.color}`}
              >
                <div className={styles.serviceCardOverlay}></div>
                <div className={styles.serviceContent}>
                  <div
                    className={`${styles.serviceIconContainer} ${service.iconBg}`}
                  >
                    {service.icon}
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>
                  <div className={styles.serviceLink}>
                    {t("learnMore")}{" "}
                    <FaChevronRight className={styles.serviceLinkIcon} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadgeWhite}>
              {t("customerStories")}
            </div>
            <h2 className={styles.sectionTitleWhite}>
              {t("whatOur")}{" "}
              <span className={styles.sectionTitleGradientAmber}>
                {t("clientsSay")}
              </span>
            </h2>
          </div>

          <div className={styles.reviewsGrid}>
            <div className={styles.reviewsList}>
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`${styles.reviewItem} ${
                    selectedReview === index ? styles.reviewItemActive : ""
                  }`}
                  onClick={() => setSelectedReview(index)}
                >
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}>
                      <FaUser className={styles.reviewAvatarIcon} />
                    </div>
                    <div className={styles.reviewInfo}>
                      <h4 className={styles.reviewName}>{review.name}</h4>
                      <p className={styles.reviewProfession}>
                        {review.profession}
                      </p>
                    </div>
                    <div
                      className={`${styles.reviewIndicator} ${
                        selectedReview === index
                          ? styles.reviewIndicatorActive
                          : ""
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.reviewContent}>
              <div className={styles.reviewCard}>
                <div className={styles.reviewQuote}>"</div>
                <p className={styles.reviewText}>
                  {reviews[selectedReview].review}
                </p>
                <div className={styles.reviewStars}>
                  {[...Array(reviews[selectedReview].stars)].map((_, i) => (
                    <FaStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <div className={styles.reviewAuthor}>
                  — {reviews[selectedReview].name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadgeStone}>{t("getInTouch")}</div>
            <h2 className={styles.sectionTitle}>{t("contactUs")}</h2>
            <p className={styles.sectionDescription}>
              {t("connectWithOurExperts")}
            </p>
          </div>

          <div className={styles.contactForm}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder={t("yourName")}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder={t("yourEmail")}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder={t("yourMessage")}
                rows="6"
                className={styles.formTextarea}
              ></textarea>
            </div>
            <button type="button" className={styles.formButton}>
              <span className={styles.buttonContent}>
                {t("sendMessage")}{" "}
                <FaChevronRight className={styles.buttonIcon} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className={styles.footerSection}>
        <div className={styles.footerContainer}>
          <h2 className={styles.footerTitle}>
            {t("everythingYouNeedFor")}{" "}
            <span className={styles.footerTitleGradient}>
              {t("computersAndPrinting")}
            </span>
          </h2>

          <p className={styles.footerDescription}>
            {t("shopAccessoriesAndInksDescription")}
          </p>

          <div className={styles.footerButtons}>
            <button
              className={styles.startShoppingButton}
              onClick={handleNavigateToMarket}
            >
              <span className={styles.buttonContent}>
                {t("startShopping")}{" "}
                <FaShoppingCart className={styles.buttonIcon} />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
