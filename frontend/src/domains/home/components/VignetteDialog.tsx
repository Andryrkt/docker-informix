// components/VignetteDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useVignette } from "@/context/VignetteContext";

export function VignetteDialog() {
  const { open, data, closeDialog } = useVignette();

  // Early return if no data – but we only render when open, so it's safe
  if (!data) return null;

  const hasSections = data.sections?.length;
  const hasItems = data.items?.length;

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-h-[80vh] max-w-[75%] overflow-clip overflow-y-auto bg-brand-dark">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex gap-2 text-white text-lg">
            {data.icon && (
              <FontAwesomeIcon icon={data.icon} className="size-10" />
            )}
            {data.title}
          </DialogTitle>
          {data.description && (
            <DialogDescription>{data.description}</DialogDescription>
          )}
          <div className="h-px bg-gray-600" />
        </DialogHeader>

        <div className="px-4">
          {/* Top-level quick-access items */}
          {hasItems && (
            <div className="flex w-full justify-between gap-2">
              {data.items!.map((item, j) => (
                <Link
                  key={j}
                  to={item.link ?? "#"}
                  onClick={closeDialog}
                  className="flex gap-2 px-3 py-3 text-brand-primary/75 hover:text-brand-primary"
                >
                  <FontAwesomeIcon icon={item.icon} className="size-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Section grid */}
          <div
            className={cn("grid w-full gap-8", {
              "grid-cols-1": data.sections?.length === 1,
              "grid-cols-1 md:grid-cols-2": data.sections?.length === 2,
              "grid-cols-1 md:grid-cols-3": data.sections?.length === 3,
              "grid-cols-1 md:grid-cols-3 lg:grid-cols-4":
                (data.sections?.length ?? 0) >= 4,
            })}
          >
            {data.sections?.map((section, i) => (
              <div key={i} className="flex flex-col gap-3 py-2">
                <div className="flex flex-col gap-1">
                  <div className="flex text-lg font-semibold text-muted-foreground uppercase gap-2">
                    <FontAwesomeIcon icon={section.icon} className="size-3" />
                    {section.title}
                  </div>
                  <div className="h-0.5 bg-brand-primary" />
                </div>
                <div className="flex flex-col">
                  {section.items.map((item, j) => (
                    <Link
                      key={j}
                      to={item.link ?? "#"}
                      onClick={closeDialog}
                      className="flex gap-2 px-2 py-2 text-brand-primary/75 hover:text-brand-primary"
                    >
                      <FontAwesomeIcon icon={item.icon} className="size-3" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
