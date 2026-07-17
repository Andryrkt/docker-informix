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

type Item = {
  labelKey: string;
  label: string; // fallback if key missing
  link?: string;
  icon: React.ElementType;
};

type Section = {
  titleKey: string;
  title?: string; // fallback
  icon: React.ElementType;
  items: Item[];
};

export type ModalData = {
  titleKey: string;
  title: string; // fallback
  description?: string;
  icon: React.ElementType;
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
      <DialogContent className="max-h-[80vh] max-w-[75%] overflow-clip overflow-y-auto bg-brand-dark px-10 py-10">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex items-center gap-2 text-white">
            {data?.icon && <data.icon className="size-8" />}
            {data ? data.title : null}
          </DialogTitle>
          {data?.description && (
            <DialogDescription>{data.description}</DialogDescription>
          )}
        </DialogHeader>

        <div>
          {/* Top-level quick-access items (e.g. Documentation) */}
          {hasItems && (
            <div className="flex w-full justify-between gap-2">
              {data?.items!.map((item, j) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={j}
                    to={item.link ?? "#"}
                    className="flex items-center gap-2 px-3 py-3 text-brand-primary/75 hover:text-brand-primary"
                  >
                    {ItemIcon && <ItemIcon className="size-4" />}
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
              const SectionIcon = section.icon;

              return (
                <div key={i} className="flex flex-col gap-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase">
                    <SectionIcon className="size-4" />
                    {section.title}
                  </div>

                  <div className="flex flex-col">
                    {section.items.map((item, j) => {
                      const ItemIcon = item.icon;

                      return (
                        <Link
                          key={j}
                          to={item.link ?? "#"}
                          className="flex items-center gap-2 px-2 py-2 text-brand-primary/75 hover:text-brand-primary"
                        >
                          {ItemIcon && <ItemIcon className="size-3" />}
                          {item.label}
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
