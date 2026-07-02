import { FieldRenderer } from "@/components/common/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  agenceAndServiceFields,
  demandeFields,
  infoClientFields,
  infoMaterielFields,
  interventionFields,
  piecesJointFields,
  reparationFields,
  traitFields,
} from "../schema/ditSchemaField";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { formatErrorMessage } from "@/lib/utils";
import { ditFormSchema, type DitFormValues } from "../schema/ditSchema";
import { Save } from "lucide-react";
import { getMateriels } from "@/domains/materiel/api/materielApi";
import { useQuery } from "@tanstack/react-query";
import { MaterielInfoCard } from "@/domains/materiel/components/MaterielInfoCard";
import { getClients } from "@/domains/client/api/clientApi";
import { useAuth } from "@/context/authContext";

type Props = {
  initialValues?: DitFormValues;
  onSubmitDit: (values: any) => Promise<void> | void;
  mode?: "create" | "duplication";
};

function DitForm({ initialValues, onSubmitDit, mode = "create" }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useAuth();

  const debiteurFields = agenceAndServiceFields.filter((field) =>
    ["agenceDebiteur", "serviceDebiteur"].includes(field.name),
  );

  const emetteurFields = agenceAndServiceFields.filter((field) =>
    ["agenceEmetteur", "serviceEmmetteur"].includes(field.name),
  );

  const form = useForm({
    defaultValues: initialValues ?? {
      // Demande
      objet: "",
      details: "",

      // Traitement
      typeDocument: "",
      categorieDemande: "",
      interneExterne: "INTERNE",
      demandeDevis: "NON",
      livraisonPartielle: "NON",
      avisRecouvrement: "NON",

      // Agence / Service
      agenceDebiteur: "",
      serviceDebiteur: "",

      agenceEmetteur: user?.agence,
      serviceEmmetteur: user?.service,

      // Intervention
      worNiveauUrgence: "",
      datePrevue: "",

      // Réparation
      typeReparation: "",
      reparationPar: "",

      // Client
      numClient: "",
      telephoneClient: "",
      nomClient: "",
      emailClient: "",
      clientSousContrat: "NON",

      // Pièces jointes
      pieceJoint: [],
      pieceJoint1: [],
      pieceJoint2: [],

      // Matériel
      idMateriel: "",
      numParc: "",
      numSerie: "",
    },
    validators: {
      onSubmit: ditFormSchema,
    },

    onSubmit: async ({ value }) => {
      setErrors([]);
      try {
        await onSubmitDit(value);
      } catch (error: any) {
        const message = await formatErrorMessage(
          error,
          "Échec de la connexion.",
        );
        setErrors([message]);
      }
    },
  });

  const { data: materiels = [] } = useQuery({
    queryKey: ["materiels"],
    queryFn: getMateriels,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Clients options values
  const numeroClientOptions = clients.map((c) => ({
    label: c.numClient,
    value: c.numClient,
  }));
  const nomClientOptions = clients.map((c) => ({
    label: c.nomClient,
    value: c.nomClient,
  }));

  // Materiels options values
  const idMaterielOptions = materiels.map((m) => ({
    label: m.idMateriel,
    value: m.idMateriel,
  }));

  const numParcOptions = materiels.map((m) => ({
    label: m.numParc,
    value: m.numParc,
  }));

  const numSerieOptions = materiels.map((m) => ({
    label: m.numSerie,
    value: m.numSerie,
  }));

  // Syncronisation Materiel
  const syncMateriel = (
    fieldName: "idMateriel" | "numParc" | "numSerie",
    value: string,
  ) => {
    let materiel;

    switch (fieldName) {
      case "idMateriel":
        materiel = materiels.find((m) => m.idMateriel === value);
        break;

      case "numParc":
        materiel = materiels.find((m) => m.numParc === value);
        break;

      case "numSerie":
        materiel = materiels.find((m) => m.numSerie === value);
        break;
    }

    if (!materiel) return;

    form.setFieldValue("idMateriel", materiel.idMateriel);
    form.setFieldValue("numParc", materiel.numParc);
    form.setFieldValue("numSerie", materiel.numSerie);
  };

  // Syncronisation Client
  const syncClient = (fieldName: "nomClient" | "numClient", value: string) => {
    let client;

    switch (fieldName) {
      case "numClient":
        client = clients.find((c) => c.numClient === value);
        break;
      case "nomClient":
        client = clients.find((c) => c.nomClient === value);
        break;
    }

    if (!client) return;

    form.setFieldValue("numClient", client.numClient);
    form.setFieldValue("nomClient", client.nomClient);
    form.setFieldValue("telephoneClient", client.telephoneClient);
    form.setFieldValue("emailClient", client.emailClient);
  };

  return (
    <div className=" mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-2 max-w-6xl  mx-auto">
        <h1 className="text-2xl font-bold text-white tracking-tight border text-center py-2 bg-brand-dark">
          {mode === "create"
            ? "Formulaire Demande d'intervention"
            : "Duplication de la demande d'intervention"}
        </h1>
      </div>

      <form.Subscribe selector={(state) => state.values.interneExterne}>
        {(interneExterneValue) => {
          const isInterne = interneExterneValue === "INTERNE";
          if (isInterne && mode === "create") {
            form.setFieldValue("agenceDebiteur", "");
            form.setFieldValue("serviceDebiteur", "");
            form.setFieldValue("numClient", "");
            form.setFieldValue("telephoneClient", "");
            form.setFieldValue("nomClient", "");
            form.setFieldValue("emailClient", "");
          }
          return (
            <form
              id="dit-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6 border border-t-0 p-10 max-w-6xl mx-auto"
            >
              <div className="grid gap-6">
                {/* Section Demande */}
                <div className="border-none">
                  <div className="space-y-4 ">
                    {demandeFields.map((config) => (
                      <form.Field
                        key={config.name}
                        name={config.name as never}
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel
                                htmlFor={field.name}
                                className=" font-semibold"
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
                {/* Section traits  */}
                <div className="border-none">
                  <div className="gap-4 lg:flex space-y-4  ">
                    {traitFields.map((config) => (
                      <form.Field
                        key={config.name}
                        name={config.name as never}
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          const shouldDisable =
                            config.name === "demandeDevis" && isInterne;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel
                                htmlFor={field.name}
                                className=" font-semibold"
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
                      ></form.Field>
                    ))}
                  </div>
                </div>
                <div className="lg:flex space-x-10  ">
                  <div className="w-full">
                    {/* Section Agence et Service*/}
                    <div className="pb-3 ">
                      <div className="pb-3 space-y-1 ">
                        <h3 className="text-base font-bold">
                          Agence et service
                        </h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex gap-x-4  ">
                        <div className="flex flex-col gap-4 w-full">
                          {debiteurFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                const shouldDisable =
                                  (config.name === "agenceDebiteur" ||
                                    config.name === "serviceDebiteur") &&
                                  !isInterne;
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
                                        disabled: shouldDisable,
                                      }}
                                    />

                                    {isInvalid && (
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>

                        {/* Emmetteur */}
                        <div className="flex flex-col gap-4 w-full">
                          {emetteurFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;

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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Section Info client*/}
                    <div className=" w-full">
                      <div className="pb-3 space-y-1  ">
                        <h3 className="text-base font-bold">Info Client</h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex gap-4  ">
                        <div className="grid md:grid-cols-2 gap-4 w-full">
                          {infoClientFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                const shouldDisable = isInterne;

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
                                        options:
                                          config.name === "numClient"
                                            ? numeroClientOptions
                                            : config.name === "nomClient"
                                              ? nomClientOptions
                                              : (config.options ?? []),
                                        value: field.state.value,
                                        onChange: (value) => {
                                          if (
                                            config.name === "numClient" ||
                                            config.name === "nomClient"
                                          ) {
                                            syncClient(config.name, value);
                                            return;
                                          }

                                          field.handleChange(value);
                                        },
                                        disabled: shouldDisable,
                                      }}
                                    />

                                    {isInvalid && (
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Section Info materiel*/}
                    <div className=" w-full ">
                      <div className="py-3  space-y-1 ">
                        <h3 className="text-base font-bold">
                          Information Matériel
                        </h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex flex-col ">
                        <div className="flex gap-4 w-full">
                          {infoMaterielFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
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
                                        options:
                                          config.name === "idMateriel"
                                            ? idMaterielOptions
                                            : config.name === "numParc"
                                              ? numParcOptions
                                              : config.name === "numSerie"
                                                ? numSerieOptions
                                                : [],
                                        value: field.state.value,

                                        onChange: (value) => {
                                          if (
                                            config.name === "idMateriel" ||
                                            config.name === "numParc" ||
                                            config.name === "numSerie"
                                          ) {
                                            syncMateriel(config.name, value);
                                            return;
                                          }

                                          field.handleChange(value);
                                        },
                                      }}
                                    />

                                    {isInvalid && (
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>
                        <div className=" ">
                          <form.Subscribe
                            selector={(state) => state.values.idMateriel}
                          >
                            {(idMateriel) => {
                              const selectedMateriel =
                                materiels.find(
                                  (m) => m.idMateriel === idMateriel,
                                ) ?? null;
                              return (
                                <MaterielInfoCard materiel={selectedMateriel} />
                              );
                            }}
                          </form.Subscribe>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full space-y-6">
                    {/* Section intervention*/}
                    <div className=" w-full  ">
                      <div className=" pb-3  space-y-1">
                        <h3 className="text-base font-bold">Intervention</h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex gap-4  ">
                        <div className="flex  gap-4 w-full">
                          {interventionFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                      htmlFor={field.name}
                                      className=" font-semibold"
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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Section réparation*/}
                    <div className=" w-full ">
                      <div className="pb-3  space-y-1 ">
                        <h3 className="text-base font-bold">Reparation</h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex gap-4  ">
                        <div className="flex gap-4 w-full">
                          {reparationFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                      htmlFor={field.name}
                                      className=" font-semibold"
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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            ></form.Field>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Section pieces Jointes*/}
                    <div className=" w-full  ">
                      <div className="pb-3  space-y-1 ">
                        <h3 className="text-base font-bold">Pièces Jointes</h3>
                        <div className="h-1 bg-brand-primary "></div>
                      </div>
                      <div className="space-y-4 flex gap-4  ">
                        <div className="flex flex-col gap-4 w-full">
                          {piecesJointFields.map((config) => (
                            <form.Field
                              key={config.name}
                              name={config.name as never}
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                      htmlFor={field.name}
                                      className=" font-semibold"
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
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
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
                </div>
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
          );
        }}
      </form.Subscribe>
    </div>
  );
}

export default DitForm;
