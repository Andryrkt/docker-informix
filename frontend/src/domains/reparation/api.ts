export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Type de réparation
export const reparationTypesOptions: SelectOption[] = [
  {
    id: 1,
    code: "EN COURS",
    label: "EN COURS",
    value: "EN COURS",
  },
  {
    id: 2,
    code: "DEJA EFFECTUEE",
    label: "DEJA EFFECTUEE",
    value: "DEJA EFFECTUEE",
  },
  {
    id: 3,
    code: "A REALISER",
    label: "A REALISER",
    value: "A REALISER",
  },
];

// Reparation realisé par
export const reparationRealiseParOptions: SelectOption[] = [
  {
    id: 1,
    code: "ATE_TANA",
    label: "ATE TANA",
    value: "ATE_TANA",
  },
  {
    id: 2,
    code: "ATE_POL_TANA",
    label: "ATE POL TANA",
    value: "ATE_POL_TANA",
  },
  {
    id: 4,
    code: "ATE_STAR",
    label: "ATE STAR",
    value: "ATE_STAR",
  },
  {
    id: 5,
    code: "ATE_MAS",
    label: "ATE MAS",
    value: "ATE_MAS",
  },
  {
    id: 6,
    code: "ATE_TMV",
    label: "ATE TMV",
    value: "ATE_TMV",
  },
  {
    id: 7,
    code: "ATE_FTU",
    label: "ATE FTU",
    value: "ATE_FTU",
  },
];
