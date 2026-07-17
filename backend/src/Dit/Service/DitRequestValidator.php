<?php

namespace App\Dit\Service;

use App\Dit\Dto\DitCreateInput;
use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use App\Dit\Repository\WorTypeDocumentRepository;
use App\Security\Repository\AgencyRepository;
use App\Security\Repository\ServiceRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Valide et résout en entités les champs de POST /api/createDIT. Lève une
 * BadRequestHttpException/NotFoundHttpException (400/404) au premier champ en
 * échec — DitController les traduit en JSON, plutôt que d'égrainer un
 * `return $this->json(...)` par règle dans l'action.
 */
final class DitRequestValidator
{
    private const TYPES_REPARATION = ['STANDARD', 'URGENTE', 'PREVENTIVE', 'CORRECTIVE'];
    private const REPARATION_PAR = ['ATE_TANA', 'ATE_POL_TANA', 'ATE_STAR', 'ATE_MAS', 'ATE_TMV', 'ATE_FTU'];

    public function __construct(
        private readonly WorTypeDocumentRepository $typeDocumentRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly CategorieAteAppRepository $categorieRepo,
        private readonly MaterielRepository $materielRepo,
        private readonly AgencyRepository $agencyRepo,
        private readonly ServiceRepository $serviceRepo,
    ) {}

    public function validate(Request $request): DitCreateInput
    {
        $data = $request->request->all();

        $objet = trim((string) ($data['objet'] ?? ''));
        $details = trim((string) ($data['details'] ?? ''));
        $typeDocument = trim((string) ($data['typeDocument'] ?? ''));
        $categorieDemande = trim((string) ($data['categorieDemande'] ?? ''));
        $livraisonPartielle = trim((string) ($data['livraisonPartielle'] ?? ''));
        $avisRecouvrement = trim((string) ($data['avisRecouvrement'] ?? ''));
        $worNiveauUrgence = trim((string) ($data['worNiveauUrgence'] ?? ''));
        $datePrevueInput = trim((string) ($data['datePrevue'] ?? ''));
        $typeReparation = trim((string) ($data['typeReparation'] ?? ''));
        $reparationPar = trim((string) ($data['reparationPar'] ?? ''));
        $idMaterielInput = trim((string) ($data['idMateriel'] ?? ''));
        $interneExterne = strtoupper(trim((string) ($data['interneExterne'] ?? '')));

        if ($objet === '' || $details === '' || $typeDocument === '' || $categorieDemande === ''
            || $livraisonPartielle === '' || $avisRecouvrement === '' || $worNiveauUrgence === ''
            || $datePrevueInput === '' || $typeReparation === '' || $reparationPar === '' || $idMaterielInput === ''
        ) {
            throw new BadRequestHttpException('Objet, détails, type de document, catégorie, livraison partielle, avis de recouvrement, niveau d\'urgence, date prévue, type de réparation, réparation réalisé par et matériel sont obligatoires.');
        }

        if (!in_array($interneExterne, ['INTERNE', 'EXTERNE'], true)) {
            throw new BadRequestHttpException('Le type de demande (interne/externe) est invalide.');
        }

        if (!in_array($typeReparation, self::TYPES_REPARATION, true)) {
            throw new BadRequestHttpException('Type de réparation invalide.');
        }

        if (!in_array($reparationPar, self::REPARATION_PAR, true)) {
            throw new BadRequestHttpException('Réparation réalisé par : valeur invalide.');
        }

        $typeDocumentEntity = $this->typeDocumentRepo->findOneBy(['codeDocument' => $typeDocument]);
        if (!$typeDocumentEntity) {
            throw new NotFoundHttpException('Type de document introuvable.');
        }

        $niveauUrgenceEntity = $this->niveauUrgenceRepo->findOneBy(['description' => $worNiveauUrgence]);
        if (!$niveauUrgenceEntity) {
            throw new NotFoundHttpException('Niveau d\'urgence introuvable.');
        }

        if (!$this->categorieRepo->findOneBy(['libelle' => $categorieDemande])) {
            throw new NotFoundHttpException('Catégorie de demande introuvable.');
        }

        $materiel = $this->materielRepo->find((int) $idMaterielInput);
        if (!$materiel) {
            throw new NotFoundHttpException('Matériel introuvable — il a peut-être été mis au rebut.');
        }

        $datePrevue = \DateTime::createFromFormat('Y-m-d', $datePrevueInput) ?: null;
        if (!$datePrevue) {
            throw new BadRequestHttpException('Date prévue invalide.');
        }

        $agenceDebiteur = null;
        $serviceDebiteur = null;
        $numClient = null;
        $nomClient = null;
        $telephoneClient = null;
        $emailClient = null;
        $clientSousContrat = null;
        $demandeDevis = strtoupper(trim((string) ($data['demandeDevis'] ?? ''))) ?: 'NON';

        if ($interneExterne === 'INTERNE') {
            $agenceDebiteurId = isset($data['agenceDebiteur']) ? (int) $data['agenceDebiteur'] : null;
            $serviceDebiteurId = isset($data['serviceDebiteur']) ? (int) $data['serviceDebiteur'] : null;
            if (!$agenceDebiteurId || !$serviceDebiteurId) {
                throw new BadRequestHttpException('Agence débiteur et service débiteur sont obligatoires pour une demande interne.');
            }
            $agenceDebiteur = $this->agencyRepo->find($agenceDebiteurId);
            $serviceDebiteur = $this->serviceRepo->find($serviceDebiteurId);
            if (!$agenceDebiteur || !$serviceDebiteur) {
                throw new NotFoundHttpException('Agence ou service débiteur introuvable.');
            }
        } else {
            $numClient = trim((string) ($data['numClient'] ?? ''));
            $nomClient = trim((string) ($data['nomClient'] ?? ''));
            $telephoneClient = trim((string) ($data['telephoneClient'] ?? ''));
            $emailClient = trim((string) ($data['emailClient'] ?? ''));
            $clientSousContrat = trim((string) ($data['clientSousContrat'] ?? ''));

            if ($numClient === '' || $nomClient === '' || $telephoneClient === '' || $emailClient === '' || $clientSousContrat === '') {
                throw new BadRequestHttpException('Les informations client (numéro, nom, téléphone, e-mail, contrat) sont obligatoires pour une demande externe.');
            }
            if (!filter_var($emailClient, FILTER_VALIDATE_EMAIL)) {
                throw new BadRequestHttpException('E-mail client invalide.');
            }
            if (trim((string) ($data['demandeDevis'] ?? '')) === '') {
                throw new BadRequestHttpException('La demande de devis est obligatoire pour une demande externe.');
            }
        }

        return new DitCreateInput(
            objet: $objet,
            details: $details,
            typeDocument: $typeDocumentEntity,
            categorieDemande: $categorieDemande,
            livraisonPartielle: $livraisonPartielle,
            avisRecouvrement: $avisRecouvrement,
            niveauUrgence: $niveauUrgenceEntity,
            datePrevue: $datePrevue,
            typeReparation: $typeReparation,
            reparationPar: $reparationPar,
            materiel: $materiel,
            interneExterne: $interneExterne,
            demandeDevis: $demandeDevis,
            agenceDebiteur: $agenceDebiteur,
            serviceDebiteur: $serviceDebiteur,
            numClient: $numClient,
            nomClient: $nomClient,
            telephoneClient: $telephoneClient,
            emailClient: $emailClient,
            clientSousContrat: $clientSousContrat,
        );
    }
}
