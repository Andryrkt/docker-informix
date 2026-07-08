<?php

namespace App\Tik\Entity;

use App\Security\Entity\Agency;
use App\Security\Entity\Personnel;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Tik\Repository\TikRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Ticket de support informatique (portage du module TIK du legacy).
 *
 * Workflow (lot 2) :
 *   OUVERT --valider(VALIDATEUR)--> ENCOURS --planifier(intervenant)--> PLANIFIE
 *   OUVERT --refuser(VALIDATEUR)--> REFUSE
 *   (ENCOURS|PLANIFIE|REOUVERT) --resoudre(intervenant)--> RESOLU
 *   RESOLU --cloturer(demandeur|VALIDATEUR)--> CLOTURE
 *   RESOLU --reouvrir(demandeur)--> REOUVERT
 *   non-terminal --mettreEnAttente(VALIDATEUR)--> EN_ATTENTE
 */
#[ORM\Entity(repositoryClass: TikRepository::class)]
#[ORM\Table(name: 'tik_ticket')]
#[ORM\Index(columns: ['statut'], name: 'idx_tik_statut')]
#[ORM\Index(columns: ['demandeur_id'], name: 'idx_tik_demandeur')]
#[ORM\Index(columns: ['intervenant_id'], name: 'idx_tik_intervenant')]
class Tik
{
    public const STATUT_OUVERT      = 'OUVERT';
    public const STATUT_PLANIFIE    = 'PLANIFIE';
    public const STATUT_EN_COURS    = 'EN_COURS';
    public const STATUT_RESOLU      = 'RESOLU';
    public const STATUT_REFUSE      = 'REFUSE';
    public const STATUT_CLOTURE     = 'CLOTURE';
    public const STATUT_REOUVERT    = 'REOUVERT';
    public const STATUT_EN_ATTENTE  = 'EN_ATTENTE';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'numero_ticket', type: 'string', length: 20, unique: true)]
    private string $numeroTicket;

    #[ORM\Column(name: 'objet_demande', type: 'string', length: 255)]
    private string $objetDemande;

    #[ORM\Column(name: 'detail_demande', type: 'text')]
    private string $detailDemande;

    #[ORM\ManyToOne(targetEntity: TikCategorie::class)]
    #[ORM\JoinColumn(name: 'categorie_id', referencedColumnName: 'id', nullable: false)]
    private ?TikCategorie $categorie = null;

    #[ORM\ManyToOne(targetEntity: TikSousCategorie::class)]
    #[ORM\JoinColumn(name: 'sous_categorie_id', referencedColumnName: 'id', nullable: true)]
    private ?TikSousCategorie $sousCategorie = null;

    #[ORM\ManyToOne(targetEntity: TikAutresCategorie::class)]
    #[ORM\JoinColumn(name: 'autres_categorie_id', referencedColumnName: 'id', nullable: true)]
    private ?TikAutresCategorie $autresCategorie = null;

    /** P1 (critique) à P5 (faible) — même échelle que le module Atelier/DIT. */
    #[ORM\Column(name: 'niveau_urgence', type: 'string', length: 5)]
    private string $niveauUrgence = 'P4';

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'demandeur_id', referencedColumnName: 'id', nullable: false)]
    private ?User $demandeur = null;

    #[ORM\ManyToOne(targetEntity: Agency::class)]
    #[ORM\JoinColumn(name: 'agence_emetteur_id', referencedColumnName: 'id', nullable: true)]
    private ?Agency $agenceEmetteur = null;

    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_emetteur_id', referencedColumnName: 'id', nullable: true)]
    private ?Service $serviceEmetteur = null;

    #[ORM\ManyToOne(targetEntity: Agency::class)]
    #[ORM\JoinColumn(name: 'agence_debiteur_id', referencedColumnName: 'id', nullable: true)]
    private ?Agency $agenceDebiteur = null;

    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_debiteur_id', referencedColumnName: 'id', nullable: true)]
    private ?Service $serviceDebiteur = null;

    #[ORM\Column(name: 'parc_informatique', type: 'string', length: 100, nullable: true)]
    private ?string $parcInformatique = null;

    #[ORM\Column(name: 'date_fin_souhaitee', type: 'datetime')]
    private \DateTimeInterface $dateFinSouhaitee;

    #[ORM\Column(name: 'statut', type: 'string', length: 20)]
    private string $statut = self::STATUT_OUVERT;

    #[ORM\ManyToOne(targetEntity: Personnel::class)]
    #[ORM\JoinColumn(name: 'intervenant_id', referencedColumnName: 'id', nullable: true)]
    private ?Personnel $intervenant = null;

    /** L'utilisateur ROLE_VALIDATEUR qui a traité le ticket (valider/refuser/attente). */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'validateur_id', referencedColumnName: 'id', nullable: true)]
    private ?User $validateur = null;

    #[ORM\Column(name: 'date_debut_planning', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateDebutPlanning = null;

    #[ORM\Column(name: 'date_fin_planning', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateFinPlanning = null;

    /** JSON encodé : [{"name":"...","storedName":"...","sizeKb":n}] */
    #[ORM\Column(name: 'file_names', type: 'text', nullable: true)]
    private ?string $fileNames = null;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getNumeroTicket(): string { return $this->numeroTicket; }
    public function setNumeroTicket(string $numeroTicket): static { $this->numeroTicket = $numeroTicket; return $this; }

    public function getObjetDemande(): string { return $this->objetDemande; }
    public function setObjetDemande(string $objetDemande): static { $this->objetDemande = $objetDemande; return $this; }

    public function getDetailDemande(): string { return $this->detailDemande; }
    public function setDetailDemande(string $detailDemande): static { $this->detailDemande = $detailDemande; return $this; }

    public function getCategorie(): ?TikCategorie { return $this->categorie; }
    public function setCategorie(?TikCategorie $categorie): static { $this->categorie = $categorie; return $this; }

    public function getSousCategorie(): ?TikSousCategorie { return $this->sousCategorie; }
    public function setSousCategorie(?TikSousCategorie $sousCategorie): static { $this->sousCategorie = $sousCategorie; return $this; }

    public function getAutresCategorie(): ?TikAutresCategorie { return $this->autresCategorie; }
    public function setAutresCategorie(?TikAutresCategorie $autresCategorie): static { $this->autresCategorie = $autresCategorie; return $this; }

    public function getNiveauUrgence(): string { return $this->niveauUrgence; }
    public function setNiveauUrgence(string $niveauUrgence): static { $this->niveauUrgence = $niveauUrgence; return $this; }

    public function getDemandeur(): ?User { return $this->demandeur; }
    public function setDemandeur(?User $demandeur): static { $this->demandeur = $demandeur; return $this; }

    public function getAgenceEmetteur(): ?Agency { return $this->agenceEmetteur; }
    public function setAgenceEmetteur(?Agency $agenceEmetteur): static { $this->agenceEmetteur = $agenceEmetteur; return $this; }

    public function getServiceEmetteur(): ?Service { return $this->serviceEmetteur; }
    public function setServiceEmetteur(?Service $serviceEmetteur): static { $this->serviceEmetteur = $serviceEmetteur; return $this; }

    public function getAgenceDebiteur(): ?Agency { return $this->agenceDebiteur; }
    public function setAgenceDebiteur(?Agency $agenceDebiteur): static { $this->agenceDebiteur = $agenceDebiteur; return $this; }

    public function getServiceDebiteur(): ?Service { return $this->serviceDebiteur; }
    public function setServiceDebiteur(?Service $serviceDebiteur): static { $this->serviceDebiteur = $serviceDebiteur; return $this; }

    public function getParcInformatique(): ?string { return $this->parcInformatique; }
    public function setParcInformatique(?string $parcInformatique): static { $this->parcInformatique = $parcInformatique; return $this; }

    public function getDateFinSouhaitee(): \DateTimeInterface { return $this->dateFinSouhaitee; }
    public function setDateFinSouhaitee(\DateTimeInterface $dateFinSouhaitee): static { $this->dateFinSouhaitee = $dateFinSouhaitee; return $this; }

    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }

    public function getIntervenant(): ?Personnel { return $this->intervenant; }
    public function setIntervenant(?Personnel $intervenant): static { $this->intervenant = $intervenant; return $this; }

    public function getValidateur(): ?User { return $this->validateur; }
    public function setValidateur(?User $validateur): static { $this->validateur = $validateur; return $this; }

    public function getDateDebutPlanning(): ?\DateTimeInterface { return $this->dateDebutPlanning; }
    public function setDateDebutPlanning(?\DateTimeInterface $dateDebutPlanning): static { $this->dateDebutPlanning = $dateDebutPlanning; return $this; }

    public function getDateFinPlanning(): ?\DateTimeInterface { return $this->dateFinPlanning; }
    public function setDateFinPlanning(?\DateTimeInterface $dateFinPlanning): static { $this->dateFinPlanning = $dateFinPlanning; return $this; }

    public function getFileNames(): ?string { return $this->fileNames; }
    public function setFileNames(?string $fileNames): static { $this->fileNames = $fileNames; return $this; }

    /** @return array<array{name:string,storedName:string,sizeKb:int}> */
    public function getFileNamesAsArray(): array
    {
        return $this->fileNames ? (json_decode($this->fileNames, true) ?? []) : [];
    }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
