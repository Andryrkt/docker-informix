<?php
namespace App\Magasin\Devis\Entity\Ips;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'neg_ent')]
class NegEnt
{
    #[ORM\Id]
    #[ORM\Column(name: 'nent_numcde', type: 'integer')]
    private int $numCde;

    #[ORM\Column(name: 'nent_datecde', type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateCde;

    #[ORM\Column(name: 'nent_succ', type: 'string', length: 10, nullable: true)]
    private ?string $succ;

    #[ORM\Column(name: 'nent_servcrt', type: 'string', length: 10, nullable: true)]
    private ?string $servCrt;

    #[ORM\Column(name: 'nent_numcli', type: 'integer', nullable: true)]
    private ?int $numCli;

    #[ORM\Column(name: 'nent_nomcli', type: 'string', length: 100, nullable: true)]
    private ?string $nomCli;

    #[ORM\Column(name: 'nent_refcde', type: 'string', length: 100, nullable: true)]
    private ?string $refCde;

    #[ORM\Column(name: 'nent_cdeht', type: 'decimal', precision: 15, scale: 2, nullable: true)]
    private ?float $cdeHt;

    #[ORM\Column(name: 'nent_posl', type: 'string', length: 20, nullable: true)]
    private ?string $posL;

    #[ORM\Column(name: 'nent_usr', type: 'integer', nullable: true)]
    private ?int $usr;

    #[ORM\Column(name: 'nent_soc', type: 'string', length: 10, nullable: true)]
    private ?string $soc;

    #[ORM\Column(name: 'nent_natop', type: 'string', length: 10, nullable: true)]
    private ?string $natOp;

    #[ORM\Column(name: 'nent_devise', type: 'string', length: 10, nullable: true)]
    private ?string $devise;

    // Getters
    public function getNumCde(): int { return $this->numCde; }
    public function getDateCde(): ?\DateTimeInterface { return $this->dateCde; }
    public function getSucc(): ?string { return $this->succ; }
    public function getServCrt(): ?string { return $this->servCrt; }
    public function getNumCli(): ?int { return $this->numCli; }
    public function getNomCli(): ?string { return $this->nomCli; }
    public function getRefCde(): ?string { return $this->refCde; }
    public function getCdeHt(): ?float { return $this->cdeHt; }
    public function getPosL(): ?string { return $this->posL; }
    public function getUsr(): ?int { return $this->usr; }
    public function getSoc(): ?string { return $this->soc; }
    public function getNatOp(): ?string { return $this->natOp; }
    public function getDevise(): ?string { return $this->devise; }
}