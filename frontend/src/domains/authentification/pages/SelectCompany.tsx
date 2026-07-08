import { Building2 } from "lucide-react";
import { useNavigate } from "react-router";

import LogoHff from "@/assets/logoHFF.jpg";
import { useAuth, type Company } from "@/context/authContext";

function SelectCompany() {
  const { user, selectCompany } = useAuth();
  const navigate = useNavigate();

  const companies: Company[] = user?.companies ?? [];

  const handleSelect = (company: Company) => {
    selectCompany(company);
    navigate("/");
  };

  return (
    <div className="bg-gray-400 w-full h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-lg border px-8 py-10 mx-auto bg-white shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={LogoHff} alt="HFF logo" className="max-w-60 object-contain" />
        </div>

        <h2 className="text-center text-lg font-semibold text-gray-700 mb-1">
          Sélection de la société
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Vous avez accès à plusieurs sociétés. Veuillez en choisir une pour continuer.
        </p>

        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="flex items-center gap-4 w-full border border-gray-200 rounded-md px-5 py-4 text-left hover:bg-blue-50 hover:border-blue-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <Building2 size={20} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">
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
