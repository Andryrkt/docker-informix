import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Mock data (adjust as needed)
const piecesMock: { id: number; nom: string; reference?: string }[] = [
  { id: 1, nom: "Pièce moteur EXEMPLE", reference: "REF-001" },
  { id: 2, nom: "Pièce frein EXEMPLE", reference: "REF-002" },
  { id: 3, nom: "Pièce transmission EXEMPLE", reference: "REF-003" },
  // add more as needed
];

export const getPieces = async (): Promise<SelectOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return piecesMock.map((item) => ({
      id: item.id,
      label: item.nom,
      value: String(item.id), // or item.reference? depending on what is expected
    }));
  }

  const { data } = await axiosInstance.get<
    { id: number; nom: string; reference?: string }[]
  >(
    "/pieces", // or "/dit/pieces" - adapt to actual endpoint
  );
  return data.map((item) => ({
    id: item.id,
    label: item.nom,
    value: String(item.id),
  }));
};

export const getPieceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const pieces = await getPieces();
  return pieces.find((item) => item.id === id);
};
