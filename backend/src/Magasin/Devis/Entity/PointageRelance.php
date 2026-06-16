<?php
namespace App\Compta\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'pointage_relance')]
class PointageRelance
{
    #[ORM\Id]
    #[ORM\Column(name: 'id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'numero_devis', type: 'integer', nullable: true)]
    private ?int $numeroDevis;

    #[ORM\Column(name: 'numero_relance', type: 'integer', nullable: true)]
    private ?int $numeroRelance;

    #[ORM\Column(name: 'date_de_relance', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateDeRelance;

    public function getId(): int { return $this->id; }
    public function getNumeroDevis(): ?int { return $this->numeroDevis; }
    public function getNumeroRelance(): ?int { return $this->numeroRelance; }
    public function getDateDeRelance(): ?\DateTimeInterface { return $this->dateDeRelance; }
}