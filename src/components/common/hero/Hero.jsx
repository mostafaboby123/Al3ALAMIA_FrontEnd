import styles from "./hero.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Hero({ children }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      {/* Floating Background Elements */}
      <div className={styles.floatingBackground}>
        <div className={`${styles.floatingCircle} ${styles.circleAmber}`}></div>
        <div
          className={`${styles.floatingCircle} ${styles.circleEmerald}`}
        ></div>
        <div className={`${styles.floatingCircle} ${styles.circleRose}`}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.heroGrid}>
          {/* Left Content */}
          <div className={styles.heroContent}>
            {/* Title */}
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleGradientEmerald}>
                {t("discover")}{" "}
              </span>
              <span className={styles.heroTitleGradient}>
                {t("computerAccessories")}
              </span>{" "}
              <span>&</span>{" "}
              <span className={styles.heroTitleGradientEmerald}>
                {t("Inks")}
              </span>
              <br />
              <span className={styles.heroTitleGradientAL3ALAMIA}>
                {t("siteName")}
              </span>
            </h1>
          </div>

          {/* Right Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.cardContainer}>
              {/* Glow Effect */}
              <div className={styles.cardGlow}></div>

              {/* Main Card */}
              <div className={styles.mainCard}>
                <img src="/logo2.png" alt={t("siteName")} />
                <div className={styles.cardContent}>
                </div>
              </div>

              {/* Accent Circles */}
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

        {/* Custom children content if needed */}
        {children}
      </div>

      {/* Floating Action Button */}
      <div className={styles.floatingActionButton}>
        <button
          className={styles.fabButton}
          onClick={() => navigate("/cart")}
          title={t("goToCart")}
        >
          <svg
            className={styles.fabIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default Hero;
