import type { Devis } from '../api/devisApi';

interface DevisTableProps {
  devis: Devis[];
}

const statutColor = (statut: string | null): string => {
  if (!statut) return 'bg-gray-100 text-gray-500';
  if (statut === 'A traiter') return 'bg-yellow-100 text-yellow-700';
  if (statut.includes('Envoy')) return 'bg-blue-100 text-blue-700';
  if (statut.includes('valider')) return 'bg-purple-100 text-purple-700';
  if (statut === 'En attente bc') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-600';
};

const formatMontant = (montant: string, devise: string): string => {
  const num = parseFloat(montant);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' ' + devise;
};

export default function DevisTable({ devis }: DevisTableProps) {
  if (devis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Aucun devis trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {[
              'N° Devis', 'Date', 'Client', 'Référence', 'Montant',
              'Statut DW', 'Statut BC', 'Position', 'Créateur', 'Constructeur',
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {devis.map((d, i) => (
            <tr key={`${d.NUMERO_DEVIS}-${i}`} className="hover:bg-blue-50/40 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-blue-700 whitespace-nowrap">
                {d.NUMERO_DEVIS}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {d.DATE_CREATION}
              </td>
              <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={d.CLIENT}>
                {d.CLIENT}
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={d.REFERENCE_CLIENT}>
                {d.REFERENCE_CLIENT || '—'}
              </td>
              <td className="px-4 py-3 font-medium text-right whitespace-nowrap text-gray-800">
                {formatMontant(d.MONTANT_DEVIS, d.DEVISE)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColor(d.STATUT_DW)}`}>
                  {d.STATUT_DW || '—'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColor(d.STATUT_BC)}`}>
                  {d.STATUT_BC || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {d.POSITION_IPS || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {d.UTILISATEUR_CREATEUR_DEVIS}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {d.CONSTRUCTEUR}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
