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
import { useTranslation } from "react-i18next";

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const { openDialog, VignetteDialogComponent } = useVignetteDialog();
  const { t: tb } = useTranslation("breadcrumb");
  const { t: tv } = useTranslation("vignette");

  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return;
  }

  /**
   * Resolves a URL segment to its human-readable label using nested dot-notation.
   *
   * Resolution order for segment "atelier" (ancestor = []):
   *   1. "atelier.root"           ← root label of a nested group  ← checked FIRST
   *   2. "atelier"                ← top-level scalar key
   *   3. formatLabel("atelier")   ← auto-format fallback
   *
   * Resolution order for "dit-list" (ancestor = ["atelier","demande-intervention"]):
   *   1. "atelier.demande-intervention.dit-list.root"  ← unlikely, but safe
   *   2. "atelier.demande-intervention.dit-list"       ← exact leaf key
   *   3. "dit-list.root"
   *   4. "dit-list"
   *   5. formatLabel("dit-list")
   */
  const resolveLabel = (segment: string, ancestorPath: string[]): string => {
    const tryKey = (key: string): string | null => {
      const val = tb(key, { defaultValue: "" });
      // Guard: i18next may return the object itself if the key maps to a nested object
      if (val && typeof val === "string") return val;
      return null;
    };

    // 1. Full nested path + ".root" (e.g. "atelier.demande-intervention.root")
    const nestedRoot = [...ancestorPath, segment, "root"].join(".");
    const r1 = tryKey(nestedRoot);
    if (r1) return r1;

    // 2. Full nested path as leaf (e.g. "atelier.demande-intervention.dit-list")
    const fullKey = [...ancestorPath, segment].join(".");
    const r2 = tryKey(fullKey);
    if (r2) return r2;

    // 3. Bare segment + ".root" at top level (e.g. "atelier.root")
    const r3 = tryKey(`${segment}.root`);
    if (r3) return r3;

    // 4. Bare segment as scalar top-level key (e.g. "select-company")
    const r4 = tryKey(segment);
    if (r4) return r4;

    return formatLabel(segment);
  };

  const breadcrumbs = [
    {
      label: tb("home"),
      href: "/",
      current: segments.length === 0,
    },
    ...segments.map((segment, index) => ({
      label: resolveLabel(segment, segments.slice(0, index)),
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
                            key={vignette.titleKey}
                            onClick={() => openDialog(vignette.modal)}
                          >
                            {tv(`${vignette.titleKey}.title`)}
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
