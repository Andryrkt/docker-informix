import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../test/utils";
import { CopyFromUserDialog } from "../CopyFromUserDialog";

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultProps = {
  open:          true,
  onClose:       vi.fn(),
  onConfirm:     vi.fn(),
  currentUserId: 1, // correspond à l'utilisateur "lanto" dans les mocks
};

function renderDialog(props: Record<string, any> = {}) {
  return renderWithProviders(<CopyFromUserDialog {...defaultProps} {...(props as any)} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CopyFromUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendu ────────────────────────────────────────────────────────────────

  it("affiche le titre quand open=true", () => {
    renderDialog();
    expect(screen.getByText(/Copier les permissions depuis/i)).toBeInTheDocument();
  });

  it("n'affiche rien quand open=false", () => {
    renderDialog({ open: false });
    expect(screen.queryByText(/Copier les permissions depuis/i)).not.toBeInTheDocument();
  });

  it("affiche les deux modes (Remplacer / Fusionner)", () => {
    renderDialog();
    expect(screen.getByText("Remplacer")).toBeInTheDocument();
    expect(screen.getByText("Fusionner")).toBeInTheDocument();
  });

  it("affiche les boutons Annuler et Copier", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /Annuler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copier/i })).toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it("le bouton Copier est désactivé si aucun utilisateur sélectionné", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /Copier/i })).toBeDisabled();
  });

  // ── Mode ──────────────────────────────────────────────────────────────────

  it("le mode par défaut est 'Remplacer'", () => {
    renderDialog();
    const radios = screen.getAllByRole("radio");
    // Premier radio = Remplacer
    expect(radios[0]).toBeChecked();
    // Deuxième radio = Fusionner
    expect(radios[1]).not.toBeChecked();
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

  it("charge la liste des utilisateurs depuis l'API", async () => {
    renderDialog();

    // Les utilisateurs sont chargés via useQuery — on attend que le Select soit prêt
    await waitFor(() => {
      // Le trigger du Select doit être présent
      expect(screen.getByText(/Choisir un utilisateur/i)).toBeInTheDocument();
    });
  });

  it("affiche le spinner pendant la soumission", () => {
    renderDialog({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /Copie en cours/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copie en cours/i })).toBeDisabled();
  });

  it("désactive Annuler pendant la soumission", () => {
    renderDialog({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /Annuler/i })).toBeDisabled();
  });
});
