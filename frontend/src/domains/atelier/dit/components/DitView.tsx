import type { Dit } from "../schema/ditSchema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaterielInfoCard } from "@/domains/materiel/components/MaterielInfoCard";
import { ViewSection } from "./atom/ViewSection";
import { FieldReadOnly } from "@/components/common/renderer/FieldRenderer";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import {
  BilanFinanciereCard,
  type BilanFinancier,
} from "./atom/BilanFinanciereCard";
import { mockCommandes } from "@/domains/commande/commandeMocks";
import { Paperclip } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Props = {
  dit: Dit;
  bilanFinancier?: BilanFinancier | null;
  materiel?: Materiel | null;
};
function DitView({ dit, bilanFinancier, materiel }: Props) {
  const interventionFields = [
    {
      label: "Niveau d'urgence",
      value: dit?.worNiveauUrgence,
    },
    {
      label: "Date prévue",
      value: formatDate(dit?.datePrevue),
    },
    {
      label: "Statut",
      value: dit?.statutDemande,
    },
  ];
  const traitsFields = [
    {
      label: "Type document",
      value: dit?.typeDocument,
    },
    {
      label: "Demande devis",
      value: dit?.interneExterne,
    },
    {
      label: "Livraison Partielle",
      value: dit?.livraisonPartielle,
    },
    {
      label: "Avis de recouvrement",
      value: dit?.avisRecouvrement,
    },
    {
      label: "Categorie demande",
      value: dit?.categorieDemande,
    },
    {
      label: "interneExterne",
      value: dit?.interneExterne,
    },
  ];
  const clientFields = [
    {
      label: "Nom Client",
      value: dit?.nomClient,
    },
    {
      label: "N° telephone",
      value: dit?.telephoneClient,
    },
    {
      label: "Client sous contrat",
      value: dit?.clientSousContrat,
    },
  ];
  const typeReparationFields = [
    {
      label: "Type de reparation",
      value: dit?.typeReparation,
    },
    {
      label: "Réalisé par",
      value: dit?.reparationPar,
    },
  ];
  const pieceJointeFields = [
    {
      label: "Pièce Jointe",
      value: dit?.pieceJoint,
    },
    {
      label: "Pièce Jointe 1",
      value: dit?.pieceJoint1,
    },
    {
      label: "Pièce Jointe 2",
      value: dit?.pieceJoint2,
    },
  ];

  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2 max-w-7xl  mx-auto">
        <h1 className="text-2xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark">
          Details Demande d'intervention
        </h1>
      </div>
      <div className="space-y-6  border-t-0 mx-auto gap-x-5 max-w-7xl grid md:grid-cols-2 ">
        {/* DIT */}
        <div className="gap-6  p-2">
          <ViewSection title={"DIT"}>
            <div className="flex flex-col gap-2">
              {/* Numero, Date et Statut DIT */}
              <div className="flex gap-2">
                <FieldReadOnly
                  label="Numero DIT"
                  value={dit?.numeroDemandeIntervention}
                ></FieldReadOnly>
                <FieldReadOnly
                  label="Date Demande"
                  value={formatDate(dit?.dateDemande)}
                ></FieldReadOnly>
                <FieldReadOnly
                  label="Statut DIT"
                  value={dit?.statutDemande}
                ></FieldReadOnly>
              </div>

              {/* Objet et Details */}
              <FieldReadOnly
                label="Objet de la demande"
                value={dit?.objet}
              ></FieldReadOnly>
              <FieldReadOnly
                label="Detail de la demande"
                value={dit?.details}
              ></FieldReadOnly>

              {/* Traits */}
              <div className="grid md:grid-cols-3 gap-2">
                {traitsFields.map((field) => (
                  <FieldReadOnly key={field.label} {...field}></FieldReadOnly>
                ))}
              </div>
            </div>
          </ViewSection>
        </div>

        {/* OR et commande */}
        <div className="grid md:grid-cols-2 p-2 gap-4">
          {/* OR */}
          <div className="gap-6 ">
            <ViewSection title="OR">
              <div className="flex gap-2">
                <FieldReadOnly
                  label="Numero OR"
                  value={dit?.numeroDemandeIntervention ?? ""}
                />
                <FieldReadOnly label="Statut Or" value={dit?.statutOr ?? ""} />
              </div>
              <FieldReadOnly
                label="Section Affectéé"
                value={dit?.sectionAffectee ?? ""}
              />
            </ViewSection>
          </div>

          {/* Commande */}
          <div className="gap-6">
            <ViewSection title={"Commande"}>
              <div className="flex flex-col gap-2 max-h-75 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white ">
                    <TableRow>
                      <TableHead className=" wrap-break-word whitespace-normal max-w-30 text-center">
                        N°
                      </TableHead>
                      <TableHead className=" wrap-break-word whitespace-normal max-w-30 text-center">
                        Date
                      </TableHead>
                      <TableHead className=" wrap-break-word whitespace-normal max-w-30 text-center">
                        Statut
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCommandes.map((cmd) => (
                      <TableRow
                        key={cmd.id}
                        className="font-mono text-gray-600  wrap-break-word whitespace-normal text-center"
                      >
                        <TableCell>{cmd.numero}</TableCell>
                        <TableCell>{formatDate(cmd.date)}</TableCell>
                        <TableCell>
                          <span className={""}>{cmd.statut}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ViewSection>
          </div>
        </div>
        {/* Agence et services */}
        <div className="gap-6">
          <ViewSection title="Agence et services">
            <div className="flex gap-2">
              <FieldReadOnly
                label="Debiteur"
                value={dit?.agenceDebiteur}
              ></FieldReadOnly>
              <FieldReadOnly
                label="Emetteur"
                value={dit?.agenceEmetteur}
              ></FieldReadOnly>
            </div>
          </ViewSection>
        </div>
        {/* Intervention */}
        <div className="gap-6">
          <ViewSection title="Info Client">
            <div className="flex gap-2">
              {interventionFields.map((field) => (
                <FieldReadOnly key={field.label} {...field} />
              ))}
            </div>
          </ViewSection>
        </div>
        {/* Info Client */}
        <div className="gap-6">
          <ViewSection title="Info Client">
            <div className="flex gap-2">
              {clientFields.map((field) => (
                <FieldReadOnly key={field.label} {...field} />
              ))}
            </div>
          </ViewSection>
        </div>
        {/* Reparation */}
        <div className="gap-6">
          <ViewSection title="Réparation">
            <div className="md:flex gap-2">
              {typeReparationFields.map((field) => (
                <FieldReadOnly key={field.label} {...field} />
              ))}
            </div>
          </ViewSection>
        </div>
        {/* Information Matériel */}
        <div className="gap-6">
          <ViewSection title="Information Matériel">
            <MaterielInfoCard materiel={materiel} />
          </ViewSection>
        </div>
        {/* Pieces Jointes */}
        <div className="gap-6">
          <ViewSection title="Piece jointe">
            <div className="flex flex-col gap-2">
              {pieceJointeFields.map((field) => (
                <div key={field.label}>
                  <div className="flex flex-col gap-1 ">
                    {field.value?.length ? (
                      field.value.map((file: any, index: number) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          className="text-sm hover:text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Paperclip className="w-4 h-4" /> {file.nom}
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Aucune pièce jointe
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ViewSection>
        </div>
        {/* Bilan financière */}
        <div className="gap-6">
          <ViewSection title="Bilan financière">
            <BilanFinanciereCard bilan={bilanFinancier}></BilanFinanciereCard>
          </ViewSection>
        </div>
      </div>
    </div>
  );
}

export default DitView;
