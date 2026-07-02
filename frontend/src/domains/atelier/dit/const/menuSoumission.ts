export const DW_DOCUMENT_OPTIONS = [
  {
    value: "verification_prix",
    code: "DEVIS",
    label: "DEVIS - Vérification de prix",
    href: "/dw/dit",
  },
  {
    value: "validation_atelier",
    code: "DEVIS",
    label: "DEVIS - Validation atelier",
    href: "/dw/dit",
  },
  {
    value: "bon_commande",
    code: "BC",
    label: "BC - Bon de commande",
    href: "/dw/devis",
  },
  {
    value: "ordre-reparation",
    code: "OR",
    label: "OR - Ordre de réparation",
    href: "/dw/devis",
  },
  {
    value: "ri",
    code: "RI",
    label: "RI - Rapport d'intervention",
    href: "/dw/devis",
  },
  {
    value: "facture",
    code: "FACTURE",
    label: "Facture",
    href: "/dw/facture",
  },
] as const;
