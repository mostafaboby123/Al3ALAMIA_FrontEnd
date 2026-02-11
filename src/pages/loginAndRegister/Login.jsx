import { Link, Navigate, useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import logo from "../../assets/logo2.png";
import { ErrorMessage, Field, Formik, Form } from "formik";
import * as Yup from "yup";
import { loginApi } from "../../redux/auth/authApis";
import { useDispatch, useSelector } from "react-redux";
import { clearError } from "../../redux/auth/authSlice";
import { LoaderBtn } from "../../components/common/loading spinners/Loaders";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const initialValues = { email: "", password: "" };
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("invalidEmail"))
      .required(t("emailRequired")),
    password: Yup.string().required(t("passwordRequired")),
  });

  const onSubmit = async (values) => {
    try {
      const user = { email: values.email, password: values.password };
      const response = await dispatch(loginApi(user)).unwrap();

      switch (response.user.role) {
        case "client":
          navigate("/profile");
          break;
        case "admin":
          navigate("/adminProfile");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goRegisterHandler = () => {
    dispatch(clearError());
    navigate("/sign_up");
  };

  if (isAuthenticated) return <Navigate to="/market" />;

  return (
    <div className={styles.login}>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>

      <div className={`container ${styles.container}`}>
        <Link to="/">
          <img src={logo} alt={t("siteName")} className={styles.logo} />
        </Link>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form className={styles.form}>
            <h2>{t("welcomeBack")}</h2>

            {error && <p className={styles.error}>{error}</p>}

            <div>
              <label htmlFor="email">{t("email")}</label>
              <Field
                type="email"
                name="email"
                id="email"
                placeholder={t("enterYourEmail")}
                autoComplete="email"
              />
              <ErrorMessage name="email" component="p" />
            </div>

            <div>
              <label htmlFor="password">{t("password")}</label>
              <Field
                type="password"
                name="password"
                id="password"
                placeholder={t("enterYourPassword")}
                autoComplete="current-password"
              />
              <ErrorMessage name="password" component="p" />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <LoaderBtn /> : t("login")}
            </button>

            <p>
              {t("termsAgreement", { siteName: t("siteName") })}
            </p>

            <div className={styles.divider}>{t("or")}</div>

            <p>{t("noAccountYet")}</p>

            <button onClick={goRegisterHandler} type="button">
              {t("createNewAccount")}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default Login;