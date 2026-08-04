import type { ModuleModal } from "@/domains/home/schema/moduleItems";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

interface ModuleContextValue {
  open: boolean;
  data: ModuleModal | null;
  openDialog: (payload: ModuleModal) => void;
  closeDialog: () => void;
}

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ModuleModal | null>(null);

  const openDialog = (payload: ModuleModal) => {
    setData(payload);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const value = useMemo(
    () => ({ open, data, openDialog, closeDialog }),
    [open, data],
  );

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useVignette must be used within a VignetteProvider");
  }
  return context;
};
