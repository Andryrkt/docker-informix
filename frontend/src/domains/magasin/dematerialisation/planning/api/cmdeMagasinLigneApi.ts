import axiosInstance from "@/conf/axios";
import type {
  CmdesMagasinList,
  CommandeLigne,
} from "../schema/CmdeMagasinSchema";
import type { ValeurMensuelleEntry } from "../schema/planningCmdeMagasinSchema";
import { MOCK_CMDES_LIST } from "../schema/CmdeMagasinSchemaMock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export async function fetchCmdeMagasinLigne(
  entry: ValeurMensuelleEntry,
  month: string,
  clientName: string,
): Promise<CmdesMagasinList> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_CMDES_LIST;
  }
  // 🔌 Replace with real API call when backend is ready
  const response = await axiosInstance.get("/commandes-lignes", {
    params: { month, client: clientName, value: entry.value },
  });
  return response.data;
}
