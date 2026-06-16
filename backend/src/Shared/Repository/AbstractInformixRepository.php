<?php

namespace App\Shared\Repository;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\Result;
use Doctrine\Persistence\ManagerRegistry;

abstract class AbstractInformixRepository extends ServiceEntityRepository
{
    protected string $dbIps;
    protected string $dbIrium;

    public function __construct(
        ManagerRegistry $registry,
        string $entityClass,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, $entityClass);
        $this->dbIps = $dbIps;
        $this->dbIrium = $dbIrium;
    }
    /**
     * Exécute et décode les résultats d'une requête Informix en UTF-8
     */
    protected function fetchAndDecode(Result $result): array
    {
        $data = $result->fetchAllAssociative();

        foreach ($data as $i => $row) {
            foreach ($row as $column => $value) {
                if (is_string($value) && !mb_check_encoding($value, 'UTF-8')) {
                    $data[$i][$column] = mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
                }
            }
        }

        return $data;
    }
}
