import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ModuleModal } from "../schema/moduleItems";

export function useVignetteDialog() {
  const [open, setOpen] = useState(false);
  const [modulModal, setModuleModal] = useState<ModuleModal | null>(null);

  const openDialog = (payload: ModuleModal) => {
    setModuleModal(payload);
    setOpen(true);
  };

  const hasItems = modulModal?.Menu?.length;

  const ModuleDialogComponent = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] max-w-[75%] overflow-clip overflow-y-auto bg-brand-dark ">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex gap-2 text-white text-lg">
            {modulModal?.icon && (
              <FontAwesomeIcon icon={modulModal?.icon} className="size-10" />
            )}
            {modulModal ? modulModal.titre : null}
          </DialogTitle>
          {modulModal?.description && (
            <DialogDescription>{modulModal.description}</DialogDescription>
          )}
          <div className="h-px bg-gray-600 "></div>
        </DialogHeader>

        <div className="px-4">
          {/* Top-level quick-access items (e.g. Documentation) */}
          {hasItems && (
            <div className="flex w-full justify-between gap-2">
              {modulModal?.sousMenu!.map((sousMenu, j) => {
                return (
                  <Link
                    key={j}
                    to={sousMenu.lien ?? "#"}
                    className="flex  gap-2 px-3 py-3 text-brand-primary/75 hover:text-brand-primary"
                  >
                    {sousMenu.icon && (
                      <FontAwesomeIcon
                        icon={sousMenu.icon}
                        className="size-4 "
                      />
                    )}
                    {sousMenu.titreSousMenu}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Section grid */}
          <div
            className={cn("grid w-full gap-8", {
              "grid-cols-1": modulModal?.Menu?.length === 1,
              "grid-cols-1 md:grid-cols-2": modulModal?.Menu?.length === 2,
              "grid-cols-1 md:grid-cols-3": modulModal?.Menu?.length === 3,
              "grid-cols-1 md:grid-cols-3 lg:grid-cols-4":
                (modulModal?.Menu?.length ?? 0) >= 4,
            })}
          >
            {modulModal?.Menu?.map((menu, i) => {
              return (
                <div key={i} className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex text-lg font-semibold text-zinc-500  uppercase gap-2">
                      <FontAwesomeIcon icon={menu.icon} className="size-3 " />
                      {menu.titreMenu}
                    </div>
                    {menu.titreMenu && (
                      <div className="h-0.5 bg-brand-primary "></div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    {menu.sousMenu?.map((sousMenu, j) => {
                      return (
                        <Link
                          key={j}
                          to={sousMenu.lien ?? "#"}
                          className="flex  gap-2 px-2 py-2 text-brand-primary/75 hover:text-brand-primary group hover:bg-brand-primary/10 rounded-md"
                        >
                          <FontAwesomeIcon
                            icon={sousMenu.icon}
                            className="size-3 transition-transform duration-300 group-hover:translate-x-2 text-zinc-500   "
                          ></FontAwesomeIcon>
                          <span className="transition-transform duration-300 group-hover:translate-x-2">
                            {sousMenu.titreSousMenu}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { openDialog, VignetteDialogComponent: ModuleDialogComponent };
}
