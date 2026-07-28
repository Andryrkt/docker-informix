import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface Categorie {
  code: string;
  label: string;
}

interface CategorieOption {
  label: string;
  value: string;
}

const categoriesMock: Categorie[] = [
  {
    code: "CAT01",
    label: "Matériel",
  },
  {
    code: "CAT02",
    label: "Service",
  },
  {
    code: "CAT03",
    label: "Fourniture",
  },
  {
    code: "CAT04",
    label: "Maintenance",
  },
];

const mapCategorieToOption = (categorie: Categorie): CategorieOption => ({
  label: categorie.label,
  value: categorie.code,
});

export const getCategories = async (): Promise<CategorieOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return categoriesMock.map(mapCategorieToOption);
  }

  const { data } = await axiosInstance.get<Categorie[]>("/dit/categories");

  return data.map(mapCategorieToOption);
};
