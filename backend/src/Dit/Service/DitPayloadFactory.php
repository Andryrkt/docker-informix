<?php

namespace App\Dit\Service;

use App\Dit\Dto\DitPayload;
use App\Dit\Entity\Irium\Dit;
use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\StatutDemandeRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use App\Dit\Repository\WorTypeDocumentRepository;
use App\Security\Repository\AgencyRepository;
use App\Security\Repository\ServiceRepository;

/**
 * Construit le JSON renvoyé au frontend pour un DIT (liste et détails) —
 * résout les libellés (agence/service, type de document, catégorie, statut,
 * niveau d'urgence) à partir des colonnes brutes de `demande_intervention`.
 */
final class DitPayloadFactory
{
    public function __construct(
        private readonly MaterielRepository $materielRepo,
        private readonly WorTypeDocumentRepository $typeDocumentRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly CategorieAteAppRepository $categorieRepo,
        private readonly StatutDemandeRepository $statutRepo,
        private readonly AgencyRepository $agencyRepo,
        private readonly ServiceRepository $serviceRepo,
    ) {}

    public function serialize(Dit $dit): array
    {
        return self::sanitizeUtf8($this->create($dit)->toArray());
    }

    public function create(Dit $dit): DitPayload
    {
        $materiel = $this->materielRepo->find($dit->getIdMateriel());
        [$agenceEmetteurLabel, $serviceEmetteurLabel] = $this->resolveAgenceServiceLabels($dit->getAgenceServiceEmetteur());
        [$agenceDebiteurLabel, $serviceDebiteurLabel] = $this->resolveAgenceServiceLabels($dit->getAgenceServiceDebiteur());
        $statut = $dit->getIdStatutDemande() ? $this->statutRepo->find($dit->getIdStatutDemande()) : null;
        $typeDocumentLabel = $this->resolveTypeDocumentLabel($dit->getTypeDocument());
        $categorieDemandeLabel = $this->resolveCategorieDemandeLabel($dit->getCategorieDemande());
        $niveauUrgence = $dit->getIdNiveauUrgence() ? $this->niveauUrgenceRepo->find($dit->getIdNiveauUrgence()) : null;

        $nbrPj = count(array_filter([$dit->getPieceJoint(), $dit->getPieceJoint1(), $dit->getPieceJoint2()]));

        $fichier = fn(?string $storedName, string $slot) => $storedName ? [
            'nom' => $storedName,
            'url' => "/api/demande-intervention/{$dit->getNumeroDemandeDit()}/fichiers/{$slot}",
        ] : null;

        return new DitPayload(
            id: $dit->getId(),
            numeroDemandeIntervention: $dit->getNumeroDemandeDit(),
            idStatutDemande: $dit->getIdStatutDemande(),
            objet: $dit->getObjetDemande(),
            details: $dit->getDetailDemande(),
            statutDemande: $statut?->getDescription(),
            demandeDevis: $dit->getDemandeDevis(),
            livraisonPartielle: $dit->getLivraisonPartiel(),
            avisRecouvrement: $dit->getAvisRecouvrement(),
            typeDocument: $typeDocumentLabel,
            categorieDemande: $categorieDemandeLabel,
            interneExterne: $dit->getInterneExterne(),
            reparationRealise: $dit->getReparationRealise(),
            worNiveauUrgence: $niveauUrgence?->getDescription(),
            idMateriel: (string) $dit->getIdMateriel(),
            numSerie: $materiel?->getNumSerie(),
            numParc: $materiel?->getNumParc(),
            dateDemande: $dit->getDateDemande()->format('Y-m-d'),
            agenceEmetteur: $agenceEmetteurLabel,
            serviceEmmetteur: $serviceEmetteurLabel,
            agenceServiceEmetteur: $dit->getAgenceServiceEmetteur(),
            agenceServiceDebiteur: $dit->getAgenceServiceDebiteur(),
            datePrevue: $dit->getDatePrevueTravaux()?->format('Y-m-d'),
            typeReparation: $dit->getTypeReparation(),
            reparationPar: $dit->getReparationRealise(),
            agenceDebiteur: $agenceDebiteurLabel,
            serviceDebiteur: $serviceDebiteurLabel,
            sectionAffectee: $dit->getSectionAffectee(),
            numeroDevisRattache: $dit->getNumeroDevisRattache(),
            statutDevis: $dit->getStatutDevis(),
            numeroOr: $dit->getNumeroOr(),
            statutOr: $dit->getStatutOr(),
            montantOr: null,
            dateSoumissionOr: null,
            etatFacturation: $dit->getEtatFacturation(),
            ri: $dit->getRi(),
            utilisateurDemandeur: $dit->getUtilisateurDemandeur(),
            nbrPj: $nbrPj,
            estAnnulable: false,
            estOrASoumi: false,
            quantiteDemanderOr: 0,
            quantiteReserverOr: 0,
            quantiteLivreeOr: 0,
            quantiteReliquatOr: 0,
            qteLivOr: 0,
            etatLivraison: 'Non livré',
            numClient: $dit->getNumeroClient(),
            telephoneClient: $dit->getNumeroTelephone(),
            nomClient: $dit->getNomClient(),
            emailClient: $dit->getMailClient(),
            clientSousContrat: $dit->getClientSousContrat(),
            pieceJoint: $fichier($dit->getPieceJoint(), 'pieceJoint'),
            pieceJoint1: $fichier($dit->getPieceJoint1(), 'pieceJoint1'),
            pieceJoint2: $fichier($dit->getPieceJoint2(), 'pieceJoint2'),
        );
    }

    /**
     * Résout un libellé "code NOM" pour l'agence et le service à partir du
     * champ dénormalisé "codeAgence-codeService" (ex: "80-INF").
     *
     * Les colonnes agence_emetteur_id/service_emetteur_id/agence_debiteur_id/
     * service_debiteur_id de la table legacy référencent un schéma d'id
     * différent de celui d'App\Security\Entity\Agency/Service dans ce backend
     * (ex: agence_emetteur_id=8 alors qu'app_agency va de 25 à 36) — elles ne
     * sont donc PAS utilisables pour résoudre l'agence/service en toute
     * fiabilité sur les ~23k DIT déjà existantes. Le champ dénormalisé
     * "codeAgence-codeService", lui, est cohérent aussi bien sur les données
     * legacy que sur celles créées par ce module (voir DitController::createDit()).
     *
     * @return array{0: ?string, 1: ?string}
     */
    private function resolveAgenceServiceLabels(?string $codePair): array
    {
        if (!$codePair || !str_contains($codePair, '-')) {
            return [null, null];
        }

        [$agenceCode, $serviceCode] = explode('-', $codePair, 2);
        $agence = $this->agencyRepo->findOneBy(['code' => trim($agenceCode)]);
        $service = $this->serviceRepo->findOneBy(['code' => trim($serviceCode)]);

        return [
            $agence ? $agence->getCode() . ' ' . $agence->getName() : $codePair,
            $service ? $service->getCode() . ' ' . $service->getName() : null,
        ];
    }

    /**
     * demande_intervention.type_document stocke tantôt le code (3 lettres,
     * ex: "MAC" — convention créée par ce module) tantôt l'id numérique brut
     * de wor_type_document (ex: "1" — convention des DIT plus anciennes,
     * jamais migrées). On tente les deux avant de retomber sur la valeur
     * brute si rien ne correspond.
     */
    private function resolveTypeDocumentLabel(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }

        $entity = $this->typeDocumentRepo->findOneBy(['codeDocument' => $raw]);
        if (!$entity && ctype_digit($raw)) {
            $entity = $this->typeDocumentRepo->find((int) $raw);
        }

        return $entity ? self::toUtf8($entity->getDescription()) : $raw;
    }

    /**
     * Même situation que type_document : demande_intervention.categorie_demande
     * stocke tantôt le libellé (ex: "REPARATION") tantôt l'id numérique brut
     * de categorie_ate_app (ex: "1") sur les DIT les plus anciennes.
     */
    private function resolveCategorieDemandeLabel(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }

        $entity = $this->categorieRepo->findOneBy(['libelle' => $raw]);
        if (!$entity && ctype_digit($raw)) {
            $entity = $this->categorieRepo->find((int) $raw);
        }

        return $entity ? self::toUtf8($entity->getLibelle()) : $raw;
    }

    /**
     * Beaucoup de champs texte libres des ~23k DIT existantes (objet, détails,
     * nom client, utilisateur...) ont été écrits en ISO-8859-1 par le legacy —
     * à convertir avant tout json_encode, qui rejette les octets invalides en
     * UTF-8. Appliqué récursivement sur tout le payload plutôt que champ par
     * champ, pour ne pas avoir à traquer chaque colonne texte individuellement.
     */
    private static function toUtf8(?string $value): ?string
    {
        if ($value === null || mb_check_encoding($value, 'UTF-8')) {
            return $value;
        }

        return mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
    }

    private static function sanitizeUtf8(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = self::toUtf8($value);
            } elseif (is_array($value)) {
                $data[$key] = self::sanitizeUtf8($value);
            }
        }

        return $data;
    }
}
