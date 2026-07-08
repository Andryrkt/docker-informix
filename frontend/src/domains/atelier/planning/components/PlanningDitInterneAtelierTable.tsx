import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import type { PlanningDitInterneAtelier } from "../schema/planningDitInterneAtelierSchema";
import React from "react";
import { cn } from "@/lib/utils";

function getAllDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "short" });
  const day = d.getDate();
  return `${weekday} ${day}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type ResourceEntry = {
  agence: string;
  section: string;
  ressource: string;
  intitule: string;
  or: string;
  itv: string;
  nbJours: number;
  totalHeures: number;
  jours: Map<
    string,
    {
      heureMatin: number;
      heureMidi: number;
      total: number;
      isCheckedMatin: boolean;
      isCheckedMidi: boolean;
    }
  >;
};

function groupData(data: PlanningDitInterneAtelier[]) {
  const resourceMap = new Map<string, ResourceEntry>();

  data.forEach((item) => {
    const key = `${item.agence}|${item.section}|${item.ressource}`;
    if (!resourceMap.has(key)) {
      resourceMap.set(key, {
        agence: item.agence,
        section: item.section,
        ressource: item.ressource,
        intitule: item.intitule,
        or: item.or,
        itv: item.itv,
        nbJours: item.nbJours,
        totalHeures: item.totalHeures,
        jours: new Map(),
      });
    }
    const entry = resourceMap.get(key)!;
    item.jours.forEach((day) => {
      const existing = entry.jours.get(day.date);
      if (existing) {
        existing.heureMatin += day.heureMatin;
        existing.heureMidi += day.heureMidi;
        existing.total += day.total;
        existing.isCheckedMatin = existing.isCheckedMatin || day.isCheckedMatin;
        existing.isCheckedMidi = existing.isCheckedMidi || day.isCheckedMidi;
      } else {
        entry.jours.set(day.date, {
          heureMatin: day.heureMatin,
          heureMidi: day.heureMatin,
          total: day.total,
          isCheckedMatin: day.isCheckedMatin,
          isCheckedMidi: day.isCheckedMidi,
        });
      }
    });
  });

  const groups = new Map<
    string,
    { agence: string; section: string; ressources: ResourceEntry[] }
  >();
  for (const [, entry] of resourceMap) {
    const groupKey = `${entry.agence}|${entry.section}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        agence: entry.agence,
        section: entry.section,
        ressources: [],
      });
    }
    groups.get(groupKey)!.ressources.push(entry);
  }

  return groups;
}

function PlanningDitInterneAtelierTable({
  data,
  loading,
}: {
  data: PlanningDitInterneAtelier[];
  loading: boolean;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (key: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedGroups(newSet);
  };

  const toggleResource = (key: string) => {
    const newSet = new Set(expandedResources);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedResources(newSet);
  };

  const { allDates } = useMemo(() => {
    let min = "";
    let max = "";
    data.forEach((item) => {
      item.jours.forEach((day) => {
        if (!min || day.date < min) min = day.date;
        if (!max || day.date > max) max = day.date;
      });
    });
    const dates = min && max ? getAllDatesBetween(min, max) : [];
    return { allDates: dates };
  }, [data]);

  const groups = useMemo(() => groupData(data), [data]);

  const fixedCols = 7;
  const totalCols = fixedCols + allDates.length;

  if (loading) {
    return (
      <div className="w-full overflow-x-auto py-4">
        <Table className="min-w-max text-xs border border-gray-200">
          <TableHeader>
            <TableRow className="bg-brand-dark [&_th]:text-white">
              <TableHead className="border border-gray-300 px-3 py-2">
                Agence / Section
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Ressource
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Intitulé Travaux
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                OR
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Itv
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2 text-center">
                Nb Jours
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2 text-center">
                Total Heures
              </TableHead>
              {allDates.map((date) => (
                <TableHead
                  key={date}
                  className="border border-gray-300 text-center min-w-[50px] px-3 py-2"
                >
                  {formatDateShort(date)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={totalCols} className="py-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        Aucune donnée de planning
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto relative h-[calc(100vh-10rem)] mt-4">
      <Table className="w-full min-w-max text-xs border-collapse">
        <TableHeader className="sticky top-0 z-30">
          <TableRow className="bg-brand-dark [&_th]:text-white hover:bg-brand-dark border-b-0">
            <TableHead
              className="border border-gray-300  left-0 z-30 bg-brand-dark text-white min-w-[180px] px-3 py-2"
              rowSpan={2}
            >
              Agence / Section
            </TableHead>
            <TableHead
              className="border border-gray-300  left-[180px] z-30 bg-brand-dark text-white min-w-[120px] px-3 py-2"
              rowSpan={2}
            >
              Ressource
            </TableHead>
            <TableHead
              className="border border-gray-300 bg-brand-dark text-white min-w-[150px] px-3 py-2"
              rowSpan={2}
            >
              Intitulé Travaux
            </TableHead>
            <TableHead
              className="border border-gray-300 bg-brand-dark text-white min-w-[80px] px-3 py-2"
              rowSpan={2}
            >
              OR
            </TableHead>
            <TableHead
              className="border border-gray-300 bg-brand-dark text-white min-w-[60px] px-3 py-2"
              rowSpan={2}
            >
              Itv
            </TableHead>
            <TableHead
              className="border border-gray-300 bg-brand-dark text-white min-w-[70px] px-3 py-2 text-center"
              rowSpan={2}
            >
              Nb Jours
            </TableHead>
            <TableHead
              className="border border-gray-300 bg-brand-dark text-white min-w-[70px] px-3 py-2 text-center"
              rowSpan={2}
            >
              Total Heures
            </TableHead>
            <TableHead
              colSpan={allDates.length}
              className="border border-gray-300 text-center px-3 py-2 bg-brand-dark text-white"
            >
              Total par jour (heures)
            </TableHead>
          </TableRow>
          <TableRow className="bg-brand-dark [&_th]:text-white hover:bg-brand-dark border-b-0">
            {allDates.map((date) => (
              <TableHead
                key={date}
                className="border border-gray-300 text-center min-w-[50px] px-3 py-2 bg-brand-dark text-white capitalize"
              >
                {formatDateHeader(date)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white">
          {Array.from(groups.entries()).map(([groupKey, group]) => {
            const isGroupExpanded = expandedGroups.has(groupKey);
            return (
              <React.Fragment key={groupKey}>
                <TableRow
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer font-medium"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <TableCell
                    colSpan={totalCols}
                    className="border border-gray-300 px-3 py-4  left-0 z-20 bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {isGroupExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                      <span>
                        {group.agence} - {group.section}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        ({group.ressources.length} ressource(s))
                      </span>
                    </div>
                  </TableCell>
                </TableRow>

                {isGroupExpanded &&
                  group.ressources.map((res) => {
                    const resKey = `${groupKey}|${res.ressource}`;

                    return (
                      <React.Fragment key={resKey}>
                        <TableRow
                          className="hover:bg-muted/40 cursor-pointer"
                          onClick={() => toggleResource(resKey)}
                        >
                          <TableCell className="border border-gray-200  left-0 z-10 bg-white px-3 py-2" />
                          <TableCell className="border border-gray-200 bg-white px-3 py-2">
                            {res.ressource}
                          </TableCell>
                          <TableCell className="border border-gray-200 bg-white px-3 py-2">
                            {res.intitule || "-"}
                          </TableCell>
                          <TableCell className="border border-gray-200 bg-white px-3 py-2">
                            {res.or || "-"}
                          </TableCell>
                          <TableCell className="border border-gray-200 bg-white px-3 py-2">
                            {res.itv || "-"}
                          </TableCell>
                          <TableCell className="border border-gray-200 bg-white px-3 py-2 text-center">
                            {res.nbJours}
                          </TableCell>
                          <TableCell className="border border-gray-200 bg-white px-3 py-2 text-center font-medium">
                            {res.totalHeures.toFixed(1)}
                          </TableCell>
                          {allDates.map((date) => {
                            const day = res.jours.get(date);
                            return (
                              <TableCell
                                key={date}
                                className={cn(
                                  "border border-gray-200 px-3 py-2 text-center font-bold",
                                  day && "bg-brand-primary text-white",
                                )}
                              >
                                {day ? day.total.toFixed(1) : "-"}
                              </TableCell>
                            );
                          })}
                        </TableRow>

                        <>
                          {/* Matin */}
                          <TableRow className="bg-gray-50">
                            <TableCell
                              colSpan={7}
                              className="border border-gray-200  left-[180px] z-10 bg-gray-50 text-gray-600 italic px-3 py-2"
                            >
                              Matin
                            </TableCell>
                            {allDates.map((date) => {
                              const day = res.jours.get(date);
                              return (
                                <TableCell
                                  key={date}
                                  className={cn(
                                    "border border-gray-200 px-3 py-2 text-center font-bold",
                                    day &&
                                      (day.isCheckedMatin
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200"),
                                  )}
                                >
                                  {day ? day.heureMatin.toFixed(1) : "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>

                          {/* Midi */}
                          <TableRow className="bg-gray-50">
                            <TableCell
                              colSpan={7}
                              className="border border-gray-200  left-[180px] z-10 bg-gray-50 text-gray-600 italic px-3 py-2"
                            >
                              Midi
                            </TableCell>
                            {allDates.map((date) => {
                              const day = res.jours.get(date);
                              return (
                                <TableCell
                                  key={date}
                                  className={cn(
                                    "border border-gray-200 px-3 py-2 text-center font-bold",
                                    day &&
                                      (day.isCheckedMidi
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200"),
                                  )}
                                >
                                  {day ? day.heureMidi.toFixed(1) : "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </>
                      </React.Fragment>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default PlanningDitInterneAtelierTable;
