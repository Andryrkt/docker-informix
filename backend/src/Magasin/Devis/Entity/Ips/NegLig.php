<?php

namespace App\Magasin\Devis\Entity\Ips;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'neg_lig')]
class NegLig
{
    #[ORM\Id]
    #[ORM\Column(name: 'nlig_numcde', type: 'integer')]
    private int $numCde;

    #[ORM\Id]
    #[ORM\Column(name: 'nlig_nolign', type: 'smallint')]
    private int $noLign;

    #[ORM\Column(name: 'nlig_codg', type: 'string', length: 2, nullable: true)]
    private ?string $codg;

    #[ORM\Column(name: 'nlig_constp', type: 'string', length: 3, nullable: true)]
    private ?string $constp;

    // Getters
    public function getNumCde(): int
    {
        return $this->numCde;
    }
    public function getNoLign(): int
    {
        return $this->noLign;
    }
    public function getCodg(): ?string
    {
        return $this->codg;
    }
    public function getConstp(): ?string
    {
        return $this->constp;
    }
}
