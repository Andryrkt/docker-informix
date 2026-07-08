<?php

namespace App\Dit\Repository;

use App\Dit\Entity\SqlServer\DitCounter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DitCounter>
 */
class DitCounterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DitCounter::class);
    }

    /**
     * Verrouille (pessimiste) la ligne compteur pour l'application donnée,
     * la crée si elle n'existe pas encore. Doit être appelé à l'intérieur
     * d'une transaction ouverte par l'appelant.
     */
    public function lockOrCreate(string $codeApp): DitCounter
    {
        $counter = $this->findOneBy(['codeApp' => $codeApp]);
        if (!$counter) {
            $counter = (new DitCounter())->setCodeApp($codeApp);
            $this->getEntityManager()->persist($counter);
            $this->getEntityManager()->flush();
        }

        $this->getEntityManager()->lock($counter, \Doctrine\DBAL\LockMode::PESSIMISTIC_WRITE);

        return $counter;
    }
}
