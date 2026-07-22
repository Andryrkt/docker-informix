import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { ModalData } from "@/domains/home/components/VignetteModal"; // adjust path

interface VignetteContextValue {
  open: boolean;
  data: ModalData | null;
  openDialog: (payload: ModalData) => void;
  closeDialog: () => void;
}

const VignetteContext = createContext<VignetteContextValue | undefined>(
  undefined,
);

export const VignetteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ModalData | null>(null);

  const openDialog = (payload: ModalData) => {
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
    <VignetteContext.Provider value={value}>
      {children}
    </VignetteContext.Provider>
  );
};

export const useVignette = () => {
  const context = useContext(VignetteContext);
  if (!context) {
    throw new Error("useVignette must be used within a VignetteProvider");
  }
  return context;
};
