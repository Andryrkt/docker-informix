import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Link, useLocation } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useVignetteDialog } from "@/domains/home/components/VignetteModal";
import { Button } from "../ui/button";
import { vignetteMock } from "@/domains/home/schema/vignetteMock";
import { formatLabel } from "@/lib/utils";

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const { openDialog, VignetteDialogComponent } = useVignetteDialog();

  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return;
  }
  const breadcrumbs = [
    {
      label: "Accueil",
      href: "/",
      current: segments.length === 0,
    },
    ...segments.map((segment, index) => ({
      label: formatLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      current: index === segments.length - 1,
    })),
  ];
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                {index === 0 ? (
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </HoverCardTrigger>

                    <HoverCardContent className="w-56 p-2 ml-6 mt-2">
                      <div className="flex flex-col gap-1">
                        {vignetteMock.map((vignette) => (
                          <Button
                            key={vignette.title}
                            onClick={() => openDialog(vignette.modal)}
                          >
                            {vignette.title}
                          </Button>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : item.current ? (
                  <BreadcrumbPage className="font-semibold">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <VignetteDialogComponent />
    </>
  );
}
