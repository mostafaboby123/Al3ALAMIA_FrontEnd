import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/auth/authSlice";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { MdLanguage } from "react-icons/md";

function Header() {
  const [activeMenu, setActiveMenu] = useState(false);
  const [activeCart, setActiveCart] = useState(false);
  const [activeAuthMenu, setActiveAuthMenu] = useState(false);

  const { t } = useTranslation();

  const changeLang = (lang) => {``
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    toggleAll(); // Close any open menus
  };

  const navigate = useNavigate();

  const toggleMenu = () => {
    setActiveMenu((prev) => !prev);
    setActiveCart(false);
    setActiveAuthMenu(false);
  };

  const toggleCart = () => {
    navigate("/cart");
  };

  const toggleAuthMenu = () => {
    setActiveAuthMenu((prev) => !prev);
    setActiveCart(false);
    setActiveMenu(false);
  };

  const toggleAll = () => {
    setActiveAuthMenu(false);
    setActiveCart(false);
    setActiveMenu(false);
  };

  const handleProfileButton = () => {
    toggleAll();
    switch (authData?.user?.role) {
      case "client":
        navigate("/profile");
        break;
      case "admin":
        navigate("/adminProfile");
        break;
    }
  };

  const cartData = useSelector((state) => state.auth?.user?.cartInfo);
  const authData = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  let roleCheck = authData?.user?.role;
  if (typeof roleCheck === "undefined") {
    roleCheck = "gest";
  }

  const navStyle = ({ isActive }) =>
    isActive ? `${styles.activeNavLink}` : "navLink";

  const logoutHandler = () => {
    setActiveMenu(false);
    dispatch(logout());
    navigate("/login");
  };

  const navLInks = [
    {
      path: `/${authData?.user?.role === "admin" ? "market_management" : "market"}`,
      label: t("market"),
      icon: <FaShoppingBag className="w-5 h-5" />,
      users: ["client", "admin", "gest"],
    },
  ];

  return (
    <header className={`${styles.header}`}>
      <div
        onClick={toggleAll}
        className={`overlay ${activeMenu || activeCart || activeAuthMenu ? `active ${styles.active}` : ""}`}
      ></div>
      <div
        className={`container ${styles.container} ${authData?.isAuthenticated ? styles.isAuth : ""}`}
      >
        <nav className={styles.nav}>
          <Link to="/home">
            <div className={styles.logoText} onClick={toggleAll}>
              {t("siteName")}    
            </div>
          </Link>

          <ul
            className={`${styles.headerList} ${activeMenu ? styles.active : ""}`}
          >
            {navLInks.map(
              (link, index) =>
                link.users.includes(roleCheck) && (
                  <li key={index}>
                    <NavLink
                      to={link.path}
                      onClick={toggleAll}
                      className={navStyle}
                    >
                      <span className={styles.navIcon}>{link.icon}</span>{" "}
                      {link.label}
                    </NavLink>
                  </li>
                ),
            )}
          </ul>

          <div className={styles.headerAuthContainer}>
            {/* Language Switcher */}
            <div className={styles.languageSwitcher}>
              <button
                onClick={() => changeLang(i18n.language === "en" ? "ar" : "en")}
                className={styles.langBtn}
                title={i18n.language === "en" ? t("switchToArabic") : t("switchToEnglish")}
              >
                <MdLanguage className={styles.langIcon} />
                <span className={styles.langText}>
                  {i18n.language === "en" ? "العربية" : "EN"}
                </span>
              </button>
            </div>

            {authData?.isAuthenticated && authData?.user?.role === "client" && (
              <div className={styles.headerCart}>
                <button onClick={toggleCart}>
                  <span className={styles.cartIconCon}>
                    🛒
                    <span className={styles.cartNum}>
                      {cartData.cart.length}
                    </span>
                  </span>{" "}
                  <span className={styles.label}>{t("myCart")}</span>
                </button>
              </div>
            )}

            <div className={styles.headerAuth}>
              <button onClick={toggleAuthMenu}>
                {authData?.isAuthenticated ? (
                  <span>
                    <span className={styles.label}>{t("hi")}</span>{" "}
                    {authData.user.username || authData.user.fullname}
                  </span>
                ) : (
                  t("account")
                )}{" "}
                <MdKeyboardArrowDown
                  className={activeAuthMenu ? styles.up : ""}
                />
              </button>

              <ul
                className={`${styles.innerAuth} ${activeAuthMenu ? styles.active : ""}`}
              >
                {authData?.isAuthenticated ? (
                  <>
                    <li>
                      <button onClick={handleProfileButton}>
                        👤 {t("profile")}
                      </button>
                    </li>
                    <li>
                      <button onClick={logoutHandler}>
                        🔒 {t("logout")}
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button onClick={() => navigate("/login")}>
                        🔑 {t("login")}
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navigate("/sign_up")}>
                        📝 {t("signup")}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <button
            onClick={toggleMenu}
            className={`${styles.ul_icon} ${activeMenu ? styles.active : ""}`}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;