<?php

namespace App\Shared\Service;

use App\Shared\Repository\NumeroCounterRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Génère les numéros de document (DIT, TIK, ...) au format {CODE}{AAMM}{NNNN},
 * en portant fidèlement l'algorithme legacy (App\Service\AutoIncDecService::
 * autoGenerateNumero côté scomat) — y compris son comportement historique de
 * DÉCRÉMENTATION du compteur au sein du mois pour certaines applications
 * (DIT), quand d'autres incrémentent normalement (TIK) : le sens est un
 * paramètre, pas une constante, pour rester fidèle à chaque legacy plutôt que
 * d'en inventer un commun.
 *
 * Le compteur (NumeroCounter, une ligne par codeApp — voir
 * App\Audit\Entity\AuditOperation::DOC_*) est verrouillé (lock pessimiste) le
 * temps de la génération, pour éviter la race condition relevée dans l'ancien
 * système (deux créations concurrentes pouvaient produire le même numéro).
 */
final class NumeroGeneratorService
{
    public function __construct(
        private readonly EntityManagerInterface $emSqlServer,
        private readonly NumeroCounterRepository $counterRepo,
    ) {}

    public function generer(string $codeApp, bool $increment): string
    {
        return $this->emSqlServer->wrapInTransaction(function () use ($codeApp, $increment) {
            $counter = $this->counterRepo->lockOrCreate($codeApp);
            $nouveauNumero = self::autoGenerateNumero($codeApp, $counter->getDerniereId(), $increment);
            $counter->setDerniereId($nouveauNumero);

            return $nouveauNumero;
        });
    }

    /**
     * Port direct de AutoIncDecService::autoGenerateNumero (scomat).
     * $increment = false ⇒ décrémente le compteur du mois plutôt que de
     * l'incrémenter — comportement legacy DIT volontairement conservé.
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
