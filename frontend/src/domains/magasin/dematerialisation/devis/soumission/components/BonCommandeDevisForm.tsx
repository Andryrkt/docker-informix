import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useParams } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import { BonCommandeDevisSchema } from "../schema/bcDevisSchema";
import {
  devisAndBcField,
  devisBcPieceJointes,
  observationFields,
} from "../schema/bcDevisField";

type Props = {
  mutation: UseMutationResult<any, any, any>;
};
function BonCommandeDevisForm({ mutation }: Props) {
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
    } as {
      numeroDevis?: string;
      numeroBc: string;
      dateBc: string;
      montantBc: string;
      pieceJointeBc?: File[];
      pieceJointes?: File[];
      validationPm?: boolean;
      tacheValidateur?: string[];
    },
    validators: {
      onSubmit: BonCommandeDevisSchema,
    },

    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

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
