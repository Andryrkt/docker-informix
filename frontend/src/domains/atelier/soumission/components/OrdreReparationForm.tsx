import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  ditFields,
  observationFields,
  pieceJointeFields,
} from "../schema/ordreReparationField";
import { ordreReparationSchema } from "../schema/ordreReparationSchema";
import { normalizeFiles } from "@/lib/utils";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};
function OrdreReparationForm({ mutation }: Props) {
  let params = useParams();

  const form = useForm({
    defaultValues: {
      numeroDit: params.numeroDemandeIntervention ?? "",
      numeroDevis: params.numeroDevis ?? "123",
      observation: "",

      pieceJointe1: [] as File[],
      pieceJointe2: [],
      pieceJointe3: [],
      pieceJointe4: [],
    },
    validators: {
      onSubmit: ordreReparationSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className=" mx-auto">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION OR
        </h1>
      </div>
      <form
        id="validation-atelier-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className=" border border-t-0 py-5 px-10 gap-6   mx-auto "
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
            <div className="grid lg:grid-cols-2 gap-5">
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
                          className="font-semibol"
                        >
                          {config.label}
                        </FieldLabel>

                        <FieldRenderer
                          field={{
                            ...config,
                            value: field.state.value,
                            onChange: field.handleChange,
                            // 👇 OCR validation
                            ocrValidation: ["Hajaina"], // requires both words
                            // or ocrValidation: "facture",        // requires at least one
                            // or ocrValidation: (text) => text.includes("facture") && text.length > 100,
                            ocrLanguage: "fra",
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
          {/* --- File Preview Section --- */}
          <form.Subscribe
            selector={(state) => [
              state.values.pieceJointe1,
              state.values.pieceJointe2,
              state.values.pieceJointe3,
              state.values.pieceJointe4,
            ]}
          >
            {([pj1, pj2, pj3, pj4]) => {
              // Combine all arrays into one unique array of files
              const allFiles = [
                ...normalizeFiles(pj1),
                ...normalizeFiles(pj2),
                ...normalizeFiles(pj3),
                ...normalizeFiles(pj4),
              ];

              return <DocumentViewer files={allFiles} />;
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

export default OrdreReparationForm;
