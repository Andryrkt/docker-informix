<?php

namespace App\Dit\Entity\Irium;

use App\Dit\Repository\DitRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * DIT (Demande d'Intervention Technique), portage du module Atelier legacy.
 *
 * Mappée sur la table Informix (irium) `demande_intervention`, déjà existante
 * et partagée avec le legacy — colonnes/longueurs reprises telles quelles
 * (voir syscolumns), pas de schéma inventé.
 *
 * Pas de relation Doctrine vers les entités SQL Server (Agency/Service/User) :
 * une entité Informix ne peut pas référencer une entité mappée sur un autre
 * entity manager. Les *_id ci-dessous sont de simples colonnes scalaires,
 * résolues manuellement côté contrôleur via les repositories SQL Server.
 *
 * Périmètre "CRUD de base" : seul le statut A_AFFECTER (50) est produit par
 * ce code. Les autres statuts legacy existent dans `statut_demande` mais ne
 * sont pas atteignables sans les workflows de soumission/clôture (hors
 * périmètre de cette itération).
 */
#[ORM\Entity(repositoryClass: DitRepository::class)]
#[ORM\Table(name: 'demande_intervention')]
#[ORM\Index(columns: ['numero_demande_dit'], name: 'idx_dit_numero')]
class Dit
{
    public const STATUT_A_AFFECTER_ID = 50;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'numero_demande_dit', type: 'string', length: 11, unique: true)]
    private string $numeroDemandeDit;

    #[ORM\Column(name: 'code_societe', type: 'string', length: 2, nullable: true)]
    private ?string $codeSociete = null;

    #[ORM\Column(name: 'type_document', type: 'string', length: 3, nullable: true)]
    private ?string $typeDocument = null;

    #[ORM\Column(name: 'type_reparation', type: 'string', length: 30, nullable: true)]
    private ?string $typeReparation = null;

    #[ORM\Column(name: 'reparation_realise', type: 'string', length: 30, nullable: true)]
    private ?string $reparationRealise = null;

    #[ORM\Column(name: 'categorie_demande', type: 'string', length: 30, nullable: true)]
    private ?string $categorieDemande = null;

    #[ORM\Column(name: 'internet_externe', type: 'string', length: 10, nullable: true)]
    private ?string $interneExterne = null;

    #[ORM\Column(name: 'agence_service_debiteur', type: 'string', length: 6, nullable: true)]
    private ?string $agenceServiceDebiteur = null;

    #[ORM\Column(name: 'agence_service_emmeteur', type: 'string', length: 6)]
    private string $agenceServiceEmetteur;

    #[ORM\Column(name: 'nom_client', type: 'string', length: 100, nullable: true)]
    private ?string $nomClient = null;

    #[ORM\Column(name: 'numero_telephone', type: 'string', length: 10, nullable: true)]
    private ?string $numeroTelephone = null;

    #[ORM\Column(name: 'date_prevue_travaux', type: 'date', nullable: true)]
    private ?\DateTimeInterface $datePrevueTravaux = null;

    #[ORM\Column(name: 'demande_devis', type: 'string', length: 3)]
    private string $demandeDevis = 'NON';

    #[ORM\Column(name: 'id_niveau_urgence', type: 'integer', nullable: true)]
    private ?int $idNiveauUrgence = null;

    #[ORM\Column(name: 'avis_recouvrement', type: 'string', length: 3)]
    private string $avisRecouvrement = 'NON';

    #[ORM\Column(name: 'client_sous_contrat', type: 'string', length: 3, nullable: true)]
    private ?string $clientSousContrat = null;

    #[ORM\Column(name: 'objet_demande', type: 'string', length: 255, nullable: true)]
    private ?string $objetDemande = null;

    #[ORM\Column(name: 'detail_demande', type: 'text', nullable: true)]
    private ?string $detailDemande = null;

    #[ORM\Column(name: 'livraison_partiel', type: 'string', length: 3)]
    private string $livraisonPartiel = 'NON';

    #[ORM\Column(name: 'id_materiel', type: 'integer')]
    private int $idMateriel;

    #[ORM\Column(name: 'mail_demandeur', type: 'string', length: 100)]
    private string $mailDemandeur;

    #[ORM\Column(name: 'date_demande', type: 'date')]
    private \DateTimeInterface $dateDemande;

    #[ORM\Column(name: 'heure_demande', type: 'string', length: 5)]
    private string $heureDemande;

    #[ORM\Column(name: 'piece_joint1', type: 'string', length: 200, nullable: true)]
    private ?string $pieceJoint1 = null;

    #[ORM\Column(name: 'piece_joint2', type: 'string', length: 200, nullable: true)]
    private ?string $pieceJoint2 = null;

    #[ORM\Column(name: 'piece_joint', type: 'string', length: 200, nullable: true)]
    private ?string $pieceJoint = null;

    #[ORM\Column(name: 'utilisateur_demandeur', type: 'string', length: 50, nullable: true)]
    private ?string $utilisateurDemandeur = null;

    #[ORM\Column(name: 'id_statut_demande', type: 'integer', nullable: true)]
    private ?int $idStatutDemande = null;

    #[ORM\Column(name: 'numero_client', type: 'string', length: 15, nullable: true)]
    private ?string $numeroClient = null;

    #[ORM\Column(name: 'libelle_client', type: 'string', length: 50, nullable: true)]
    private ?string $libelleClient = null;

    #[ORM\Column(name: 'mail_client', type: 'string', length: 100, nullable: true)]
    private ?string $mailClient = null;

    #[ORM\Column(name: 'agence_emetteur_id', type: 'integer', nullable: true)]
    private ?int $agenceEmetteurId = null;

    #[ORM\Column(name: 'service_emetteur_id', type: 'integer', nullable: true)]
    private ?int $serviceEmetteurId = null;

    #[ORM\Column(name: 'agence_debiteur_id', type: 'integer', nullable: true)]
    private ?int $agenceDebiteurId = null;

    #[ORM\Column(name: 'service_debiteur_id', type: 'integer', nullable: true)]
    private ?int $serviceDebiteurId = null;

    // ── Colonnes "passives" (hors périmètre — jamais alimentées ici, juste lues) ──

    #[ORM\Column(name: 'numero_or', type: 'string', length: 10, nullable: true)]
    private ?string $numeroOr = null;

    #[ORM\Column(name: 'statut_or', type: 'string', length: 255, nullable: true)]
    private ?string $statutOr = null;

    #[ORM\Column(name: 'numero_devis_rattache', type: 'string', length: 50, nullable: true)]
    private ?string $numeroDevisRattache = null;

    #[ORM\Column(name: 'statut_devis', type: 'string', length: 50, nullable: true)]
    private ?string $statutDevis = null;

    #[ORM\Column(name: 'section_affectee', type: 'string', length: 255, nullable: true)]
    private ?string $sectionAffectee = null;

    #[ORM\Column(name: 'etat_facturation', type: 'string', length: 255, nullable: true)]
    private ?string $etatFacturation = null;

    #[ORM\Column(name: 'ri', type: 'string', length: 255, nullable: true)]
    private ?string $ri = null;

    #[ORM\Column(name: 'a_annuler', type: 'smallint', nullable: true)]
    private ?int $aAnnuler = null;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getNumeroDemandeDit(): string { return $this->numeroDemandeDit; }
    public function setNumeroDemandeDit(string $v): static { $this->numeroDemandeDit = $v; return $this; }

    public function getCodeSociete(): ?string { return $this->codeSociete; }
    public function setCodeSociete(?string $v): static { $this->codeSociete = $v; return $this; }

    public function getTypeDocument(): ?string { return $this->typeDocument; }
    public function setTypeDocument(?string $v): static { $this->typeDocument = $v; return $this; }

    public function getTypeReparation(): ?string { return $this->typeReparation; }
    public function setTypeReparation(?string $v): static { $this->typeReparation = $v; return $this; }

    public function getReparationRealise(): ?string { return $this->reparationRealise; }
    public function setReparationRealise(?string $v): static { $this->reparationRealise = $v; return $this; }

    public function getCategorieDemande(): ?string { return $this->categorieDemande; }
    public function setCategorieDemande(?string $v): static { $this->categorieDemande = $v; return $this; }

    public function getInterneExterne(): ?string { return $this->interneExterne; }
    public function setInterneExterne(?string $v): static { $this->interneExterne = $v; return $this; }

    public function getAgenceServiceDebiteur(): ?string { return $this->agenceServiceDebiteur; }
    public function setAgenceServiceDebiteur(?string $v): static { $this->agenceServiceDebiteur = $v; return $this; }

    public function getAgenceServiceEmetteur(): string { return $this->agenceServiceEmetteur; }
    public function setAgenceServiceEmetteur(string $v): static { $this->agenceServiceEmetteur = $v; return $this; }

    public function getNomClient(): ?string { return $this->nomClient; }
    public function setNomClient(?string $v): static { $this->nomClient = $v; return $this; }

    public function getNumeroTelephone(): ?string { return $this->numeroTelephone; }
    public function setNumeroTelephone(?string $v): static { $this->numeroTelephone = $v; return $this; }

    public function getDatePrevueTravaux(): ?\DateTimeInterface { return $this->datePrevueTravaux; }
    public function setDatePrevueTravaux(?\DateTimeInterface $v): static { $this->datePrevueTravaux = $v; return $this; }

    public function getDemandeDevis(): string { return $this->demandeDevis; }
    public function setDemandeDevis(string $v): static { $this->demandeDevis = $v; return $this; }

    public function getIdNiveauUrgence(): ?int { return $this->idNiveauUrgence; }
    public function setIdNiveauUrgence(?int $v): static { $this->idNiveauUrgence = $v; return $this; }

    public function getAvisRecouvrement(): string { return $this->avisRecouvrement; }
    public function setAvisRecouvrement(string $v): static { $this->avisRecouvrement = $v; return $this; }

    public function getClientSousContrat(): ?string { return $this->clientSousContrat; }
    public function setClientSousContrat(?string $v): static { $this->clientSousContrat = $v; return $this; }

    public function getObjetDemande(): ?string { return $this->objetDemande; }
    public function setObjetDemande(?string $v): static { $this->objetDemande = $v; return $this; }

    public function getDetailDemande(): ?string { return $this->detailDemande; }
    public function setDetailDemande(?string $v): static { $this->detailDemande = $v; return $this; }

    public function getLivraisonPartiel(): string { return $this->livraisonPartiel; }
    public function setLivraisonPartiel(string $v): static { $this->livraisonPartiel = $v; return $this; }

    public function getIdMateriel(): int { return $this->idMateriel; }
    public function setIdMateriel(int $v): static { $this->idMateriel = $v; return $this; }

    public function getMailDemandeur(): string { return $this->mailDemandeur; }
    public function setMailDemandeur(string $v): static { $this->mailDemandeur = $v; return $this; }

    public function getDateDemande(): \DateTimeInterface { return $this->dateDemande; }
    public function setDateDemande(\DateTimeInterface $v): static { $this->dateDemande = $v; return $this; }

    public function getHeureDemande(): string { return $this->heureDemande; }
    public function setHeureDemande(string $v): static { $this->heureDemande = $v; return $this; }

    public function getPieceJoint1(): ?string { return $this->pieceJoint1; }
    public function setPieceJoint1(?string $v): static { $this->pieceJoint1 = $v; return $this; }

    public function getPieceJoint2(): ?string { return $this->pieceJoint2; }
    public function setPieceJoint2(?string $v): static { $this->pieceJoint2 = $v; return $this; }

    public function getPieceJoint(): ?string { return $this->pieceJoint; }
    public function setPieceJoint(?string $v): static { $this->pieceJoint = $v; return $this; }

    public function getUtilisateurDemandeur(): ?string { return $this->utilisateurDemandeur; }
    public function setUtilisateurDemandeur(?string $v): static { $this->utilisateurDemandeur = $v; return $this; }

    public function getIdStatutDemande(): ?int { return $this->idStatutDemande; }
    public function setIdStatutDemande(?int $v): static { $this->idStatutDemande = $v; return $this; }

    public function getNumeroClient(): ?string { return $this->numeroClient; }
    public function setNumeroClient(?string $v): static { $this->numeroClient = $v; return $this; }

    public function getLibelleClient(): ?string { return $this->libelleClient; }
    public function setLibelleClient(?string $v): static { $this->libelleClient = $v; return $this; }

    public function getMailClient(): ?string { return $this->mailClient; }
    public function setMailClient(?string $v): static { $this->mailClient = $v; return $this; }

    public function getAgenceEmetteurId(): ?int { return $this->agenceEmetteurId; }
    public function setAgenceEmetteurId(?int $v): static { $this->agenceEmetteurId = $v; return $this; }

    public function getServiceEmetteurId(): ?int { return $this->serviceEmetteurId; }
    public function setServiceEmetteurId(?int $v): static { $this->serviceEmetteurId = $v; return $this; }

    public function getAgenceDebiteurId(): ?int { return $this->agenceDebiteurId; }
    public function setAgenceDebiteurId(?int $v): static { $this->agenceDebiteurId = $v; return $this; }

    public function getServiceDebiteurId(): ?int { return $this->serviceDebiteurId; }
    public function setServiceDebiteurId(?int $v): static { $this->serviceDebiteurId = $v; return $this; }

    public function getNumeroOr(): ?string { return $this->numeroOr; }
    public function getStatutOr(): ?string { return $this->statutOr; }
    public function getNumeroDevisRattache(): ?string { return $this->numeroDevisRattache; }
    public function getStatutDevis(): ?string { return $this->statutDevis; }
    public function getSectionAffectee(): ?string { return $this->sectionAffectee; }
    public function getEtatFacturation(): ?string { return $this->etatFacturation; }
    public function getRi(): ?string { return $this->ri; }
    public function getAAnnuler(): ?int { return $this->aAnnuler; }
}
