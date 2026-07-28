import axiosInstance from "@/conf/axios";
import type { Section, SectionOption } from "./sectionSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export const sectionsMock: Section[] = [
  { id: "01", nom_section: "TANA" },
  { id: "02", nom_section: "FIANARANTSOA" },
  { id: "03", nom_section: "TOAMASINA" },
  { id: "04", nom_section: "MAHAJANGA" },
  { id: "05", nom_section: "ANTOSIRABE" },
];

export const getSections = async (): Promise<SectionOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return sectionsMock.map((section) => ({
      label: `${section.id} - ${section.nom_section}`,
      value: String(section.id),
    }));
  }

  const { data } = await axiosInstance.get<Section[]>("/dit/ressources");

  return data.map((ressource) => ({
    label: `${ressource.id} - ${ressource.nom_section}`,
    value: ressource.id,
  }));
};
