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
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { formatErrorMessage } from "@/lib/utils";
import { ditFormSchema, type DitFormValues } from "../schema/ditSchema";
import { Loader2, Save } from "lucide-react";
import { getMateriels } from "@/domains/materiel/api/materielApi";
import { useQuery } from "@tanstack/react-query";
import { MaterielInfoCard } from "@/domains/materiel/components/MaterielInfoCard";
import { getClients } from "@/domains/client/api/clientApi";
import { fetchDitDefaults } from "../api/ditApi";
import { getAgences } from "@/domains/agence/api";
import NiveauUrgenceModal from "./NiveauUrgenceModal";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import type { Client } from "@/domains/client/schema/clientSchema";

type Props = {
  initialValues?: DitFormValues;
  onSubmitDit: (values: any) => Promise<void> | void;
  mode?: "create" | "duplication";
};

function DitForm({ initialValues, onSubmitDit, mode = "create" }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

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

      agenceEmetteur: "",
      serviceEmmetteur: "",

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
      console.log(value);
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

  const agenceDebiteurValue = useStore(
    form.store,
    (state) => state.values.agenceDebiteur,
  );
  const interneExterneValue = useStore(
    form.store,
    (state) => state.values.interneExterne,
  );
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  // Même clé/fonction que la query interne du champ "agenceDebiteur" (voir
  // ditSchemaField.tsx : queryKey "agences") — un seul fetch réseau partagé,
  // pour pouvoir filtrer le service débiteur par agence côté client, sans
  // requête supplémentaire à chaque changement (même principe que
  // TikCreationForm).
  const { data: agencesDebiteur = [] } = useQuery({
    queryKey: ["filter-options", "agences"],
    queryFn: getAgences,
    staleTime: 1000 * 60 * 10,
  });

  const servicesDebiteurOptions = useMemo(() => {
    if (!agenceDebiteurValue) return [];
    return (
      agencesDebiteur.find((a) => a.value === agenceDebiteurValue)?.services ??
      []
    );
  }, [agencesDebiteur, agenceDebiteurValue]);

  const { data: materiels = [] } = useQuery({
    queryKey: ["materiels"],
    queryFn: getMateriels,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Agence/service émetteur par défaut de l'utilisateur (lecture seule sur le
  // formulaire) — non applicable en duplication, où les valeurs viennent déjà
  // de initialValues.
  const { data: defaults } = useQuery({
    queryKey: ["dit", "defaults"],
    queryFn: fetchDitDefaults,
    enabled: mode === "create",
  });

  useEffect(() => {
    if (mode !== "create" || !defaults) return;

    if (defaults.agenceEmetteur) {
      form.setFieldValue(
        "agenceEmetteur",
        `${defaults.agenceEmetteur.code} ${defaults.agenceEmetteur.name}`,
      );
      // Agence débiteur par défaut = agence émetteur, tant que l'utilisateur
      // n'a pas déjà choisi autre chose (champ éditable, contrairement à l'émetteur).
      if (!form.getFieldValue("agenceDebiteur")) {
        form.setFieldValue(
          "agenceDebiteur",
          String(defaults.agenceEmetteur.id),
        );
      }
    }
    if (defaults.serviceEmetteur) {
      form.setFieldValue(
        "serviceEmmetteur",
        `${defaults.serviceEmetteur.code} ${defaults.serviceEmetteur.name}`,
      );
      if (!form.getFieldValue("serviceDebiteur")) {
        form.setFieldValue(
          "serviceDebiteur",
          String(defaults.serviceEmetteur.id),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults, mode]);

  // Reset des champs propres à l'autre mode (INTERNE <-> EXTERNE) quand
  // interneExterne change réellement — un useEffect, pas un effet de bord
  // dans le rendu de form.Subscribe (qui se ré-exécuterait à chaque re-render
  // du composant, écrasant en boucle les valeurs par défaut agence/service).
  // Comparaison à la valeur précédente (pas un simple flag "premier rendu") :
  // au montage, `defaults` est déjà résolu grâce au loader de la route, et le
  // double-appel des effets en StrictMode (dev) rejouerait un flag "premier
  // rendu" une seconde fois avec la même valeur — ce qui déclencherait quand
  // même le reset et effacerait le pré-remplissage.
  const previousInterneExterneRef = useRef(interneExterneValue);
  useEffect(() => {
    const previous = previousInterneExterneRef.current;
    previousInterneExterneRef.current = interneExterneValue;

    if (mode !== "create" || previous === interneExterneValue) return;

    if (interneExterneValue === "INTERNE") {
      form.setFieldValue("agenceDebiteur", "");
      form.setFieldValue("serviceDebiteur", "");
      form.setFieldValue("numClient", "");
      form.setFieldValue("telephoneClient", "");
      form.setFieldValue("nomClient", "");
      form.setFieldValue("emailClient", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interneExterneValue, mode]);

  // Clients options values
  const numeroClientOptions = clients;
  const nomClientOptions = clients;

  // Materiels options values
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

      {errors.length > 0 && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm max-w-6xl mx-auto mt-4 mb-2">
          {errors.map((err, index) => (
            <p key={index}>{String(err)}</p>
          ))}
        </div>
      )}

      <form.Subscribe selector={(state) => state.values.interneExterne}>
        {(interneExterneValue) => {
          const isInterne = interneExterneValue === "INTERNE";
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
                          {debiteurFields.map((config) => {
                            const isAgenceDebiteur =
                              config.name === "agenceDebiteur";
                            const isServiceDebiteur =
                              config.name === "serviceDebiteur";

                            return (
                              <form.Field
                                key={config.name}
                                name={config.name as never}
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                  const shouldDisable =
                                    (isAgenceDebiteur || isServiceDebiteur) &&
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
                                          // Agence débiteur : le queryFn déclaré dans
                                          // ditSchemaField (stub renvoyant toujours []) est
                                          // remplacé par la liste déjà chargée ci-dessus, pour
                                          // que la valeur pré-remplie par défaut (useEffect
                                          // "defaults") ait une option à laquelle se raccrocher.
                                          ...(isAgenceDebiteur && {
                                            options: agencesDebiteur,
                                            enabled: false,
                                          }),
                                          // Service débiteur filtré par l'agence débiteur sélectionnée,
                                          // à partir de la liste agences+services déjà chargée — pas de
                                          // requête réseau à chaque changement (même principe que
                                          // TikCreationForm).
                                          ...(isServiceDebiteur && {
                                            options: servicesDebiteurOptions,
                                            enabled: false,
                                          }),
                                          value: field.state.value,
                                          onChange: (value: string) => {
                                            field.handleChange(value);
                                            if (isAgenceDebiteur) {
                                              form.setFieldValue(
                                                "serviceDebiteur",
                                                "",
                                              );
                                            }
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
                            );
                          })}
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
                                      className=" font-semibold gap-1.5"
                                    >
                                      {config.label}
                                      {config.name === "worNiveauUrgence" && (
                                        <NiveauUrgenceModal />
                                      )}
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
                  disabled={isSubmitting}
                  className="bg-brand-primary/70 hover:bg-brand-primary text-brand-dark cursor-pointer lg:p-4"
                >
                  {isSubmitting ? (
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
          );
        }}
      </form.Subscribe>
    </div>
  );
}

export default DitForm;
