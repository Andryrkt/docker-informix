<?php
namespace App\Magasin\Devis\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'devis_soumis_a_validation_neg')]
class DevisSoumissionValidationNeg
{
    #[ORM\Id]
    #[ORM\Column(name: 'numero_devis', type: 'integer')]
    private int $numeroDevis;

    #[ORM\Id]
    #[ORM\Column(name: 'numero_version', type: 'integer')]
    private int $numeroVersion;

    #[ORM\Column(name: 'statut_dw', type: 'string', length: 50, nullable: true)]
    private ?string $statutDw;

    #[ORM\Column(name: 'statut_bc', type: 'string', length: 50, nullable: true)]
    private ?string $statutBc;

    #[ORM\Column(name: 'date_envoye_devis_client', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateEnvoyeDevisClient;

    #[ORM\Column(name: 'stop_progression_global', type: 'integer', nullable: true)]
    private ?int $stopProgressionGlobal;

    #[ORM\Column(name: 'motif_stop_global', type: 'string', length: 255, nullable: true)]
    private ?string $motifStopGlobal;

    #[ORM\Column(name: 'utilisateur', type: 'string', length: 100, nullable: true)]
    private ?string $utilisateur;

    public function getNumeroDevis(): int { return $this->numeroDevis; }
    public function getNumeroVersion(): int { return $this->numeroVersion; }
    public function getStatutDw(): ?string { return $this->statutDw; }
    public function getStatutBc(): ?string { return $this->statutBc; }
    public function getDateEnvoyeDevisClient(): ?\DateTimeInterface { return $this->dateEnvoyeDevisClient; }
    public function getStopProgressionGlobal(): ?int { return $this->stopProgressionGlobal; }
    public function getMotifStopGlobal(): ?string { return $this->motifStopGlobal; }
    public function getUtilisateur(): ?string { return $this->utilisateur; }
}