import { Link, Navigate, useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import logo from "../../assets/logo2.png";
import { ErrorMessage, Field, Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { signUpApi } from "../../redux/auth/authApis";
import { clearError } from "../../redux/auth/authSlice";
import { LoaderBtn } from "../../components/common/loadingSpinners/Loaders";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "",
    gender: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required(t("usernameRequired")),
    email: Yup.string()
      .email(t("invalidEmail"))
      .required(t("emailRequired")),
    password: Yup.string()
      .min(6, t("weakPassword"))
      .required(t("passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("passwordsMustMatch"))
      .required(t("reenterPassword")),
    phone: Yup.string()
      .matches(/^[0-9]{10,15}$/, t("invalidPhoneNumber"))
      .required(t("phoneRequired")),
    age: Yup.number()
      .min(13, t("minAgeRequirement"))
      .max(120, t("invalidAge"))
      .required(t("ageRequired")),
    gender: Yup.string()
      .oneOf(["male", "female", "other"], t("invalidGender"))
      .required(t("genderRequired")),
  });

  const onSubmit = async (values) => {
    try {
      const user = {
        username: values.username,
        email: values.email,
        password: values.password,
        phoneNumber: values.phone,
        age: values.age,
        gender: values.gender,
      };

      await dispatch(signUpApi(user)).unwrap();
      navigate("/market");
    } catch (error) {
      console.log(error);
    }
  };

  const goLoginHandler = () => {
    dispatch(clearError());
    navigate("/login");
  };

  if (isAuthenticated) return <Navigate to="/login" />;

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
          {({ values, setFieldValue }) => (
            <Form className={styles.form}>
              <h2>{t("createAccount")}</h2>

              {error && <p className={styles.error}>{error}</p>}

              <div>
                <label htmlFor="username">{t("fullname")}</label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  placeholder={t("enterUsername")}
                  autoComplete="username"
                />
                <ErrorMessage name="username" component="p" />
              </div>

              <div>
                <label htmlFor="email">{t("email")}</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t("enterEmail")}
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="p" />
              </div>

              <div>
                <label htmlFor="phone">{t("phoneNumber")}</label>
                <Field
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder={t("enterPhoneNumber")}
                  autoComplete="tel"
                />
                <ErrorMessage name="phone" component="p" />
              </div>

              <div className={styles["form-row"]}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="age">{t("age")}</label>
                  <Field
                    style={{ marginLeft: 15 }}
                    type="number"
                    name="age"
                    id="age"
                    placeholder={t("age")}
                    min="13"
                    max="120"
                  />

                  <ErrorMessage name="age" component="p" />
                </div>

                <div style={{ flex: 1 }}>
                  <label>{t("gender")}</label>
                  <div className={styles["radio-group"]}>
                    <div className={styles["radio-item"]}>
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="male"
                        checked={values.gender === "male"}
                        onChange={() => setFieldValue("gender", "male")}
                      />
                      <label htmlFor="male">{t("male")}</label>
                    </div>
                    <div className={styles["radio-item"]}>
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="female"
                        checked={values.gender === "female"}
                        onChange={() => setFieldValue("gender", "female")}
                      />
                      <label htmlFor="female">{t("female")}</label>
                    </div>
                    <div className={styles["radio-item"]}>
                      <input
                        type="radio"
                        id="other"
                        name="gender"
                        value="other"
                        checked={values.gender === "other"}
                        onChange={() => setFieldValue("gender", "other")}
                      />
                      <label htmlFor="other">{t("other")}</label>
                    </div>
                  </div>
                  <ErrorMessage name="gender" component="p" />
                </div>
              </div>

              <div>
                <label htmlFor="password">{t("password")}</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  placeholder={t("enterPassword")}
                  autoComplete="new-password"
                />
                <ErrorMessage name="password" component="p" />
              </div>

              <div>
                <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder={t("confirmPassword")}
                  autoComplete="new-password"
                />
                <ErrorMessage name="confirmPassword" component="p" />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? <LoaderBtn /> : t("createAccount")}
              </button>

              <p>
                {t("termsAgreementEyeCare", { siteName: t("siteName") })}
              </p>

              <div className={styles.divider}>{t("or")}</div>

              <p>{t("alreadyHaveAccount")}</p>

              <button onClick={goLoginHandler} type="button">
                {t("loginToYourAccount")}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;