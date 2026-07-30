import { useForm } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import { verificationPrixDevisSchema } from "../schema/VerificationPrixDevisSchema";
import {
  devisField,
  pieceJointesVerificationPrixDevixFields,
  TACHE_VALIDATEUR,
  verificationPrixDevisFields,
} from "../schema/devisField";
import { normalizeFiles } from "@/lib/utils";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};

function VerificationPrixDevisForm({ mutation }: Props) {
  let params = useParams();

  const form = useForm({
    defaultValues: {
      numeroDevis: params.numeroDevis || "",
      pieceJointes: [] as File[],
      tacheValidateur: [TACHE_VALIDATEUR[0].value] as string[],
      pieceJointeExcel: [] as File[],
      pieceJointeDevis: [] as File[],
      validationPm: false,
    },
    validators: {
      onSubmit: verificationPrixDevisSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          Soumission Devis Neg Verification De Prix
        </h1>
      </div>
      <form
        id="verification-prix-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (mutation.isPending) return;
          form.handleSubmit();
        }}
        className=" border border-t-0 p-10 space-y-6  mx-auto "
      >
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex gap-2">
              {devisField.map((config) => (
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
            <form.Subscribe selector={(state) => state.values.validationPm}>
              {(validationPm) => {
                const isValidatePm = validationPm === false;
                return (
                  <>
                    {verificationPrixDevisFields.map((config) => (
                      <form.Field
                        key={config.name}
                        name={config.name as never}
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          const shouldDisable =
                            config.name === "tacheValidateur" && isValidatePm;

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
                                  disabled: shouldDisable,
                                }}
                              />

                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                      />
                    ))}
                  </>
                );
              }}
            </form.Subscribe>
          </div>
          <div className="flex gap-4">
            {pieceJointesVerificationPrixDevixFields.map((config) => (
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
        <div className="grid lg:grid-cols-2 gap-10">
          {/* --- File Preview Section --- */}
          <form.Subscribe selector={(state) => [state.values.pieceJointeDevis]}>
            {([pj1]) => {
              // Combine all arrays into one unique array of files
              const allFiles = [...normalizeFiles(pj1)];

              return (
                <DocumentViewer
                  title="Prévisualisation du devis"
                  files={allFiles}
                />
              );
            }}
          </form.Subscribe>
          {/* --- File Preview Section --- */}
          <form.Subscribe
            selector={(state) => [
              state.values.pieceJointeExcel,
              state.values.pieceJointes,
            ]}
          >
            {([pj2, pj3]) => {
              // Combine all arrays into one unique array of files
              const allFiles = [...normalizeFiles(pj2), ...normalizeFiles(pj3)];

              return (
                <DocumentViewer
                  title="Prévisualisation des autres documents"
                  files={allFiles}
                />
              );
            }}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}

export default VerificationPrixDevisForm;
