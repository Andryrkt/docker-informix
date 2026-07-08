<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Ips\Client;
use App\Shared\Repository\AbstractInformixRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractInformixRepository<Client>
 */
class ClientRepository extends AbstractInformixRepository
{
    public function __construct(
        ManagerRegistry $registry,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, Client::class, $dbIps, $dbIrium);
    }

    /**
     * Sans terme de recherche, renvoie une page par défaut (les plus récents
     * par id) plutôt qu'une liste vide — le formulaire DIT charge cette liste
     * une fois au montage, sans saisie préalable de l'utilisateur.
     */
    public function search(string $term, int $limit = 20): array
    {
        $term = trim($term);
        $qb = $this->createQueryBuilder('c')->setMaxResults($limit);

        if ($term === '') {
            return $qb->orderBy('c.numCli', 'DESC')->getQuery()->getResult();
        }

        $qb->where('c.nomCli LIKE :term')->setParameter('term', '%' . $term . '%');
        if (ctype_digit($term)) {
            $qb->orWhere('c.numCli = :numCli')->setParameter('numCli', (int) $term);
        }

        return $qb->getQuery()->getResult();
    }
}
