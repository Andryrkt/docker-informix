import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "info" | "password" | "form";
  icon?: React.ReactNode;
  onConfirm?: (password?: string) => void | Promise<void>;
  onCancel?: () => void;
  renderContent?: () => React.ReactNode;
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<string | boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error(
      "useConfirm must be used within ConfirmationDialogProvider",
    );
  }
  return context;
}

export function ConfirmationDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    (value: string | boolean) => void
  >(() => {});
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const confirm: ConfirmFn = (opts = {}) => {
    setOptions(opts);
    setPassword("");
    setIsLoading(false);
    setVisible(true);
    return new Promise<string | boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (options.variant === "password") {
        await options.onConfirm?.(password);
        resolvePromise(password);
      } else {
        await options.onConfirm?.();
        resolvePromise(true);
      }
      setVisible(false);
    } catch {
      // On garde le dialog ouvert en cas d'erreur
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resolvePromise(false);
    options.onCancel?.();
    setVisible(false);
  };

  const {
    title = "Êtes-vous sûr ?",
    description = "",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    icon,
    variant = "default",
  } = options;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={visible} onOpenChange={setVisible}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              {icon}
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {description}
              {variant === "password" && (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="mt-2"
                  autoComplete="off"
                />
              )}
              {variant === "form" && options.renderContent && (
                <div className="mt-2">{options.renderContent()}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-none"
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "rounded-none flex items-center justify-center gap-2",
                variant === "destructive" &&
                  "bg-red-600 hover:bg-red-700 text-white",
                variant === "info" &&
                  "bg-blue-600 hover:bg-blue-700 text-white",
                variant === "password" &&
                  "bg-global-primary/90 hover:bg-global-primary text-white",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  En cours...
                </>
              ) : (
                confirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
