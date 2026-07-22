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
import { Button } from "../ui/button";
import { vignetteItems } from "@/domains/home/schema/vignetteItems";
import { cn, formatLabel } from "@/lib/utils";
import { useVignette } from "@/context/VignetteContext";
import { customLabels } from "./CustomLabels/customLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const { openDialog } = useVignette();

  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return null;
  }

  // Simple label resolver – just format the segment
  const resolveLabel = (segment: string): string => {
    return customLabels[segment] ?? formatLabel(segment);
  };

  const breadcrumbs = [
    {
      label: "Acceuil", // static home label
      href: "/",
      current: segments.length === 0,
    },
    ...segments.map((segment, index) => ({
      label: resolveLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      current: index === segments.length - 1,
    })),
  ];

  return (
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
                  <HoverCardContent
                    className={cn(
                      "w-fit py-2 ml-6 mt-2 bg-brand-dark  shadow-sm shadow-white/20",
                      vignetteItems.length >= 6 ? " lg:h-72" : "h-fit",
                    )}
                  >
                    <div className="flex flex-col flex-wrap gap-2 content-start items-start h-full">
                      {vignetteItems.map((vignette) => (
                        <Button
                          key={vignette.title}
                          onClick={() => openDialog(vignette.modal as any)}
                          variant="brand_secondary"
                          className="w-48 h-11 flex items-center justify-start gap-2 py-2 px-4 text-left text-zinc-500 font-semibold group "
                        >
                          <FontAwesomeIcon
                            icon={vignette.icon}
                            className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-2   "
                          />
                          <span className="text-white group-hover:text-black transition-transform duration-300 group-hover:translate-x-2">
                            {vignette.title}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <BreadcrumbPage className={item.current ? "font-semibold" : ""}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
