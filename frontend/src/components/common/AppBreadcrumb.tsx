import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VIGNETTES } from "@/domains/home/schema/vignette";

import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useVignetteDialog } from "@/domains/home/components/VignetteModal";
import { Button } from "../ui/button";
import { vignetteMock } from "@/domains/home/schema/vignetteMock";
import { VignetteCard } from "@/domains/home/components/VignetteCard";

type Item = {
  title: string;
  link?: string;
  icon?: string;
  is_active?: boolean;
};

export function AppBreadcrumb({ items }: { items: Item[] }) {
  const { openDialog, VignetteDialogComponent } = useVignetteDialog();

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = item.is_active || index === items.length - 1;

            return (
              <div key={index} className="flex items-center">
                {index !== 0 && <BreadcrumbSeparator />}

                <BreadcrumbItem>
                  {/* 🏠 FIRST BREADCRUMB (Accueil) WITH DROPDOWN */}
                  {index === 0 ? (
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <BreadcrumbLink className="font-semibold cursor-pointer">
                          <Link to={"/"}> {item.title}</Link>
                        </BreadcrumbLink>
                      </HoverCardTrigger>

                      <HoverCardContent className="w-56 p-2 ml-6 mt-2">
                        <div className="flex flex-col gap-1">
                          {vignetteMock.map((item) => {
                            const Icon = item.icon;

                            return (
                              <Button onClick={() => openDialog(item.modal)}>
                                {item.title}
                              </Button>
                            );
                          })}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : isLast || !item.link ? (
                    <BreadcrumbPage className="font-semibold">
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <VignetteDialogComponent />
    </>
  );
}
