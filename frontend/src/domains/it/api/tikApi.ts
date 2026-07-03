import axiosInstance from "@/conf/axios";

export type Statut = "OUVERT" | "PLANIFIE" | "EN_COURS" | "RESOLU" | "REFUSE" | "CLOTURE" | "REOUVERT";
export type NiveauUrgence = "P1" | "P2" | "P3" | "P4" | "P5";

export interface CategorieRef {
  id: number;
  description: string;
}

export interface AutresCategorieNode {
  id: number;
  description: string;
}

export interface SousCategorieNode {
  id: number;
  description: string;
  autresCategories: AutresCategorieNode[];
}

export interface CategorieNode {
  id: number;
  description: string;
  sousCategories: SousCategorieNode[];
}

export interface AgenceServiceRef {
  id: number;
  code: string;
  name: string;
}

export interface TikFichier {
  name: string;
  sizeKb: number;
  url: string;
}

export interface Tik {
  id: number;
  numeroTicket: string;
  objetDemande: string;
  detailDemande: string;
  niveauUrgence: NiveauUrgence;
  parcInformatique: string | null;
  dateFinSouhaitee: string;
  statut: Statut;
  createdAt: string;
  dateDebutPlanning: string | null;
  dateFinPlanning: string | null;
  agenceEmetteur: AgenceServiceRef | null;
  serviceEmetteur: AgenceServiceRef | null;
  agenceDebiteur: AgenceServiceRef | null;
  serviceDebiteur: AgenceServiceRef | null;
  categorie: CategorieRef | null;
  sousCategorie: CategorieRef | null;
  autresCategorie: CategorieRef | null;
  demandeur: { id: number; username: string; displayName: string | null } | null;
  intervenant: { id: number; nom: string; prenoms: string } | null;
  fichiers: TikFichier[];
}

export interface TikDefaults {
  agenceEmetteur: AgenceServiceRef | null;
  serviceEmetteur: AgenceServiceRef | null;
  codeSociete: string | null;
  dateFinSouhaiteeDefaut: string;
}

export interface TikPayload {
  objetDemande: string;
  detailDemande: string;
  categorieId: number | undefined;
  agenceDebiteurId: number | undefined;
  serviceDebiteurId: number | undefined;
  dateFinSouhaitee: string;
  parcInformatique?: string;
  fichiers?: File[];
}

export interface PlanifierPayload {
  intervenantId: number | undefined;
  dateDebutPlanning: string;
  dateFinPlanning: string;
}

export const fetchCategoriesTree = async (): Promise<CategorieNode[]> => {
  const { data } = await axiosInstance.get("/tik/categories");
  return data;
};

export const fetchTikDefaults = async (): Promise<TikDefaults> => {
  const { data } = await axiosInstance.get("/tik/tickets/defaults");
  return data;
};

export const fetchTickets = async (): Promise<Tik[]> => {
  const { data } = await axiosInstance.get("/tik/tickets");
  return data;
};

export const fetchTicket = async (id: number): Promise<Tik> => {
  const { data } = await axiosInstance.get(`/tik/tickets/${id}`);
  return data;
};

export const createTicket = async (payload: TikPayload): Promise<Tik> => {
  const formData = new FormData();

  formData.append("objetDemande", payload.objetDemande);
  formData.append("detailDemande", payload.detailDemande);
  if (payload.categorieId !== undefined)       formData.append("categorieId", String(payload.categorieId));
  if (payload.agenceDebiteurId !== undefined)  formData.append("agenceDebiteurId", String(payload.agenceDebiteurId));
  if (payload.serviceDebiteurId !== undefined) formData.append("serviceDebiteurId", String(payload.serviceDebiteurId));
  formData.append("dateFinSouhaitee", payload.dateFinSouhaitee);
  if (payload.parcInformatique) formData.append("parcInformatique", payload.parcInformatique);
  (payload.fichiers ?? []).forEach((file) => formData.append("fichiers[]", file));

  const { data } = await axiosInstance.post("/tik/tickets", formData);
  return data;
};

export const planifierTicket = async (id: number, payload: PlanifierPayload): Promise<Tik> => {
  const { data } = await axiosInstance.post(`/tik/tickets/${id}/planifier`, payload);
  return data;
};
