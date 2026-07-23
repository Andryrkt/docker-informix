import type { Materiel } from "../schema/materielSchema";
import { cn } from "@/lib/utils"; // or wherever your cn helper is

type MaterielInfoCardProps = {
  materiel?: Materiel | null;
  className?: string;
  itemClassName?: string;
};

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted/30 px-1 py-0.5 rounded", className)}>
      <p className="text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold truncate">{value ?? "—"}</p>
    </div>
  );
}

export function MaterielInfoCard({
  materiel,
  className,
  itemClassName,
}: MaterielInfoCardProps) {
  if (!materiel) {
    return (
      <div
        className={cn(
          "border border-dashed p-4 text-center text-xs text-muted-foreground w-full",
          className,
        )}
      >
        Sélectionnez un matériel pour afficher ses informations.
      </div>
    );
  }

  const items = [
    { label: "ID Matériel", value: materiel.idMateriel },
    { label: "N° Série", value: materiel.numSerie },
    { label: "N° Parc", value: materiel.numParc },
    { label: "Constructeur", value: materiel.constructeur },
    { label: "Désignation", value: materiel.designation },
    { label: "Modèle", value: materiel.modele },
    { label: "KM", value: materiel.km },
    { label: "Heures", value: materiel.heures },
    { label: "Casier", value: materiel.casier },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {items.map((item) => (
        <InfoItem
          key={item.label}
          label={item.label}
          value={item.value}
          className={itemClassName}
        />
      ))}
    </div>
  );
}
