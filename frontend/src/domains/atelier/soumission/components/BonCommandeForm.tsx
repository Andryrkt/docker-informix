import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import { bonCommandeSchema } from "../schema/BonCommandeSchema";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  bonCommandeFields,
  clientFields,
  detailsFields,
  devisFields,
  pieceJointeFields,
} from "../schema/bonCommandeField";
import { Separator } from "@/components/ui/separator";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};
function BonCommandeForm({ mutation }: Props) {
  let params = useParams();

  const form = useForm({
    defaultValues: {
      numeroDit: params.numeroDemandeIntervention ?? "XXXXXXX",
      numeroDevis: params.numeroDevis ?? "XXXXXXX",
      date: "2026-01-10",
      dateDevis: "2026-01-10",
      dateBonCommande: "",
      client: "",
      emailClient: "",
      montantDevis: 0,
      statutDevis: "SAMPLE",
      numeroBonCommande: "",
      description: "",
      pieceJointe: [] as File[],
    },
    validators: {
      onSubmit: bonCommandeSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark font-mono ">
          SOUMISSION BON DE COMMANDE
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
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="gap-4 flex flex-col">
            <div className="  grid lg:grid-cols-3 gap-4  ">
              {/* Devis */}
              {devisFields.map((config) => (
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
            <div className="  grid lg:grid-cols-2 gap-4  ">
              {/* Bon de commande */}
              <div className="flex gap-2 flex-col ">
                {bonCommandeFields.map((config) => (
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
              {/* clients */}
              <div className="flex gap-2 flex-col">
                {clientFields.map((config) => (
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
            <div className="flex-1">
              {detailsFields.map((config) => (
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

          {/* Separator */}

          <div className="gap-4 flex flex-col ">
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

export default BonCommandeForm;
