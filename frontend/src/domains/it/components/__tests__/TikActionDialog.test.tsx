import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../test/utils";
import TikActionDialog, { type TikActionKind } from "../TikActionDialog";
import type { Tik, TikActions } from "../../api/tikApi";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const ticket: Tik = {
  id:               1,
  numeroTicket:     "TIK26070001",
  objetDemande:     "Écran cassé",
  detailDemande:    "<p>Détail</p>",
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
};

const defaultProps: { ticket: Tik | null; action: TikActionKind | null; onClose: () => void } = {
  ticket,
  action: "refuser",
  onClose: vi.fn(),
};

function renderDialog(props: Partial<typeof defaultProps> = {}) {
  return renderWithProviders(<TikActionDialog {...defaultProps} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TikActionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendu ────────────────────────────────────────────────────────────────

  it("n'affiche rien quand action=null", () => {
    renderDialog({ action: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("n'affiche rien quand ticket=null", () => {
    renderDialog({ ticket: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("affiche le titre avec le numéro de ticket pour l'action refuser", () => {
    renderDialog({ action: "refuser" });
    expect(screen.getByText(/Refuser le ticket — TIK26070001/i)).toBeInTheDocument();
  });

  it("affiche le bon titre et libellé de confirmation selon l'action", () => {
    renderDialog({ action: "cloturer" });
    expect(screen.getByText(/Clôturer le ticket/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clôturer" })).toBeInTheDocument();
  });

  // ── Champs conditionnels ──────────────────────────────────────────────────

  it("affiche le champ intervenant pour l'action valider", async () => {
    renderDialog({ action: "valider" });
    await waitFor(() => {
      expect(screen.getByText("Intervenant")).toBeInTheDocument();
    });
  });

  it("charge la liste des intervenants disponibles depuis l'API", async () => {
    renderDialog({ action: "valider" });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "RAKOTO Jean" })).toBeInTheDocument();
    });
    expect(screen.getByRole("option", { name: "RABE Marie" })).toBeInTheDocument();
  });

  it("affiche les champs date et période de la journée pour l'action planifier", () => {
    renderDialog({ action: "planifier" });
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Période de la journée")).toBeInTheDocument();
  });

  it("n'affiche pas de champ commentaire pour l'action planifier", () => {
    renderDialog({ action: "planifier" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("affiche un champ commentaire obligatoire pour l'action refuser", () => {
    renderDialog({ action: "refuser" });
    expect(screen.getByText(/Motif du refus/i)).toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it("affiche une erreur si on confirme un refus sans commentaire", async () => {
    const user = userEvent.setup();
    renderDialog({ action: "refuser" });

    await user.click(screen.getByRole("button", { name: "Refuser" }));

    expect(await screen.findByText(/obligatoire/i)).toBeInTheDocument();
  });

  it("affiche une erreur si on confirme une planification sans date ni période", async () => {
    const user = userEvent.setup();
    renderDialog({ action: "planifier" });

    await user.click(screen.getByRole("button", { name: "Planifier" }));

    expect(await screen.findByText(/date et la période de la journée sont obligatoires/i)).toBeInTheDocument();
  });

  it("affiche une erreur si on valide sans choisir d'intervenant", async () => {
    const user = userEvent.setup();
    renderDialog({ action: "valider" });

    await user.click(screen.getByRole("button", { name: "Valider" }));

    expect(await screen.findByText(/intervenant est obligatoire/i)).toBeInTheDocument();
  });

  // ── Interactions ──────────────────────────────────────────────────────────

  it("appelle onClose quand on clique Annuler", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onClose });

    await user.click(screen.getByRole("button", { name: /Annuler/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
