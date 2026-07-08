<?php

namespace App\Dit\Service;

use App\Dit\Repository\DitCounterRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Génère le numéro de DIT au format DIT{AAMM}{NNNN}, en portant fidèlement
 * l'algorithme legacy (App\Service\AutoIncDecService::autoGenerateNumero côté
 * scomat) — y compris son comportement de DÉCRÉMENTATION du compteur au sein
 * du mois (au lieu d'incrémenter), qui est le comportement de production
 * attendu et volontairement reproduit tel quel.
 *
 * Amélioration par rapport au legacy : la ligne compteur est verrouillée
 * (lock pessimiste) le temps de la génération, pour éviter la race condition
 * relevée dans l'ancien système (deux créations concurrentes pouvaient
 * produire le même numéro).
 */
class DitNumeroService
{
    private const CODE_APP = 'DIT';

    public function __construct(
        private readonly EntityManagerInterface $emSqlServer,
        private readonly DitCounterRepository $counterRepo,
    ) {}

    public function genererNumero(): string
    {
        return $this->emSqlServer->wrapInTransaction(function () {
            $counter = $this->counterRepo->lockOrCreate(self::CODE_APP);
            $nouveauNumero = self::autoGenerateNumero(self::CODE_APP, $counter->getDerniereId(), false);
            $counter->setDerniereId($nouveauNumero);

            return $nouveauNumero;
        });
    }

    /**
     * Port direct de AutoIncDecService::autoGenerateNumero (scomat).
     * $increment = false ⇒ décrémente le compteur du mois plutôt que de
     * l'incrémenter — comportement legacy volontairement conservé.
     */
    public static function autoGenerateNumero(string $prefixe, ?string $dernierNumero, bool $increment): string
    {
        $anneeCourante = date('y');
        $moisCourant = date('m');
        $anneeMoisCourant = $anneeCourante . $moisCourant;

        if (!$dernierNumero) {
            return $prefixe . $anneeMoisCourant . '0001';
        }

        $numSequential = (int) substr($dernierNumero, -4);
        $anneeMoisDuDernier = substr($dernierNumero, -8, 4);

        if ($anneeMoisDuDernier === $anneeMoisCourant) {
            $numSequential = $increment ? $numSequential + 1 : $numSequential - 1;
        } elseif ($anneeMoisCourant > $anneeMoisDuDernier) {
            $numSequential = $increment ? 1 : 9999;
        }

        return $prefixe . $anneeMoisCourant . str_pad((string) $numSequential, 4, '0', STR_PAD_LEFT);
    }
}
