import type { Planning } from "./planningMagasinSchema";

export const planningMagasinMook: Planning[] = [
  {
    COMMERCIAUX: "DIMBY ANDRIANTSOA",
    AGENCE: "ANTANANARIVO - NEGOCE",
    SERVICE: "SERVICE A",
    CODE_CLIENT: "1001010",
    NOM_CLIENT: "STAR",

    MOIS: [
      {
        date: "2025-11",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2025-12",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-01",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-02",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-03",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-04",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-05",
        entries: [{ value: 0, etat: null }],
      },
      {
        date: "2026-06",
        entries: [
          { value: 19415382, etat: "Valide" },
          { value: 19414100, etat: "En attente" },
          { value: 19414100, etat: "En attente" },
        ],
      },
      {
        date: "2026-07",
        entries: [
          { value: 19415070, etat: "Valide" },
          { value: 19414100, etat: "En attente" },
        ],
      },
      {
        date: "2026-08",
        entries: [{ value: 19415211, etat: "Valide" }],
      },
    ],
  },

  {
    COMMERCIAUX: "RAKOTO ANDRY",
    AGENCE: "TOAMASINA - NEGOCE",
    SERVICE: "SERVICE B",
    CODE_CLIENT: "1002020",
    NOM_CLIENT: "JIRAMA",

    MOIS: [
      {
        date: "2026-06",
        entries: [
          { value: 1200000, etat: "Valide" },
          { value: 800000, etat: "Rejeté" },
          { value: 800000, etat: "Rejeté" },
          { value: 800000, etat: "Rejeté" },
          { value: 800000, etat: "Rejeté" },
          { value: 800000, etat: "Rejeté" },
          { value: 800000, etat: "Valide" },
        ],
      },
      {
        date: "2026-07",
        entries: [{ value: 1500000, etat: "Valide" }],
      },
    ],
  },
];
