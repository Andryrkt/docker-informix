import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectSeparator } from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  FieldReadOnly,
  FieldRenderer,
} from "@/components/common/renderer/FieldRenderer";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

type FormValues = {
  numeroDevis: string;
  dateRelance: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numeroDevis?: string;
  onSubmitRelance: (values: FormValues) => void;
  isLoading?: boolean;
};

function DialogRelanceDevisForm({
  open,
  onOpenChange,
  numeroDevis,
  onSubmitRelance,
  isLoading = false,
}: Props) {
  const form = useForm({
    defaultValues: {
      numeroDevis: numeroDevis,
      dateRelance: "",
    } satisfies FormValues,

    onSubmit: async ({ value }) => {
      onSubmitRelance(value);
    },
  });

  useEffect(() => {
    if (numeroDevis) {
      form.setFieldValue("numeroDevis", numeroDevis);
    }
  }, [numeroDevis, form]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pointage Relance Devis</DialogTitle>
          <DialogDescription>
            <span className="text-sm text-muted-foreground">
              Relancer le devis n°: {numeroDevis}
            </span>
          </DialogDescription>
        </DialogHeader>
        <SelectSeparator />
        <div className="space-y-3 ">
          <form
            id="relance-devis-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* ---- Numéro Devis (read-only) ---- */}
            <form.Field name="numeroDevis">
              {() => (
                <Field>
                  <FieldReadOnly label={"Numero Devis"} value={numeroDevis} />
                </Field>
              )}
            </form.Field>

            {/* ---- Date de Relance ---- */}
            <form.Field
              name="dateRelance"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Veuillez sélectionner une date." : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldRenderer
                    field={{
                      value: field.state.value,
                      onChange: field.handleChange,
                      name: field.name,
                      onBlur: field.handleBlur,
                      type: "date",
                      label: "Date de relance",
                      placeholder: "Choisir une date",
                    }}
                  />
                  {field.state.meta.errors && (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </Field>
              )}
            </form.Field>

            <Field orientation="horizontal" className=" flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Fermer
              </Button>
              <Button
                type="submit"
                form="relance-devis-form"
                className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark cursor-pointer lg:p-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    En cours...
                  </>
                ) : (
                  "Soumettre"
                )}
              </Button>
            </Field>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogRelanceDevisForm;
