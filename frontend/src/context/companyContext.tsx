import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface CompanyContextType {
  activeCompanyId: number | null;
  setActiveCompanyId: (id: number) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);
  return (
    <CompanyContext.Provider value={{ activeCompanyId, setActiveCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
