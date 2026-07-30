import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import { BonCommandeDevisSchema } from "../schema/bcDevisSchema";
import {
  devisAndBcField,
  devisBcPieceJointes,
  observationFields,
} from "../schema/bcDevisField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { LineItem } from "../../schema/devisSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  mutation: UseMutationResult<any, any, any>;
  initialLines?: LineItem[];
};
function BonCommandeDevisForm({ mutation, initialLines = [] }: Props) {
  let params = useParams();

  const form = useForm({
    defaultValues: {
      numeroDevis: params.numeroDevis || "",
      numeroBc: "",
      dateBc: "",
      montantBc: "",
      pieceJointeBc: [] as File[] | undefined,
      pieceJointes: [] as File[] | undefined,
      validationPm: false,
      tacheValidateur: [] as string[] | undefined,
      lignes: initialLines.map((line) => ({
        ...line,
        nouvelleQte: line.qte,
      })),
    } as {
      numeroDevis?: string;
      numeroBc: string;
      dateBc: string;
      montantBc: string;
      pieceJointeBc?: File[];
      pieceJointes?: File[];
      validationPm?: boolean;
      tacheValidateur?: string[];
      lignes: LineItem[];
    },
    validators: {
      onChange: BonCommandeDevisSchema,
      onSubmit: BonCommandeDevisSchema,
    },

    onSubmit: async ({ value }) => {
      console.log(value);
      await mutation.mutateAsync(value);
    },
  });
  const [showTable, setShowTable] = useState(true);
  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION BON DE COMMANDE NEG
        </h1>
      </div>
      <form
        id="bon-de-commande-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className=" border border-t-0 p-5 space-y-6  mx-auto "
      >
        <div>
          <div className="gap-4 flex flex-col">
            <div className="  flex lg:flex-row flex-col gap-4  ">
              {devisAndBcField.map((config) => (
                <form.Field
                  key={config.name}
                  name={config.name as never}
                  children={(field) => {
                    const isInvalid =
                      (field.state.meta.isTouched || form.state.isSubmitted) &&
                      !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-semibold"
                        >
                          {config.label}
                        </FieldLabel>

                        <FieldRenderer
                          field={{
                            ...config,
                            value: field.state.value,
                            onChange: field.handleChange,
                            onBlur: field.handleBlur,
                          }}
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                ></form.Field>
              ))}
            </div>
            <div className="flex gap-x-10 gap-y-2 lg:flex-row flex-col ">
              {devisBcPieceJointes.map((config) => (
                <form.Field
                  key={config.name}
                  name={config.name as never}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-semibold"
                        >
                          {config.label}
                        </FieldLabel>

                        <FieldRenderer
                          field={{
                            ...config,
                            value: field.state.value,
                            onChange: field.handleChange,
                          }}
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                ></form.Field>
              ))}
            </div>
            <div className="  grid lg:grid-cols-2 gap-4  ">
              <div className="flex gap-2 flex-col">
                {observationFields.map((config) => (
                  <form.Field
                    key={config.name}
                    name={config.name as never}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-semibold"
                          >
                            {config.label}
                          </FieldLabel>

                          <FieldRenderer
                            field={{
                              ...config,
                              value: field.state.value,
                              onChange: field.handleChange,
                              onBlur: field.handleBlur,
                            }}
                          />

                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Field orientation="horizontal" className=" flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark lg:p-4"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Enregistrer
              </>
            )}
          </Button>
        </Field>

        <div className="flex items-center gap-2 pb-1 border-b-2 border-brand-primary">
          <h3 className="text-lg font-semibold text-brand-dark ">
            Tableau des lignes :
          </h3>
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="text-muted-foreground hover:text-brand-primary transition-colors "
            aria-label={
              showTable ? "Masquer le tableau" : "Afficher le tableau"
            }
          >
            {showTable ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {showTable && (
          <div className="w-full overflow-auto relative max-h-60">
            <Table className="min-w-max text-xs">
              <TableHeader className="bg-white sticky top-0 z-20">
                <TableRow className="bg-white border-b">
                  <TableHead>N° Ligne</TableHead>
                  <TableHead>Constructeur</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead>Prix HT</TableHead>
                  <TableHead>Montant net</TableHead>
                  <TableHead>%Remise 1</TableHead>
                  <TableHead>%Remise 2</TableHead>
                  <TableHead>R.A.S</TableHead>
                  <TableHead>Qté à modifier</TableHead>
                  <TableHead>Ligne à supprimer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Using mode="array" – your preferred approach */}
                <form.Field name="lignes" mode="array">
                  {(field) => {
                    return (
                      <>
                        {field.state.value.map(
                          (line: LineItem, index: number) => {
                            // Use each line’s numeroLigne for the row id (if unique)
                            const rowId = `row-${line.numeroLigne}`;
                            return (
                              <TableRow key={rowId} className="border-b">
                                {/* Display fields (read‑only) */}
                                <TableCell>{line.numeroLigne}</TableCell>
                                <TableCell className="text-center">
                                  {line.constructeur}
                                </TableCell>
                                <TableCell>{line.ref}</TableCell>
                                <TableCell>{line.designation}</TableCell>
                                <TableCell className="text-center">
                                  {line.qte}
                                </TableCell>
                                <TableCell>{line.prixHt.toFixed(2)}</TableCell>
                                <TableCell>
                                  {line.montantNet.toFixed(2)}
                                </TableCell>
                                <TableCell>{line.remise1.toFixed(2)}</TableCell>
                                <TableCell>{line.remise2.toFixed(2)}</TableCell>

                                {/* R.A.S checkbox */}
                                <TableCell>
                                  <form.Field name={`lignes[${index}].ras`}>
                                    {(subField) => (
                                      <Checkbox
                                        checked={subField.state.value}
                                        onCheckedChange={(checked) =>
                                          subField.handleChange(!!checked)
                                        }
                                      />
                                    )}
                                  </form.Field>
                                </TableCell>

                                {/* Qté à modifier */}
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <form.Field
                                      name={`lignes[${index}].qteModifier`}
                                    >
                                      {(subField) => (
                                        <Checkbox
                                          checked={subField.state.value}
                                          // onCheckedChange={(checked) =>
                                          //   subField.handleChange(!!checked)
                                          // }
                                        />
                                      )}
                                    </form.Field>
                                    <form.Field
                                      name={`lignes[${index}].nouvelleQte`}
                                    >
                                      {(subField) => {
                                        const isInvalid =
                                          (subField.state.meta.isTouched ||
                                            form.state.isSubmitted) &&
                                          !subField.state.meta.isValid;
                                        return (
                                          <div className="flex flex-col items-center">
                                            <Input
                                              type="number"
                                              value={subField.state.value ?? ""}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value),
                                                )
                                              }
                                              className={cn(
                                                "w-16 h-8 text-xs",
                                                isInvalid &&
                                                  "border-red-500 focus-visible:ring-red-500",
                                              )}
                                              disabled={!line.qteModifier}
                                            />
                                          
                                          </div>
                                        );
                                      }}
                                    </form.Field>
                                    <span
                                      id={`qty-status-${line.numeroLigne}`}
                                      className="status-badge hidden"
                                    />
                                  </div>
                                </TableCell>

                                {/* Ligne à supprimer */}
                                <TableCell>
                                  <form.Field
                                    name={`lignes[${index}].supprimer`}
                                  >
                                    {(subField) => (
                                      <Checkbox
                                        checked={subField.state.value}
                                        // onCheckedChange={(checked) =>
                                        //   subField.handleChange(!!checked)
                                        // }
                                      />
                                    )}
                                  </form.Field>
                                </TableCell>

                                {/* Hidden numeroLigne (if needed for the form) */}
                                <form.Field
                                  name={`lignes[${index}].numeroLigne`}
                                >
                                  {(subField) => (
                                    <input
                                      type="hidden"
                                      value={subField.state.value}
                                    />
                                  )}
                                </form.Field>
                              </TableRow>
                            );
                          },
                        )}
                        {/* Optional: Add a button to push new rows (example) */}
                        {/* <TableRow>
                        <TableCell colSpan={12}>
                          <button
                            type="button"
                            onClick={() =>
                              field.pushValue({
                                numeroLigne: field.state.value.length + 1,
                                constructeur: "",
                                ref: "",
                                designation: "",
                                qte: 0,
                                prixHt: 0,
                                montantNet: 0,
                                remise1: 0,
                                remise2: 0,
                                ras: true,
                                qteModifier: false,
                                nouvelleQte: undefined,
                                supprimer: false,
                              })
                            }
                            className="text-sm text-brand-primary underline"
                          >
                            + Ajouter une ligne
                          </button>
                        </TableCell>
                      </TableRow> */}
                      </>
                    );
                  }}
                </form.Field>
              </TableBody>
            </Table>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10 ">
          <form.Subscribe selector={(state) => state.values.pieceJointeBc}>
            {(pieceJointeBc) => {
              const filesToPreview: File[] = Array.isArray(pieceJointeBc)
                ? pieceJointeBc
                : pieceJointeBc
                  ? [pieceJointeBc]
                  : [];
              return (
                <DocumentViewer
                  title="Prévisualisation du BC"
                  files={filesToPreview}
                ></DocumentViewer>
              );
            }}
          </form.Subscribe>
          <form.Subscribe selector={(state) => state.values.pieceJointes}>
            {(pieceJointes) => {
              const filesToPreview: File[] = Array.isArray(pieceJointes)
                ? pieceJointes
                : pieceJointes
                  ? [pieceJointes]
                  : [];
              return <DocumentViewer files={filesToPreview}></DocumentViewer>;
            }}
          </form.Subscribe>
        </div>
        {/* Submit Buttons */}
      </form>
    </div>
  );
}

export default BonCommandeDevisForm;
