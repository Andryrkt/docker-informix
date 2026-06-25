import type { Materiel } from "../schema/materielSchema";

type MaterielInfoCardProps = {
  materiel?: Materiel | null;
};

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className=" bg-muted/30 ">
      <p className="text-[0.6rem] font-medium  tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold">{value ?? "—"}</p>
    </div>
  );
}

export function MaterielInfoCard({ materiel }: MaterielInfoCardProps) {
  if (!materiel) {
    return (
      <div className="border border-dashed p-4 text-center text-xs text-muted-foreground w-full">
        Sélectionnez un matériel pour afficher ses informations.
      </div>
    );
  }

  const items = [
    {
      label: "Constructeur",
      value: materiel.constructeur,
    },
    {
      label: "Désignation",
      value: materiel.designation,
    },
    {
      label: "Modèle",
      value: materiel.modele,
    },
    {
      label: "N° Parc",
      value: materiel.numParc,
    },
    {
      label: "N° Série",
      value: materiel.numSerie,
    },
    {
      label: "ID Matériel",
      value: materiel.idMateriel,
    },
    {
      label: "KM",
      value: materiel.km,
    },
    {
      label: "Heures",
      value: materiel.heures,
    },
    {
      label: "Casier",
      value: materiel.casier,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <InfoItem key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
