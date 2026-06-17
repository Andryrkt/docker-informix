import { useForm } from "@tanstack/react-form";

// Shadcn UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supportFormSchema } from "../schema/demandeSupport";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { FilterFieldRenderer } from "@/components/common/filter/FilterFieldRenderer";

export default function SupportForm() {
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
      pieceJoints: "",
    },
    validators: {
      onBlur: supportFormSchema,
      onSubmit: supportFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission logic here
      console.log("Submitted Form Data:", value);
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Demande de Support
        </h1>
        <p className="text-sm text-muted-foreground">
          Remplissez les informations ci-dessous pour soumettre votre ticket.
        </p>
      </div>

      <form
        id="demande-support-rform"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
              {/* Objet */}
              <FieldGroup>
                <form.Field
                  name="object"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Object *</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder=""
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                ></form.Field>
              </FieldGroup>

              {/* Detail */}
              <FieldGroup>
                <form.Field
                  name="details"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Detail *</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder=""
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                ></form.Field>
              </FieldGroup>
            </div>
          </div>

          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Agence et service</h3>
            </div>
            <div className="space-y-4 flex gap-4  ">
              <div className="flex flex-col gap-4 w-full">
                {/* Agence debiteur */}
                <FieldGroup>
                  <form.Field
                    name="agenceDebiteur"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Agence debitteur *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>

                {/* Service debiteur */}
                <FieldGroup>
                  <form.Field
                    name="agenceDebiteurText"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Service Debitteur *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>
              </div>
              <div className="flex flex-col gap-4 w-full">
                {/* Agence emmetteur */}
                <FieldGroup>
                  <form.Field
                    name="agenceEmmetteur"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Agence Emmetteur *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>

                {/* Service emmetteur */}
                <FieldGroup>
                  <form.Field
                    name="serviceEmmetteur"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Service Emmetteur *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>
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
                {/* Categorie */}
                <FieldGroup>
                  <form.Field name="agenceDebiteur">
                    {(field) => (
                      <div className="space-y-1">
                        <label className="text-xs">{field.name}</label>
                        <FilterFieldRenderer
                          field={{
                            ...field,
                            value: field.state.value,
                            onChange: field.handleChange,
                          }}
                        />
                      </div>
                    )}
                  </form.Field>
                </FieldGroup>

                {/* Date fin souhaitéé */}
                <FieldGroup>
                  <form.Field
                    name="agenceDebiteurText"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Date fin souhaitéé *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>
              </div>
              <div className="flex flex-col gap-4 w-full">
                {/* Parc informatique */}
                <FieldGroup>
                  <form.Field
                    name="agenceEmmetteur"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Parc informatique *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>

                {/* Code societé */}
                <FieldGroup>
                  <form.Field
                    name="serviceEmmetteur"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Code societé *
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder=""
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  ></form.Field>
                </FieldGroup>
              </div>
            </div>
          </div>

          <div className="border-none">
            <div className="pb-3 ">
              <h3 className="text-base font-semibold">Piece jointes</h3>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-brand-dark hover:bg-brand-dark/90 text-white"
              >
                {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}
