import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/authContext";

const WELCOME_DISMISSED_KEY = "welcomeDismissed";

export function WelcomeDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    }
    setOpen(false);
  };

  if (!user) return null;

  const fullName = user.username || "Utilisateur";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden p-6" // hide close button
        onInteractOutside={(e) => e.preventDefault()}
        // onEscapeKeyDown={(e) => e.preventDefault()} // prevent Esc
        onOpenAutoFocus={(e) => {
          // Prevent the default focus (on first focusable element)
          e.preventDefault();
          // Focus our confirm button
          confirmButtonRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            Bienvenue{" "}
            <Link
              to="/profile"
              className="text-primary hover:underline font-bold"
              onClick={() => setOpen(false)}
            >
              {fullName}
            </Link>{" "}
            👋 !
          </DialogTitle>
          <DialogDescription className="space-y-2 text-base text-gray-700">
            <p>Ravi de vous revoir !</p>
            <p>
              Pour bien démarrer, pensez à consulter le{" "}
              <a
                href="/guide"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
                onClick={() => setOpen(false)}
              >
                Guide utilisateur intranet
              </a>{" "}
              en cliquant sur Guide utilisateur intranet situé en haut de la
              page.
            </p>
            <p className="text-sm text-gray-500">
              NB : Veuillez appuyer sur Ctrl + F5 avant de commencer à naviguer.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Ne plus afficher ce message
            </label>
          </div>
          <Button
            data-autofocus
            ref={confirmButtonRef}
            onClick={handleClose}
            className="w-full p-6"
            variant="brand"
          >
            OK, j’ai compris
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
