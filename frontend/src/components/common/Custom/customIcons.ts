import {
  faList,
  faCirclePlus,
  type IconDefinition,
  faWarehouse,
  faTruckLoading,
} from "@fortawesome/free-solid-svg-icons";

export const customIcons: Record<string, IconDefinition> = {
  "liste-devis-neg": faList,
  "nouveau-contrat": faCirclePlus,
  "ordre-reparation": faWarehouse,
  livrer: faTruckLoading,
};
