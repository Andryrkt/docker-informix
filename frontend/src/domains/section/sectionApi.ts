import axiosInstance from "@/conf/axios";
import type { Section, SectionOption } from "./sectionSchema";

const mapSectionToOption = (section: Section): SectionOption => ({
  label: section.nom_section,
  value: String(section.id),
});

export const getSections = async (url: string): Promise<SectionOption[]> => {
  const { data } = await axiosInstance.get<Section[]>(url);

  return data.map(mapSectionToOption);
};
