import { describe, it, expect } from "vitest";
import type {
  Tik, TikActions, TikHistoriqueEntry, TikPayload, PlanifierPayload,
  CategorieNode, Statut,
} from "../tikApi";

/**
 * Tests unitaires pour les types et la structure des données TIK.
 * Aucun appel HTTP — on vérifie uniquement que les structures de données
 * sont cohérentes avec ce que l'API doit retourner.
 */

const STATUTS: Statut[] = [
  "OUVERT", "PLANIFIE", "EN_COURS", "RESOLU", "REFUSE", "CLOTURE", "REOUVERT", "EN_ATTENTE",
];

const baseActions: TikActions = {
  peutValider:         false,
  peutRefuser:         false,
  peutMettreEnAttente: false,
  peutPlanifier:       false,
  peutTransferer:      false,
  peutResoudre:        false,
  peutCloturer:        false,
  peutReouvrir:        false,
  peutCommenter:       false,
};

function makeTik(overrides: Partial<Tik> = {}): Tik {
  return {
    id:               1,
    numeroTicket:     "TIK26070001",
    objetDemande:     "Écran cassé",
    detailDemande:    "<p>Le second écran ne s'allume plus</p>",
    niveauUrgence:    "P4",
    parcInformatique: null,
    dateFinSouhaitee: "2026-07-10",
    statut:           "OUVERT",
    createdAt:        "2026-07-02T10:00:00",
    dateDebutPlanning: null,
    dateFinPlanning:   null,
    agenceEmetteur:  { id: 1, code: "TNR", name: "Antananarivo" },
    serviceEmetteur: { id: 1, code: "INFO", name: "Informatique" },
    agenceDebiteur:  { id: 1, code: "TNR", name: "Antananarivo" },
    serviceDebiteur: { id: 1, code: "INFO", name: "Informatique" },
    categorie:       { id: 1, description: "MATERIELS" },
    sousCategorie:   null,
    autresCategorie: null,
    demandeur:  { id: 1, username: "lanto", displayName: "Lanto R." },
    validateur: null,
    intervenant: null,
    fichiers: [],
    actions: baseActions,
    ...overrides,
  };
}

describe("Statut", () => {
  it("contient les 8 statuts distincts du workflow", () => {
    expect(STATUTS).toHaveLength(8);
    expect(new Set(STATUTS).size).toBe(8);
  });
});

describe("Tik", () => {
  it("a une structure minimale valide pour un ticket nouvellement créé", () => {
    const tik = makeTik();

    expect(tik.statut).toBe("OUVERT");
    expect(tik.validateur).toBeNull();
    expect(tik.intervenant).toBeNull();
    expect(tik.fichiers).toHaveLength(0);
  });

  it("le numéro de ticket respecte le format TIK + 8 chiffres", () => {
    const tik = makeTik();
    expect(tik.numeroTicket).toMatch(/^TIK\d{8}$/);
  });

  it("supporte un ticket planifié avec intervenant assigné", () => {
    const tik = makeTik({
      statut: "PLANIFIE",
      intervenant: { id: 5, nom: "RAKOTO", prenoms: "Jean" },
      dateDebutPlanning: "2026-07-05T08:00:00",
      dateFinPlanning:   "2026-07-05T17:00:00",
      actions: { ...baseActions, peutResoudre: true, peutTransferer: true },
    });

    expect(tik.intervenant?.nom).toBe("RAKOTO");
    expect(tik.actions.peutResoudre).toBe(true);
    expect(tik.dateDebutPlanning).not.toBeNull();
  });

  it("supporte des fichiers joints", () => {
    const tik = makeTik({
      fichiers: [{ name: "facture.pdf", sizeKb: 128, url: "/api/tik/tickets/1/fichiers/abc_facture.pdf" }],
    });

    expect(tik.fichiers).toHaveLength(1);
    expect(tik.fichiers[0].name).toBe("facture.pdf");
  });
});

describe("TikActions", () => {
  it("toutes les actions sont désactivées par défaut", () => {
    expect(Object.values(baseActions).every((v) => v === false)).toBe(true);
  });

  it("les clés couvrent tout le workflow", () => {
    expect(Object.keys(baseActions).sort()).toEqual([
      "peutCloturer", "peutCommenter", "peutMettreEnAttente", "peutPlanifier", "peutRefuser",
      "peutReouvrir", "peutResoudre", "peutTransferer", "peutValider",
    ]);
  });
});

describe("TikHistoriqueEntry", () => {
  it("accepte un commentaire nullable et un utilisateur système", () => {
    const entry: TikHistoriqueEntry = {
      id: 1,
      statut: "REFUSE",
      commentaire: "Doublon avec TIK26070001",
      user: { id: 2, displayName: "Validateur" },
      createdAt: "2026-07-02T11:00:00",
    };

    expect(entry.commentaire).not.toBeNull();
    expect(entry.user?.displayName).toBe("Validateur");
  });
});

describe("TikPayload", () => {
  it("les champs de catégorie/agence/service peuvent être undefined avant sélection", () => {
    const payload: TikPayload = {
      objetDemande: "Objet",
      detailDemande: "<p>Détail</p>",
      categorieId: undefined,
      agenceDebiteurId: undefined,
      serviceDebiteurId: undefined,
      dateFinSouhaitee: "2026-07-10",
    } as any;

    expect(payload.categorieId).toBeUndefined();
    expect(payload.fichiers).toBeUndefined();
  });
});

describe("PlanifierPayload", () => {
  it("exige une date et une période de la journée", () => {
    const payload: PlanifierPayload = {
      date: "2026-07-05",
      partOfDay: "AM",
    };

    expect(payload.partOfDay).toBe("AM");
  });
});

describe("CategorieNode", () => {
  it("représente une hiérarchie à 3 niveaux catégorie > sous-catégorie > autre catégorie", () => {
    const tree: CategorieNode[] = [
      {
        id: 1,
        description: "MATERIELS",
        sousCategories: [
          {
            id: 1,
            description: "Ordinateur",
            autresCategories: [{ id: 1, description: "Écran" }],
          },
        ],
      },
    ];

    expect(tree[0].sousCategories[0].autresCategories[0].description).toBe("Écran");
  });
});
