<?php

namespace App\Dit\Dto;

/**
 * Forme exacte du JSON renvoyé au frontend pour un DIT (liste et détails).
 *
 * Remplace le tableau associatif construit à la main dans
 * DitController::buildDitPayload() : un champ oublié ou mal orthographié ici
 * est une erreur PHP immédiate (argument nommé manquant/inconnu au
 * constructeur) plutôt qu'une clé silencieusement absente du JSON — c'est
 * exactement le bug qu'on vient de corriger deux fois de suite côté
 * agenceServiceEmetteur/agenceServiceDebiteur.
 */
final class DitPayload implements \JsonSerializable
{
    /**
     * @param array{nom: string, url: string}|null $pieceJoint
     * @param array{nom: string, url: string}|null $pieceJoint1
     * @param array{nom: string, url: string}|null $pieceJoint2
     */
    public function __construct(
        public readonly ?int $id,
        public readonly string $numeroDemandeIntervention,
        public readonly ?int $idStatutDemande,
        public readonly ?string $objet,
        public readonly ?string $details,
        public readonly ?string $statutDemande,
        public readonly string $demandeDevis,
        public readonly string $livraisonPartielle,
        public readonly string $avisRecouvrement,
        public readonly ?string $typeDocument,
        public readonly ?string $categorieDemande,
        public readonly ?string $interneExterne,
        public readonly ?string $reparationRealise,
        public readonly ?string $worNiveauUrgence,
        public readonly string $idMateriel,
        public readonly ?string $numSerie,
        public readonly ?string $numParc,
        public readonly string $dateDemande,
        public readonly ?string $agenceEmetteur,
        public readonly ?string $serviceEmmetteur,
        public readonly string $agenceServiceEmetteur,
        public readonly ?string $agenceServiceDebiteur,
        public readonly ?string $datePrevue,
        public readonly ?string $typeReparation,
        public readonly ?string $reparationPar,
        public readonly ?string $agenceDebiteur,
        public readonly ?string $serviceDebiteur,
        public readonly ?string $sectionAffectee,
        public readonly ?string $numeroDevisRattache,
        public readonly ?string $statutDevis,
        public readonly ?string $numeroOr,
        public readonly ?string $statutOr,
        public readonly ?float $montantOr,
        public readonly ?string $dateSoumissionOr,
        public readonly ?string $etatFacturation,
        public readonly ?string $ri,
        public readonly ?string $utilisateurDemandeur,
        public readonly int $nbrPj,
        public readonly bool $estAnnulable,
        public readonly bool $estOrASoumi,
        public readonly int $quantiteDemanderOr,
        public readonly int $quantiteReserverOr,
        public readonly int $quantiteLivreeOr,
        public readonly int $quantiteReliquatOr,
        public readonly int $qteLivOr,
        public readonly string $etatLivraison,
        public readonly ?string $numClient,
        public readonly ?string $telephoneClient,
        public readonly ?string $nomClient,
        public readonly ?string $emailClient,
        public readonly ?string $clientSousContrat,
        public readonly ?array $pieceJoint,
        public readonly ?array $pieceJoint1,
        public readonly ?array $pieceJoint2,
    ) {}

    public function toArray(): array
    {
        return get_object_vars($this);
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
