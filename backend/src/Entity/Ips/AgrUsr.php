<?php
namespace App\Entity\Ips;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'agr_usr')]
class AgrUsr
{
    #[ORM\Id]
    #[ORM\Column(name: 'ausr_num', type: 'integer')]
    private int $num;

    #[ORM\Column(name: 'ausr_soc', type: 'string', length: 10)]
    private string $soc;

    #[ORM\Column(name: 'ausr_nom', type: 'string', length: 100, nullable: true)]
    private ?string $nom;

    public function getNum(): int { return $this->num; }
    public function getSoc(): string { return $this->soc; }
    public function getNom(): ?string { return $this->nom; }
}