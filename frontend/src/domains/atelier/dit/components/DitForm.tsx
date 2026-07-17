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
import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { formatErrorMessage } from "@/lib/utils";
import { ditFormSchema, type DitFormValues } from "../schema/ditSchema";
import { Save } from "lucide-react";
import { getMateriels } from "@/domains/materiel/api/materielApi";
import { useQuery } from "@tanstack/react-query";
import { MaterielInfoCard } from "@/domains/materiel/components/MaterielInfoCard";
import { getClients } from "@/domains/client/api/clientApi";
import { useAuth } from "@/context/authContext";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import type { Client } from "@/domains/client/schema/clientSchema";
import { getAgences } from "@/domains/agence/api";

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

  // Pour les filtres dynamique agent > debiteur[]
  const { data: agents = [] } = useQuery({
    queryKey: ["agentServices"],
    queryFn: getAgences,
  });
  // const agents = [
  //   {
  //     label: "Agent 1",
  //     value: "1",
  //     services: [
  //       { label: "Service A", value: "A" },
  //       { label: "Service B", value: "B" },
  //     ],
  //   },
  //   {
  //     label: "Agent 2",
  //     value: "2",
  //     services: [{ label: "Service C", value: "C" }],
  //   },
  // ];

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // const dynamicFields = useMemo(() => {
  //   return debiteurFields.map((column) =>
  //     column.map((field) => {
  //       if (field.name === "agent_debiteur") {
  //         return {
  //           ...field,

  //           queryFn: async () =>
  //             agents.map((a) => ({ label: a.label, value: a.value })),
  //         };
  //       }
  //       if (field.name === "service_debiteur") {
  //         return {
  //           ...field,
  //           placeholder: !selectedAgent
  //             ? "Sélectionnez d'abord un agent débiteur"
  //             : "",
  //           selectAll: true,
  //           dependsOn: ["agent_debiteur"], // ✅ clears services when agent changes
  //           queryKey: `service_debiteur_${selectedAgent || "none"}`,
  //           queryFn: async () => {
  //             if (!selectedAgent) return [];
  //             return getServicesForAgent(selectedAgent);
  //           },
  //         };
  //       }
  //       return field;
  //     }),
  //   );
  // }, [selectedAgent]);

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

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Clients options values
  const numeroClientOptions = clients;
  const nomClientOptions = clients;

  // Materiels options values

  const { data: materiels = [] } = useQuery({
    queryKey: ["materiels"],
    queryFn: getMateriels,
  });
  const idMaterielOptions = materiels;
  const numParcOptions = materiels;
  const numSerieOptions = materiels;

  // Synchronisation Materiel
  const syncMateriel = (
    fieldName: "idMateriel" | "numParc" | "numSerie",
    selectedItem: Materiel | null | undefined,
  ) => {
    if (!selectedItem) {
      form.setFieldValue("idMateriel", "");
      form.setFieldValue("numParc", "");
      form.setFieldValue("numSerie", "");
      return;
    }
    const newId = selectedItem.idMateriel ?? "";
    const newParc = selectedItem.numParc ?? "";
    const newSerie = selectedItem.numSerie ?? "";

    // Update only if changed
    const currentId = form.getFieldValue("idMateriel");
    const currentParc = form.getFieldValue("numParc");
    const currentSerie = form.getFieldValue("numSerie");

    if (currentId !== newId) form.setFieldValue("idMateriel", newId);
    if (currentParc !== newParc) form.setFieldValue("numParc", newParc);
    if (currentSerie !== newSerie) form.setFieldValue("numSerie", newSerie);
  };

  // Syncronisation Client
  const syncClient = (
    fieldName: "numClient" | "nomClient",
    selectedItem: Client | null | undefined,
  ) => {
    // Si l'élément est null/undefined ou que c'est l'option "Aucun" (valeur vide)
    if (!selectedItem) {
      form.setFieldValue("numClient", "");
      form.setFieldValue("nomClient", "");
      form.setFieldValue("telephoneClient", "");
      form.setFieldValue("emailClient", "");
      return;
    }

    // Extraire les nouvelles valeurs
    const newNum = selectedItem.numClient ?? "";
    const newNom = selectedItem.nomClient ?? "";
    const newTel = selectedItem.telephoneClient ?? "";
    const newEmail = selectedItem.emailClient ?? "";

    // Lire les valeurs courantes
    const currentNum = form.getFieldValue("numClient");
    const currentNom = form.getFieldValue("nomClient");
    const currentTel = form.getFieldValue("telephoneClient");
    const currentEmail = form.getFieldValue("emailClient");

    // Mettre à jour uniquement si changé (évite les boucles)
    if (currentNum !== newNum) form.setFieldValue("numClient", newNum);
    if (currentNom !== newNom) form.setFieldValue("nomClient", newNom);
    if (currentTel !== newTel) form.setFieldValue("telephoneClient", newTel);
    if (currentEmail !== newEmail) form.setFieldValue("emailClient", newEmail);
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
                                        onChange: (item) => {
                                          if (
                                            config.name === "numClient" ||
                                            config.name === "nomClient"
                                          ) {
                                            syncClient(config.name, item);
                                            return;
                                          }

                                          field.handleChange(item);
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

                                        onChange: (item) => {
                                          if (
                                            config.name === "idMateriel" ||
                                            config.name === "numParc" ||
                                            config.name === "numSerie"
                                          ) {
                                            syncMateriel(config.name, item);
                                            return;
                                          }

                                          field.handleChange(item);
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
