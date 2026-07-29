import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type PositionIPSOption = {
  label: string;
  value: string;
};

// ------------------------------------------------------------------
// Mock data – array of objects with libelle (same as statutOR)
// ------------------------------------------------------------------
const positionsIPSMock: { libelle: string }[] = [
  { libelle: "AC" },
  { libelle: "DE" },
  { libelle: "RE" },
  { libelle: "TR" },
];

// ------------------------------------------------------------------
// Mapper – label and value both use libelle
// ------------------------------------------------------------------
const mapPositionIpsToOption = (item: {
  libelle: string;
}): PositionIPSOption => ({
  label: item.libelle,
  value: item.libelle,
});

// ------------------------------------------------------------------
// Static constant – directly mapped from mock (for direct use)
// ------------------------------------------------------------------
export const POSITION_IPS: PositionIPSOption[] = positionsIPSMock.map(
  mapPositionIpsToOption,
);

// ------------------------------------------------------------------
// Fetcher – returns options (mock or real API)
// ------------------------------------------------------------------
export const getPositionsIPS = async (): Promise<PositionIPSOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200)); // simulate latency
    return POSITION_IPS;
  }

  // Real API call – adjust endpoint as needed
  const { data } =
    await axiosInstance.get<PositionIPSOption[]>("/ips/positions");
  return data;
};
