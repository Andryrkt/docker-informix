import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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

type Item = {
  label: string;
  link: string;
  icon: React.ElementType;
};

type Section = {
  title: string;
  icon: React.ElementType;
  items: Item[];
};

type ModalData = {
  title: string;
  description: string;
  icon: React.ElementType;
  sections: Section[];
};

export function useVignetteDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ModalData | null>(null);

  const openDialog = (payload: ModalData) => {
    setData(payload);
    setOpen(true);
  };

  const VignetteDialogComponent = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] max-w-[75%] overflow-clip overflow-y-auto bg-brand-dark px-10 py-10">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex items-center gap-2 text-white">
            {data?.icon && <data.icon className="size-8" />}
            {data?.title}
          </DialogTitle>
          <DialogDescription>{data?.description}</DialogDescription>
        </DialogHeader>

        <Accordion
          type="multiple"
          className={cn("grid w-full gap-8", {
            "grid-cols-1": data?.sections.length === 1,
            "grid-cols-1 md:grid-cols-2": data?.sections.length === 2,
            "grid-cols-1 md:grid-cols-3": data?.sections.length === 3,
            "grid-cols-1 md:grid-cols-3 lg:grid-cols-4":
              data?.sections.length >= 4,
          })}
          defaultValue={data?.sections?.map((_, i) => `section-${i}`)}
        >
          {data?.sections?.map((section, i) => {
            const SectionIcon = section.icon;

            return (
              <div className="">
                <AccordionItem key={i} value={`section-${i}`}>
                  {/* Trigger */}
                  <AccordionTrigger className="flex items-center gap-4 text-sm font-medium text-muted-foreground hover:no-underline uppercase">
                    <SectionIcon className="size-4" />
                    {section.title}
                  </AccordionTrigger>

                  {/* Content */}
                  <AccordionContent className="">
                    <div className="">
                      {section.items.map((item, j) => {
                        const ItemIcon = item.icon;

                        return (
                          <Link
                            key={j}
                            to={item.link}
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-4 text-brand-primary/75 hover:text-brand-primary focus-within:text-brand-primary "
                          >
                            {ItemIcon && <ItemIcon className="size-3" />}
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            );
          })}
        </Accordion>
      </DialogContent>
    </Dialog>
  );

  return { openDialog, VignetteDialogComponent };
}
