import { useForm } from "@tanstack/react-form";
// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { supportFormSchema } from "../schema/demandeSupportSchema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  agenceServiceFields,
  dateCategorieFields,
  demandeFields,
  parcSocieteFields,
  pieceJointeFields,
} from "../schema/demandeSupportSchemafield";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { useState } from "react";
import { createSupport } from "../api/supportIT";
import { formatErrorMessage } from "@/lib/utils";

export default function SupportITForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      object: "",
      details: "",
      agenceDebiteur: "",
      serviceDebiteur: "",
      agenceEmetteur: "",
      serviceEmmetteur: "",
      categorie: "",
      dateFinSouhaite: "",
      parcInformatique: "",
      codeSociete: "",
      pieceJointes: [],
    },
    validators: {
      // onBlur: supportFormSchema,
      onSubmit: supportFormSchema,
    },

    onSubmit: async ({ value }) => {
      setErrors([]);
      try {
        await createSupport(value);
      } catch (error: any) {
        const message = await formatErrorMessage(
          error,
          "Échec de la connexion.",
        );
        setErrors([message]);
      }
    },
  });

  const debiteurFields = agenceServiceFields.filter((field) =>
    ["agenceDebiteur", "serviceDebiteur"].includes(field.name),
  );

  const emetteurFields = agenceServiceFields.filter((field) =>
    ["agenceEmetteur", "serviceEmmetteur"].includes(field.name),
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Demande de Support
        </h1>
        <p className="text-sm text-muted-foreground">
          Remplissez les informations ci-dessous pour soumettre votre demande de
          support.
        </p>
      </div>

      <form
        id="demande-support-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6 border p-4"
      >
        {/* ROW 1: Section Demande & Section Agence (Side by Side) */}
        <div className="grid gid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Demande */}
          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Demande</h3>
            </div>
            <div className="space-y-4 ">
              {demandeFields.map((config) => (
                <form.Field
                  key={config.name}
                  name={config.name as never}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
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

          {/* Section Agence et Service*/}
          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Agence et service</h3>
            </div>
            <div className="space-y-4 flex gap-4  ">
              <div className="flex flex-col gap-4 w-full">
                {debiteurFields.map((config) => (
                  <form.Field
                    key={config.name}
                    name={config.name as never}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
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
              <div className="flex flex-col gap-4 w-full">
                {emetteurFields.map((config) => (
                  <form.Field
                    key={config.name}
                    name={config.name as never}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
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
          </div>
        </div>
        <Separator></Separator>
        {/* ROW 2: Section Autre informations et Piece Joints (Side by Side) */}
        <div className="grid gid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Autre informations */}
          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Autres informations</h3>
            </div>
            <div className="space-y-4 flex gap-4  ">
              <div className="flex flex-col gap-4 w-full">
                {dateCategorieFields.map((config) => (
                  <form.Field
                    key={config.name}
                    name={config.name as never}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
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
              <div className="flex flex-col gap-4 w-full">
                {parcSocieteFields.map((config) => (
                  <form.Field
                    key={config.name}
                    name={config.name as never}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
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
          </div>

          {/* Section Piece Joints */}
          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Piece jointes</h3>
            </div>
            <div className="space-y-4 flex gap-4  ">
              <div className="flex flex-col gap-4 w-full">
                {pieceJointeFields.map((config) => (
                  <form.Field key={config.name} name={config.name as never}>
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            {config.label}
                          </FieldLabel>

                          {/* Le FieldRenderer reçoit la valeur et le onChange adaptés */}
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
                  </form.Field>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <Field orientation="horizontal" className="mt-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reinitialisé
          </Button>
          <Button type="submit" form="demande-support-form">
            Envoyer
          </Button>
        </Field>
        {errors.length > 0 && (
          <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400  dark:border-red-900 mb-4">
            {errors.map((err, index) => (
              <p key={index}>{String(err)}</p>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
