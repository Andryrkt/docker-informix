import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectSeparator } from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { DW_DOCUMENT_OPTIONS } from "../const/menuSoumission";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Loader2 } from "lucide-react";

type FormValues = {
  document: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numeroDemandeIntervention?: string;
  onSubmitSoumissionDoc: (values: FormValues) => void;
  isLoading?: boolean;
};

function DialogSoumissionDocForm({
  open,
  onOpenChange,
  numeroDemandeIntervention,
  onSubmitSoumissionDoc,
  isLoading = false,
}: Props) {
  const form = useForm({
    defaultValues: {
      document: "",
    } satisfies FormValues,

    onSubmit: async ({ value }) => {
      onSubmitSoumissionDoc(value);
      //   onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle>Soumission document</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {numeroDemandeIntervention}
          </div>
        </DialogHeader>
        <SelectSeparator />
        <div className="space-y-3 ">
          <form
            id="dit-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="document"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Veuillez sélectionner un document." : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name} className=" font-semibold">
                    Docs à intégrer dans DW
                  </FieldLabel>
                  <FieldRenderer
                    field={{
                      name: field.name,
                      type: "select",
                      label: "Docs à intégrer dans DW",
                      placeholder: "Sélectionner un document",
                      options: DW_DOCUMENT_OPTIONS,
                      value: field.state.value,
                      onChange: field.handleChange,
                      disabled: false,
                    }}
                  />
                </Field>
                
              )}
            </form.Field>
            
            <Field orientation="horizontal" className=" flex justify-end">
              <Button
                type="submit"
                form="dit-form"
                className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark cursor-pointer lg:p-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    En cours...
                  </>
                ) : (
                  "Valider"
                )}
              </Button>
            </Field>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogSoumissionDocForm;
