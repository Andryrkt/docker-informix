import { formatErrorMessage } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { verificationPrixSchema } from "../schema/verificationPrixSchema";
import {
  ditFields,
  verificationPrixFields,
} from "../schema/verificationPrixField";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";

function VerificationPrixForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      numeroDit: "1XXXXX",
      numeroDevis: "2XXXXX",
      tachePartsManager: "VERIF_PRIX",
      pieceJointe: [] as File[],
    },
    validators: {
      onSubmit: verificationPrixSchema,
    },

    onSubmit: async ({ value }) => {
      console.log(value);
      setErrors([]);
      try {
        // await onSubmitDit(value);
      } catch (error: any) {
        const message = await formatErrorMessage(
          error,
          "Échec de la connexion.",
        );
        setErrors([message]);
      }
    },
  });

  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION DEVIS - Verification de prix Magasin
        </h1>
      </div>
      <form
        id="dit-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className=" border border-t-0 p-10 space-y-6  mx-auto "
      >
        <div className="grid lg:grid-cols-2 gap-10">
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
            {verificationPrixFields.map((config) => (
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
              return <DocumentViewer files={pieceJointe}></DocumentViewer>;
            }}
          </form.Subscribe>
        </div>

        {/* Submit Buttons */}
        <Field orientation="horizontal" className=" flex justify-end">
          <Button
            type="submit"
            form="dit-form"
            className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark cursor-pointer lg:p-4"
          >
            <Save></Save>
            Enregistrer
          </Button>
        </Field>
      </form>
    </div>
  );
}

export default VerificationPrixForm;
