import { mockMateriels } from "../schema/materielMock";
import type { Materiel } from "../schema/materielSchema";

export const getMateriels = async (): Promise<Materiel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMateriels);
    }, 300);
  });
};
