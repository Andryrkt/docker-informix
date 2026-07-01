export interface BilanFinancier {
  chiffreAffaire: number;
  chargeEntretien: number;
  chargeLocative: number;
  resultatExploitation: number;
  coutAcquisition: number;
  amortissement: number;
  vnc: number;
}
type BilanFinanciereCardProps = {
  bilan?: BilanFinancier | null;
};

function InfoItem({
  label,
  value,
  // suffix,
  // suffixColor,
}: {
  label: string;
  value?: string | number | null;
  // suffix?: string;
  // suffixColor?: string;
}) {
  // Mettre dans Utils
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : (value ?? "—");

  return (
    <div className="bg-muted/30">
      <p className="text-[0.6rem] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold flex items-center gap-1">
        {formattedValue}

        {/* {suffix && (
          <span className={`text-[0.65rem] font-bold ${suffixColor}`}>
            ({suffix})
          </span>
        )} */}
      </p>
    </div>
  );
}

export function BilanFinanciereCard({ bilan }: BilanFinanciereCardProps) {
  // const rentabilite =
  //   bilan?.chiffreAffaire !== 0
  //     ? (bilan.resultatExploitation / bilan.chiffreAffaire) * 100
  //     : 0;
  // const isPositive = rentabilite >= 0;

  if (!bilan) {
    return (
      <div className="border border-dashed p-4 text-center text-xs text-muted-foreground w-full">
        Aucun bilan financier disponible.
      </div>
    );
  }

  const leftItems = [
    {
      label: "CA",
      value: bilan.chiffreAffaire,
    },
    {
      label: "Charge d'entretien",
      value: bilan.chargeEntretien,
    },
    {
      label: "Charge locative",
      value: bilan.chargeLocative,
    },
    {
      label: "Résultat d'exploitation",
      value: bilan.resultatExploitation,
    },
  ];
  const rightItems = [
    {
      label: "Coût d'acquisition",
      value: bilan.coutAcquisition,
    },
    {
      label: "Amortissement",
      value: bilan.amortissement,
    },
    {
      label: "VNC",
      value: bilan.vnc,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Colonne gauche */}
      <div className="flex flex-col gap-2">
        {leftItems.map((item) => (
          <InfoItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      {/* Colonne droite */}
      <div className="flex flex-col gap-2">
        {rightItems.map((item) => (
          <InfoItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}
