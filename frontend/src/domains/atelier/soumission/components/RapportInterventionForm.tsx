import { useForm } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import { rapportInterventionSchema } from "../schema/rapportInterventionSchema";
import {
  ditFields,
  interventionFields,
  pieceJointeFields,
} from "../schema/rapportInterventionField";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};
function RapportInterventionForm({ mutation }: Props) {
  let params = useParams();

  const form = useForm({
    defaultValues: {
      numeroDit: params.numeroDemandeIntervention ?? "",
      numeroDevis: params.numeroDevis ?? "123",
      interventions: [],
      pieceJointe: [] as File[],
    },
    validators: {
      onSubmit: rapportInterventionSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className=" mx-auto p-4 md:p-6 overflow-auto">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION VALIDATION - Validation atelier
        </h1>
      </div>
      <form
        id="validation-atelier-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className=" border border-t-0 p-10 space-y-6  mx-auto "
      >
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex gap-2 lg:flex-row flex-col">
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
            <div>
              {interventionFields.map((config) => (
                <form.Field
                  key={config.name}
                  name={config.name as never}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const selectedLength = Array.isArray(field.state.value)
                      ? field.state.value.length
                      : field.state.value
                        ? 1
                        : 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-semibold"
                          >
                            {config.label}
                          </FieldLabel>

                          {config.type === "multichoice-table" && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {selectedLength} sélectionné
                              {selectedLength > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

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
            {pieceJointeFields.map((config) => (
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
          {/* --- File Preview Section --- */}
          <form.Subscribe selector={(state) => state.values.pieceJointe}>
            {(pieceJointe) => {
              const filesToPreview: File[] = Array.isArray(pieceJointe)
                ? pieceJointe
                : pieceJointe
                  ? [pieceJointe]
                  : [];
              return <DocumentViewer files={filesToPreview}></DocumentViewer>;
            }}
          </form.Subscribe>
        </div>

        {/* Submit Buttons */}
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
      </form>
    </div>
  );
}

export default RapportInterventionForm;
