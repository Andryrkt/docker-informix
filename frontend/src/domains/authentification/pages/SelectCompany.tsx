import { Building2 } from "lucide-react";
import { useNavigate } from "react-router";

import LogoHff from "@/assets/logoHFF.jpg";
import { useAuth, type Company } from "@/context/authContext";
import i18n from "@/i18n";
import { t } from "i18next";
import { Button } from "@/components/ui/button";

function SelectCompany() {
  const { user, selectCompany } = useAuth();
  const navigate = useNavigate();

  const companies: Company[] = user?.companies ?? [];

  const handleSelect = (company: Company) => {
    selectCompany(company);
    navigate("/");
  };
  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(nextLang);
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={toggleLanguage}
          className=" flex items-center justify-center bg-transparent hover:bg-transparent drop-shadow-xl hover:text-brand-primary focus:text-brand-primary"
          aria-label={t("common:changer-la-langue")}
        >
          <span className=" uppercase  ">{i18n.language}</span>
        </Button>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/office.jpeg')] bg-cover bg-center blur-xs" />
        <div className="absolute inset-0 bg-black/35" />
      </div>
      <div className="w-full max-w-md border px-8 py-10 mx-auto bg-white shadow-2xl/50 shadow-black rounded-md  z-10  relative">
        <div className="flex justify-center mb-6">
          <img
            src={LogoHff}
            alt="HFF logo"
            className="max-w-60 object-contain"
          />
        </div>

        <h2 className="text-center text-lg font-semibold text-gray-700 mb-1">
          Sélection de la société
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Vous avez accès à plusieurs sociétés. Veuillez en choisir une pour
          continuer.
        </p>

        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="flex items-center gap-4 w-full border border-gray-200 rounded-md px-5 py-4 text-left hover:bg-brand-primary/10 hover:border-brand-primary transition-colors group focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-primary transition-colors">
                <Building2
                  size={20}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-dark  transition-colors truncate">
                  {company.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{company.code}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectCompany;
