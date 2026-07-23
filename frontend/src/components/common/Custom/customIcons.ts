import {
  faList,
  faCirclePlus,
  type IconDefinition,
  faWarehouse,
  faTruckLoading,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

export const customIcons: Record<string, IconDefinition> = {
  "liste-devis-neg": faList,
  "nouveau-contrat": faCirclePlus,
  "ordre-reparation": faWarehouse,
  livrer: faTruckLoading,
  "demande-support-informatique": faQuestionCircle,
};
