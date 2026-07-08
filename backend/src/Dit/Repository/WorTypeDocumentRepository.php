<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\WorTypeDocument;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WorTypeDocument>
 */
class WorTypeDocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorTypeDocument::class);
    }

    /** @return WorTypeDocument[] */
    public function findAllOrdered(): array
    {
        return $this->findBy([], ['description' => 'ASC']);
    }
}
