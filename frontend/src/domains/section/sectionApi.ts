import axiosInstance from "@/conf/axios";
import type { Section, SectionOption } from "./sectionSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const sectionsMock: Section[] = [
  { id: "01", nom_section: "TANA" },
  { id: "02", nom_section: "FIANARANTSOA" },
  { id: "03", nom_section: "TOAMASINA" },
  { id: "04", nom_section: "MAHAJANGA" },
  { id: "05", nom_section: "ANTSIRABE" },
];

const mapSectionToOption = (section: Section): SectionOption => ({
  label: section.nom_section,
  value: String(section.id),
});

export const getSections = async (url: string): Promise<SectionOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return sectionsMock.map(mapSectionToOption);
  }

  const { data } = await axiosInstance.get<Section[]>(url);

  return data.map(mapSectionToOption);
};
