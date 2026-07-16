<?php

namespace App\Shared\Repository;

use App\Shared\Entity\SqlServer\NumeroCounter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<NumeroCounter>
 */
class NumeroCounterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NumeroCounter::class);
    }

    /**
     * Verrouille (pessimiste) la ligne compteur pour l'application donnée,
     * la crée si elle n'existe pas encore. Doit être appelé à l'intérieur
     * d'une transaction ouverte par l'appelant.
     */
    public function lockOrCreate(string $codeApp): NumeroCounter
    {
        $counter = $this->findOneBy(['codeApp' => $codeApp]);
        if (!$counter) {
            $counter = (new NumeroCounter())->setCodeApp($codeApp);
            $this->getEntityManager()->persist($counter);
            $this->getEntityManager()->flush();
        }

        $this->getEntityManager()->lock($counter, \Doctrine\DBAL\LockMode::PESSIMISTIC_WRITE);

        return $counter;
    }
}
