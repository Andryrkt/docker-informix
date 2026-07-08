import { max_size_upload_file, type FieldTrait } from "@/schema/traitFields";

export const ditFields: FieldTrait[] = [
  {
    name: "numeroDit",
    type: "text",
    label: "Numéro DIT",
    readOnly: true,
  },
  {
    name: "numeroDevis",
    type: "text",
    label: "Numéro devis *",
    readOnly: true,
  },
];
export const pieceJointeFields: FieldTrait[] = [
  {
    name: "pieceJointe",
    type: "dragfile",
    label: "Veuillez insérer le RI à valider *",
    multiple: false,
    maxSize: max_size_upload_file,
    pattern: "^RI.*$",
    accept: ".pdf,.doc,.docx,image/*",
  },
] as const;
export const interventionFields: FieldTrait[] = [
  {
    name: "interventions",
    type: "multichoice-table",
    label: "Veuillez sélectionner le(s) intervention(s) dans le RI *",

    options: [
      {
        value: "ITV-001",
        numeroITV: "ITV-001",
        commentaire: "Réparation moteur",
        statut: "Urgent",
      },
      {
        value: "ITV-002",
        numeroITV: "ITV-002",
        commentaire: "Vidange complète",
        statut: "Normal",
      },
      {
        value: "ITV-003",
        numeroITV: "ITV-003",
        commentaire: "Diagnostic électrique",
        statut: "En attente",
      },
      {
        value: "ITV-004",
        numeroITV: "ITV-004",
        commentaire: "Remplacement des freins",
        statut: "Urgent",
      },
      {
        value: "ITV-005",
        numeroITV: "ITV-005",
        commentaire: "Contrôle climatisation",
        statut: "Normal",
      },
      {
        value: "ITV-006",
        numeroITV: "ITV-006",
        commentaire: "Changement pneus avant",
        statut: "Planifié",
      },
      {
        value: "ITV-007",
        numeroITV: "ITV-007",
        commentaire: "Révision générale",
        statut: "En cours",
      },
      {
        value: "ITV-008",
        numeroITV: "ITV-008",
        commentaire: "Remplacement batterie",
        statut: "Urgent",
      },
      {
        value: "ITV-009",
        numeroITV: "ITV-009",
        commentaire: "Purge du système de freinage",
        statut: "Normal",
      },
      {
        value: "ITV-010",
        numeroITV: "ITV-010",
        commentaire: "Changement filtre à air",
        statut: "Normal",
      },
      {
        value: "ITV-011",
        numeroITV: "ITV-011",
        commentaire: "Réparation boîte de vitesses",
        statut: "Urgent",
      },
      {
        value: "ITV-012",
        numeroITV: "ITV-012",
        commentaire: "Alignement des roues",
        statut: "Planifié",
      },
      {
        value: "ITV-013",
        numeroITV: "ITV-013",
        commentaire: "Nettoyage injecteurs",
        statut: "En cours",
      },
      {
        value: "ITV-014",
        numeroITV: "ITV-014",
        commentaire: "Remplacement bougies",
        statut: "Normal",
      },
      {
        value: "ITV-015",
        numeroITV: "ITV-015",
        commentaire: "Réparation suspension",
        statut: "Urgent",
      },
      {
        value: "ITV-016",
        numeroITV: "ITV-016",
        commentaire: "Changement huile moteur",
        statut: "Normal",
      },
      {
        value: "ITV-017",
        numeroITV: "ITV-017",
        commentaire: "Vérification système ABS",
        statut: "En attente",
      },
      {
        value: "ITV-018",
        numeroITV: "ITV-018",
        commentaire: "Remplacement courroie de distribution",
        statut: "Urgent",
      },
      {
        value: "ITV-019",
        numeroITV: "ITV-019",
        commentaire: "Recharge climatisation",
        statut: "Planifié",
      },
      {
        value: "ITV-020",
        numeroITV: "ITV-020",
        commentaire: "Inspection générale véhicule",
        statut: "En cours",
      },
      {
        value: "ITV-021",
        numeroITV: "ITV-021",
        commentaire: "Réparation système électrique",
        statut: "Urgent",
      },
      {
        value: "ITV-022",
        numeroITV: "ITV-022",
        commentaire: "Remplacement plaquettes de frein",
        statut: "Normal",
      },
      {
        value: "ITV-023",
        numeroITV: "ITV-023",
        commentaire: "Contrôle direction assistée",
        statut: "En attente",
      },
      {
        value: "ITV-024",
        numeroITV: "ITV-024",
        commentaire: "Vidange boîte automatique",
        statut: "Planifié",
      },
      {
        value: "ITV-025",
        numeroITV: "ITV-025",
        commentaire: "Réparation système échappement",
        statut: "Urgent",
      },
      {
        value: "ITV-026",
        numeroITV: "ITV-026",
        commentaire: "Test batterie et alternateur",
        statut: "Normal",
      },
      {
        value: "ITV-027",
        numeroITV: "ITV-027",
        commentaire: "Réglage moteur et injection",
        statut: "En cours",
      },
    ],

    columns: [
      { key: "numeroITV", label: "N° ITV" },
      { key: "commentaire", label: "Commentaire" },
      { key: "statut", label: "Statut" },
    ],
  },
] as const;
