<?php

namespace App\Dit\Service;

use App\Dit\Dto\DitCreateInput;
use App\Dit\Entity\Irium\Dit;
use App\Security\Entity\Agency;
use App\Security\Entity\Service;
use App\Security\Entity\User;

/**
 * Construit l'entité Dit à partir des champs validés par DitRequestValidator
 * — pendant "entrée" de DitPayloadFactory (qui sérialise en sortie).
 */
final class DitFactory
{
    /**
     * @param array{pieceJoint: ?string, pieceJoint1: ?string, pieceJoint2: ?string} $storedFiles
     */
    public function fromInput(
        DitCreateInput $input,
        string $numero,
        ?string $codeSociete,
        Agency $agenceEmetteur,
        Service $serviceEmetteur,
        array $storedFiles,
        User $user,
    ): Dit {
        $dit = new Dit();
        $dit->setNumeroDemandeDit($numero);
        $dit->setCodeSociete($codeSociete);
        $dit->setTypeDocument($input->typeDocument->getId());
        $dit->setTypeReparation($input->typeReparation);
        $dit->setReparationRealise($input->reparationPar);
        $dit->setCategorieDemande($input->categorieDemande);
        $dit->setInterneExterne($input->interneExterne);
        $dit->setAgenceServiceEmetteur($agenceEmetteur->getCode() . '-' . $serviceEmetteur->getCode());
        $dit->setAgenceEmetteurId($agenceEmetteur->getId());
        $dit->setServiceEmetteurId($serviceEmetteur->getId());
        $dit->setDatePrevueTravaux($input->datePrevue);
        $dit->setDemandeDevis($input->demandeDevis);
        $dit->setIdNiveauUrgence($input->niveauUrgence->getId());
        $dit->setAvisRecouvrement($input->avisRecouvrement);
        $dit->setObjetDemande($input->objet);
        $dit->setDetailDemande($input->details);
        $dit->setLivraisonPartiel($input->livraisonPartielle);
        $dit->setIdMateriel($input->materiel->getNumMat());
        $dit->setMailDemandeur($user->getEmail() ?? '');
        $dit->setDateDemande(new \DateTime());
        $dit->setHeureDemande((new \DateTime())->format('H:i'));
        $dit->setPieceJoint($storedFiles['pieceJoint']);
        $dit->setPieceJoint1($storedFiles['pieceJoint1']);
        $dit->setPieceJoint2($storedFiles['pieceJoint2']);
        $dit->setUtilisateurDemandeur($user->getUsername());
        $dit->setIdStatutDemande(Dit::STATUT_A_AFFECTER_ID);

        if ($input->agenceDebiteur && $input->serviceDebiteur) {
            $dit->setAgenceServiceDebiteur($input->agenceDebiteur->getCode() . '-' . $input->serviceDebiteur->getCode());
            $dit->setAgenceDebiteurId($input->agenceDebiteur->getId());
            $dit->setServiceDebiteurId($input->serviceDebiteur->getId());
        } else {
            $dit->setNumeroClient($input->numClient ?? '');
            $dit->setLibelleClient($input->nomClient ?? '');
            $dit->setNomClient($input->nomClient ?? '');
            $dit->setNumeroTelephone($input->telephoneClient ?? '');
            $dit->setMailClient($input->emailClient ?? '');
            $dit->setClientSousContrat($input->clientSousContrat ?? '');
        }

        return $dit;
    }
}
