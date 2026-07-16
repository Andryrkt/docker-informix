<?php

namespace App\Dit\Service;

use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\StatutDemandeRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use Symfony\Component\HttpFoundation\Request;

/**
 * Normalise les paramètres de recherche envoyés par CollapsibleFilter (voir
 * frontend ditFieldFilter.ts) en critères directement exploitables par
 * DitRepository::findPaginated(). Champs "section_support1/2/3" non repris :
 * aucune colonne équivalente sur `demande_intervention` (hors périmètre,
 * comme documenté sur l'entité Dit).
 */
final class DitFilterResolver
{
    public function __construct(
        private readonly StatutDemandeRepository $statutRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly MaterielRepository $materielRepo,
    ) {}

    /** @return array<string, mixed> */
    public function resolve(Request $request): array
    {
        $raw = fn(string $key): ?string => (($v = trim((string) $request->query->get($key, ''))) !== '') ? $v : null;

        $criteria = [];

        if (($v = $raw('numero_dit')) !== null) {
            $criteria['numeroDit'] = $v;
        }
        if (($v = $raw('numero_devis')) !== null) {
            $criteria['numeroDevis'] = $v;
        }
        if (($v = $raw('numero_or')) !== null) {
            $criteria['numeroOr'] = $v;
        }
        if (($v = $raw('section_affectee')) !== null) {
            $criteria['sectionAffectee'] = $v;
        }
        if (($v = $raw('statut_or')) !== null) {
            $criteria['statutOr'] = $v;
        }
        if (($v = $raw('statut_facture')) !== null) {
            $criteria['statutFacture'] = $v;
        }
        if (($v = $raw('utilisateur')) !== null) {
            $criteria['utilisateur'] = $v;
        }
        if (($v = $raw('realise_par')) !== null) {
            $criteria['realisePar'] = $v;
        }
        if (($v = $raw('type_document')) !== null) {
            $criteria['typeDocument'] = $v;
        }
        if (($v = $raw('categorie_demande')) !== null) {
            $criteria['categorieDemande'] = $v;
        }
        if (($v = $raw('interne_externe')) !== null) {
            $criteria['interneExterne'] = strtoupper($v);
        }
        if (($v = $raw('id_materiel')) !== null && ctype_digit($v)) {
            $criteria['idMateriel'] = (int) $v;
        }

        // "statut"/"status" : id numérique ou libellé (résolu via StatutDemandeRepository).
        // Libellé inconnu -> id -1 : la recherche ne doit renvoyer aucun résultat plutôt
        // que d'ignorer silencieusement le filtre.
        if (($v = $raw('statut') ?? $raw('status')) !== null) {
            $criteria['idStatutDemande'] = ctype_digit($v)
                ? (int) $v
                : ($this->statutRepo->findOneBy(['description' => $v])?->getId() ?? -1);
        }

        // "niveau_urgence" : /dit/niveaux-urgence renvoie la description comme "code".
        if (($v = $raw('niveau_urgence')) !== null) {
            $criteria['idNiveauUrgence'] = ctype_digit($v)
                ? (int) $v
                : ($this->niveauUrgenceRepo->findOneBy(['description' => $v])?->getId() ?? -1);
        }

        // Agence/service émetteur et débiteur filtrent le champ dénormalisé "codeAgence-codeService".
        $agenceEmetteur = $raw('agence_emetteur');
        $serviceEmetteur = $raw('service_emetteur');
        if ($agenceEmetteur !== null || $serviceEmetteur !== null) {
            $criteria['agenceServiceEmetteur'] = trim(($agenceEmetteur ?? '') . '-' . ($serviceEmetteur ?? ''), '-');
        }
        $agenceDebiteur = $raw('agence_debiteur');
        $serviceDebiteur = $raw('service_debiteur');
        if ($agenceDebiteur !== null || $serviceDebiteur !== null) {
            $criteria['agenceServiceDebiteur'] = trim(($agenceDebiteur ?? '') . '-' . ($serviceDebiteur ?? ''), '-');
        }

        // N° parc / n° série vivent sur Materiel (base "ips", pas de jointure DQL possible
        // avec Dit) : résolus en amont vers une liste d'id_materiel.
        $numParc = $raw('numero_parc');
        $numSerie = $raw('numero_serie');
        if ($numParc !== null || $numSerie !== null) {
            $criteria['materielIds'] = $this->materielRepo->findIdsByNumParcOrNumSerie($numParc, $numSerie);
        }

        if (($v = $raw('dit_sans_or')) !== null) {
            $criteria['ditSansOr'] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
        }

        if (($v = $raw('date_debut_demande')) !== null) {
            $date = \DateTime::createFromFormat('Y-m-d', $v);
            if ($date) {
                $criteria['dateDebut'] = $date->setTime(0, 0, 0);
            }
        }
        if (($v = $raw('date_fin_demande')) !== null) {
            $date = \DateTime::createFromFormat('Y-m-d', $v);
            if ($date) {
                $criteria['dateFin'] = $date->setTime(23, 59, 59);
            }
        }

        return $criteria;
    }
}
