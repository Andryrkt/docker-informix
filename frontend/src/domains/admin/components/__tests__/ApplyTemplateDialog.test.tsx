import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../test/utils";
import { ApplyTemplateDialog } from "../ApplyTemplateDialog";

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultProps = {
  open:      true,
  onClose:   vi.fn(),
  onConfirm: vi.fn(),
};

function renderDialog(props: Record<string, any> = {}) {
  return renderWithProviders(<ApplyTemplateDialog {...defaultProps} {...(props as any)} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ApplyTemplateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendu ────────────────────────────────────────────────────────────────

  it("affiche le titre quand open=true", () => {
    renderDialog();
    expect(screen.getByText(/Appliquer un modèle de permissions/i)).toBeInTheDocument();
  });

  it("n'affiche rien quand open=false", () => {
    renderDialog({ open: false });
    expect(screen.queryByText(/Appliquer un modèle/i)).not.toBeInTheDocument();
  });

  it("affiche les deux modes (Remplacer / Fusionner)", () => {
    renderDialog();
    expect(screen.getByText("Remplacer")).toBeInTheDocument();
    expect(screen.getByText("Fusionner")).toBeInTheDocument();
  });

  it("affiche les boutons Annuler et Appliquer", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /Annuler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Appliquer/i })).toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it("le bouton Appliquer est désactivé si aucun modèle sélectionné", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /Appliquer/i })).toBeDisabled();
  });

  // ── Mode ──────────────────────────────────────────────────────────────────

  it("le mode par défaut est 'Remplacer'", () => {
    renderDialog();
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();   // Remplacer
    expect(radios[1]).not.toBeChecked(); // Fusionner
  });

  it("permet de basculer vers le mode Fusionner", async () => {
    const user = userEvent.setup();
    renderDialog();

    const [, mergeRadio] = screen.getAllByRole("radio");
    await user.click(mergeRadio);

    expect(mergeRadio).toBeChecked();
  });

  // ── Interactions ──────────────────────────────────────────────────────────

  it("appelle onClose quand on clique Annuler", async () => {
    const onClose = vi.fn();
    const user    = userEvent.setup();
    renderDialog({ onClose });

    await user.click(screen.getByRole("button", { name: /Annuler/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("affiche le placeholder du Select modèle", async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText(/Choisir un modèle/i)).toBeInTheDocument();
    });
  });

  it("affiche le spinner pendant la soumission", () => {
    renderDialog({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /Application en cours/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Application en cours/i })).toBeDisabled();
  });

  it("désactive Annuler pendant la soumission", () => {
    renderDialog({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /Annuler/i })).toBeDisabled();
  });
});
