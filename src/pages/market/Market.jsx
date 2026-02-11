import Hero from "../../components/common/hero/Hero";
import CardsContainer from "../../components/common/cardsContainer/CardsContainer";
import { useProducts } from "../../redux/products/productsApis";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Market() {
  const { t } = useTranslation();
  const productsQuery = useProducts();
  const role = useSelector((state) => state.auth?.user?.role);

  const info = {
    isPending: productsQuery.isPending,
    error: productsQuery.error,
    categories: [
      { value: "all", label: t("allProducts") },
      { value: "Mouse", label: t("Mouse") },
      { value: "Keyboard", label: t("Keyboard") },
      { value: "cables", label: t("cables") },
      { value: "Mouse pad", label: t("MousePad") },
      { value: "Inks", label: t("InksAndCartridges") },
    ],
    defaultCategory: "all",
    cards: productsQuery.data ? shuffleArray(productsQuery.data) : [],
    type: "market",
  };

  if (role === "admin") return <Navigate to="/unauthorized" />;

  return (
    <>
      <Hero></Hero>
      <CardsContainer info={info} />
    </>
  );
}

export default Market;
