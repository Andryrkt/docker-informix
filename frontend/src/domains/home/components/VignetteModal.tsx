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
import { useTranslation } from "react-i18next";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Item = {
  labelKey: string;
  label: string; // fallback if key missing
  link?: string;
  icon: IconDefinition;
};

type Section = {
  titleKey: string;
  title?: string; // fallback
  icon: IconDefinition;
  items: Item[];
};

export type ModalData = {
  titleKey: string;
  title: string; // fallback
  description?: string;
  icon: IconDefinition;
  sections?: Section[];
  items?: Item[];
};

export function useVignetteDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ModalData | null>(null);

  const openDialog = (payload: ModalData) => {
    setData(payload);
    setOpen(true);
  };

  const hasSections = data?.sections?.length;
  const hasItems = data?.items?.length;

  const VignetteDialogComponent = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] max-w-[75%] overflow-clip overflow-y-auto bg-brand-dark ">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex gap-2 text-white text-lg">
            {data?.icon && (
              <FontAwesomeIcon icon={data?.icon} className="size-10" />
            )}
            {data ? data.title : null}
          </DialogTitle>
          {data?.description && (
            <DialogDescription>{data.description}</DialogDescription>
          )}
          <div className="h-px bg-gray-600 "></div>
        </DialogHeader>

        <div className="px-4">
          {/* Top-level quick-access items (e.g. Documentation) */}
          {hasItems && (
            <div className="flex w-full justify-between gap-2">
              {data?.items!.map((item, j) => {
                return (
                  <Link
                    key={j}
                    to={item.link ?? "#"}
                    className="flex  gap-2 px-3 py-3 text-brand-primary/75 hover:text-brand-primary"
                  >
                    <FontAwesomeIcon icon={item.icon} className="size-4 " />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Section grid */}
          <div
            className={cn("grid w-full gap-8", {
              "grid-cols-1": data?.sections?.length === 1,
              "grid-cols-1 md:grid-cols-2": data?.sections?.length === 2,
              "grid-cols-1 md:grid-cols-3": data?.sections?.length === 3,
              "grid-cols-1 md:grid-cols-3 lg:grid-cols-4":
                (data?.sections?.length ?? 0) >= 4,
            })}
          >
            {data?.sections?.map((section, i) => {
              return (
                <div key={i} className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex text-lg font-semibold text-zinc-500  uppercase gap-2">
                      <FontAwesomeIcon
                        icon={section.icon}
                        className="size-3 "
                      />
                      {section.title}
                    </div>
                    <div className="h-0.5 bg-brand-primary "></div>
                  </div>

                  <div className="flex flex-col">
                    {section.items.map((item, j) => {
                      return (
                        <Link
                          key={j}
                          to={item.link ?? "#"}
                          className="flex  gap-2 px-2 py-2 text-brand-primary/75 hover:text-brand-primary group hover:bg-brand-primary/10 rounded-md"
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="size-3 transition-transform duration-300 group-hover:translate-x-2 text-zinc-500   "
                          ></FontAwesomeIcon>
                          <span className="transition-transform duration-300 group-hover:translate-x-2">
                            {item.label}
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

  return { openDialog, VignetteDialogComponent };
}
