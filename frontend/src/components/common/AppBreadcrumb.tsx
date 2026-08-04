import {
  Breadcrumb,
  BreadcrumbItem,
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
import {
  type AppModule,
  type ModuleModal,
} from "@/domains/home/schema/moduleItems";
import { cn, formatLabel } from "@/lib/utils";
import { customLabels } from "./Custom/customLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faHome,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { customIcons } from "./Custom/customIcons";
import { useVignetteDialog } from "@/domains/home/components/ModuleDialog";
import { useMenuNavigation } from "@/hooks/useMenuNavigation";
import { useMemo } from "react";
import { navigationToModuleItems } from "@/lib/navigationToModuleItems";

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const { openDialog, ModuleDialogComponent } = useVignetteDialog();

  const { data } = useMenuNavigation();
  const moduleItems: AppModule[] = useMemo(
    () => (data ? navigationToModuleItems(data) : []),
    [data],
  );

  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return null;
  }

  const vignetteIconMap = moduleItems.reduce(
    (acc, item) => {
      acc[item.nomModule.toLowerCase()] = item.icon;
      return acc;
    },
    {} as Record<string, IconDefinition>,
  );

  // Simple label resolver – just format the segment
  const resolveLabel = (segment: string): string => {
    return customLabels[segment] ?? formatLabel(segment);
  };
  // Build a map from item labels to their icons (including nested)
  const labelIconMap = moduleItems.reduce(
    (acc, card) => {
      // Top-level card title
      acc[card.nomModule] = card.icon;

      card.moduleModal.Menu?.forEach((section) => {
        // ✅ Add section title
        acc[section.titreMenu] = section.icon;

        section.sousMenu.forEach((item) => {
          acc[item.sousMenu] = item.icon;
        });
      });

      // Direct modal.items
      card.moduleModal.sousMenu?.forEach((item) => {
        acc[item.sousMenu] = item.icon;
      });

      return acc;
    },
    {} as Record<string, IconDefinition>,
  );

  // 2. Fix resolveIcon – return a valid IconDefinition
  function resolveIcon(segment: string, name: string): IconDefinition {
    const lower = segment.toLowerCase();
    // 1. Custom overrides (by URL segment)
    if (customIcons[lower]) return customIcons[lower];
    // 2. Top-level vignette titles (by URL segment)
    if (vignetteIconMap[lower]) return vignetteIconMap[lower];
    // 3. Match by resolved label (name)
    if (labelIconMap[name]) return labelIconMap[name];
    // 4. Fallback: use raw segment as a key (if you added segment-to-icon entries)
    if (labelIconMap[segment]) return labelIconMap[segment];
    // 5. Default fallback
    return faFolder; // ✅ must return a value
  }

  const breadcrumbs = [
    {
      label: "Acceuil", // static home label
      href: "/",
      current: segments.length === 0,
      icon: faHome,
    },
    ...segments.map((segment, index) => ({
      label: resolveLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      current: index === segments.length - 1,
      icon: resolveIcon(segment, resolveLabel(segment)),
    })),
  ];

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList className="gap-0">
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === 0 ? (
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Link
                        to={item.href}
                        className="justify-center  text-center  flex items-center gap-1  py-1 px-4 rounded-md"
                      >
                        <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className={cn(
                        "w-fit py-2 ml-6 mt-2 bg-brand-dark  shadow-sm shadow-white/20",
                        moduleItems.length >= 6 ? " lg:h-72" : "h-fit",
                      )}
                    >
                      <div className="flex flex-col flex-wrap gap-2 content-start items-start h-full">
                        {moduleItems.map((module) => (
                          <Button
                            key={module.nomModule}
                            onClick={() =>
                              openDialog(module.moduleModal as ModuleModal)
                            }
                            variant="brand_secondary"
                            className="w-48 h-11 flex items-center justify-start gap-2 py-2 px-4 text-left text-zinc-500 font-semibold group "
                          >
                            <FontAwesomeIcon
                              icon={module.icon}
                              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-2   "
                            />
                            <span className="text-white group-hover:text-black transition-transform duration-300 group-hover:translate-x-2">
                              {module.nomModule}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <BreadcrumbPage
                    className={cn(
                      "flex items-center gap-1  px-4 rounded-md",
                      item.current ? "text-brand-primary font-semibold" : "",
                    )}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <ModuleDialogComponent />
    </>
  );
}
