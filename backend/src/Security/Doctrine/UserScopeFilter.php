<?php

namespace App\Security\Doctrine;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

class UserScopeFilter extends SQLFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        // On ne filtre que les entités qui ont les colonnes nent_succ et nent_servcrt
        // (Adaptation pour NegEnt / IPS par exemple)
        // Idéalement, on utiliserait une interface ou un attribut pour détecter les entités à filtrer.
        
        $constraints = [];

        // Filtre par Agence (Successale)
        try {
            $allowedAgencies = $this->getParameter('allowed_agencies');
            if ($allowedAgencies) {
                // nent_succ est utilisé dans NegEnt (IPS)
                if ($targetEntity->hasField('succ')) {
                    $constraints[] = sprintf('%s.nent_succ IN (%s)', $targetTableAlias, $allowedAgencies);
                }
            }
        } catch (\InvalidArgumentException) {
            // Paramètre non défini, on ne filtre pas
        }

        // Filtre par Service
        try {
            $allowedServices = $this->getParameter('allowed_services');
            if ($allowedServices) {
                // nent_servcrt est utilisé dans NegEnt (IPS)
                if ($targetEntity->hasField('servCrt')) {
                    $constraints[] = sprintf('%s.nent_servcrt IN (%s)', $targetTableAlias, $allowedServices);
                }
            }
        } catch (\InvalidArgumentException) {
            // Paramètre non défini
        }

        return $constraints ? implode(' AND ', $constraints) : '';
    }
}
