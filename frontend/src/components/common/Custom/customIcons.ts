import {
  faList,
  faCirclePlus,
  type IconDefinition,
  faWarehouse,
  faTruckLoading,
  faQuestionCircle,
  faIndustry,
  faClone,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Associe une route à une icône personnalisée.
 *
 * Clé (key)   : route
 * Valeur      : icône personnalisée à afficher dans l'interface de type fontawesome icon
 *
 * @example
 * {
 *   "demande-intervention": faCirclePlus
 * }
 */
export const customIcons: Record<string, IconDefinition> = {
  "liste-devis-neg": faList,
  "nouveau-contrat": faCirclePlus,
  "ordre-reparation": faWarehouse,
  "a-livrer": faTruckLoading,
  "demande-support-informatique": faQuestionCircle,
  "dit-list": faList,
  "select-company": faIndustry,
  new: faCirclePlus,
  duplication: faClone,
};
