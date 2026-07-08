<?php

namespace App\Dit\Entity\Ips;

use Doctrine\ORM\Mapping as ORM;

/**
 * Client ERP (Informix ips, table `cli_bse`), lecture seule.
 *
 * Pas de colonne e-mail sur cli_bse dans ce schéma legacy — emailClient sera
 * toujours null tant qu'une source pour cette donnée n'est pas identifiée.
 */
#[ORM\Entity]
#[ORM\Table(name: 'cli_bse')]
class Client
{
    #[ORM\Id]
    #[ORM\Column(name: 'cbse_numcli', type: 'integer')]
    private int $numCli;

    #[ORM\Column(name: 'cbse_nomcli', type: 'string', length: 50)]
    private string $nomCli;

    #[ORM\Column(name: 'cbse_tel', type: 'string', length: 18, nullable: true)]
    private ?string $tel;

    public function getNumCli(): int { return $this->numCli; }
    public function getNomCli(): string { return $this->nomCli; }
    public function getTel(): ?string { return $this->tel; }
}
