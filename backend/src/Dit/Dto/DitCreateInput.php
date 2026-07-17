<?php

namespace App\Dit\Dto;

use App\Dit\Entity\Ips\Materiel;
use App\Dit\Entity\Irium\WorNiveauUrgence;
use App\Dit\Entity\Irium\WorTypeDocument;
use App\Security\Entity\Agency;
use App\Security\Entity\Service;

/**
 * Champs de POST /api/createDIT une fois validés et résolus en entités par
 * DitRequestValidator — évite à DitFactory de re-parcourir/re-valider le
 * tableau brut de la requête.
 */
final class DitCreateInput
{
    public function __construct(
        public readonly string $objet,
        public readonly string $details,
        public readonly WorTypeDocument $typeDocument,
        public readonly string $categorieDemande,
        public readonly string $livraisonPartielle,
        public readonly string $avisRecouvrement,
        public readonly WorNiveauUrgence $niveauUrgence,
        public readonly \DateTimeInterface $datePrevue,
        public readonly string $typeReparation,
        public readonly string $reparationPar,
        public readonly Materiel $materiel,
        public readonly string $interneExterne,
        public readonly string $demandeDevis,
        public readonly ?Agency $agenceDebiteur,
        public readonly ?Service $serviceDebiteur,
        public readonly ?string $numClient,
        public readonly ?string $nomClient,
        public readonly ?string $telephoneClient,
        public readonly ?string $emailClient,
        public readonly ?string $clientSousContrat,
    ) {}
}
