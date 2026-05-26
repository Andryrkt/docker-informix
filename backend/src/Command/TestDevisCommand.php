<?php

namespace App\Command;

use App\Repository\Ips\NegEntRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-devis',
    description: 'Teste la requête des devis avec pagination'
)]
class TestDevisCommand extends Command
{
    private NegEntRepository $negEntRepository;

    public function __construct(
        NegEntRepository $negEntRepository
    ) {
        parent::__construct();
        $this->negEntRepository = $negEntRepository;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Test Requête Devis - Informix');

        $codeSociete = 'HF';   // À modifier selon tes besoins
        $sucNeg      = '01';   // À modifier

        try {
            $devis = $this->negEntRepository->findDevisList(
                codeSociete: $codeSociete,
                sucNeg: $sucNeg,
                skip: 0,
                limit: 20
            );

            $io->success(sprintf(
                '✅ %d devis récupérés pour %s - %s',
                count($devis),
                $codeSociete,
                $sucNeg
            ));

            // Affichage des 5 premiers résultats
            $io->table(
                ['N° Devis', 'Date Création', 'Client', 'Montant', 'Statut BC', 'Relance 1'],
                array_map(function ($d) {
                    return [
                        $d['numero_devis'] ?? '',
                        $d['date_creation'] ?? '',
                        substr($d['client'] ?? '', 0, 40),
                        number_format($d['montant_devis'] ?? 0, 2, ',', ' ') . ' ' . ($d['devise'] ?? ''),
                        $d['statut_bc'] ?? '',
                        $d['statut_relance_1'] ?? '-',
                    ];
                }, array_slice($devis, 0, 5))
            );

            if (empty($devis)) {
                $io->warning('Aucun devis trouvé avec ces critères.');
            }
        } catch (\Exception $e) {
            $io->error('Erreur : ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
