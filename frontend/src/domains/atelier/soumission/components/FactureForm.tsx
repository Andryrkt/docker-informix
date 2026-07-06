import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";

import { normalizeFiles } from "@/lib/utils";
import { factureSchema } from "../schema/factureSchema";
import { ditFields, pieceJointesFields } from "../schema/factureField";
import type { AnalysisResult } from "@/lib/document-analysis";
import { useState } from "react";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};
function FactureForm({ mutation }: Props) {
  let params = useParams();

  const [analysisResults, setAnalysisResults] = useState<
    Map<string, AnalysisResult>
  >(new Map());
  const form = useForm({
    defaultValues: {
      numeroDit: params.numeroDemandeIntervention ?? "",
      numeroDevis: params.numeroDevis ?? "123",
      pieceJointes: [] as File[],
    },
    validators: {
      onSubmit: factureSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className=" mx-auto">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION FACTURE
        </h1>
      </div>
      <form
        id="validation-atelier-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className=" border border-t-0 py-5 px-10 gap-6 space-y-3   mx-auto "
      >
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex gap-2">
              {ditFields.map((config) => (
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
            <div className="grid gap-5">
              {pieceJointesFields.map((config) => (
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
                          className="font-semibol"
                        >
                          {config.label}
                        </FieldLabel>

                        <FieldRenderer
                          field={{
                            ...config,
                            value: field.state.value,
                            onChange: field.handleChange,
                            ocrValidation: {
                              targetWords: ["41327617", "DIT25079237"],
                              minOccurrences: 1,
                              maxNormalizedDistance: 0.2,
                              // fieldRules: [
                              //   {
                              //     // Ordre de réparation N° 16424573
                              //     extractPattern:
                              //       /Ordre de réparation\s*N°\s*(\d+)/i,
                              //     validateValue: "16424573",
                              //     required: true,
                              //     errorMessage:
                              //       "Le numéro d'ordre de réparation est incorrect.",
                              //     penalty: 30,
                              //   },
                              //   {
                              //     // Référence demandée DIT26079999
                              //     extractPattern: /Référence demandée\s*(\S+)/i,
                              //     validateValue: "DIT26079999",
                              //     required: true,
                              //     errorMessage:
                              //       "La référence demandée est incorrecte.",
                              //     penalty: 30,
                              //   },
                              //   {
                              //     // Désignation CHARIOT ELEVATEUR
                              //     extractPattern: /Désignation\s*(.+)/i,
                              //     validatePattern: /CHARIOT ELEVATEUR/i, // accepte "Chariot élévateur" ou "CHARIOT ELEVATEUR"
                              //     required: true,
                              //     errorMessage:
                              //       "La désignation du matériel est incorrecte.",
                              //     penalty: 30,
                              //   },
                              // ],
                            },
                            onResults: setAnalysisResults,
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
          {/* --- File Preview Section --- */}
          <form.Subscribe selector={(state) => [state.values.pieceJointes]}>
            {([pj]) => {
              const allFiles = normalizeFiles(pj);

              return (
                <DocumentViewer
                  files={allFiles}
                  analysisResults={analysisResults}
                />
              );
            }}
          </form.Subscribe>
        </div>

        {/* Submit Buttons */}
        <Field orientation="horizontal" className=" flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark lg:p-6 rounded-xs"
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
      </form>
    </div>
  );
}

export default FactureForm;
