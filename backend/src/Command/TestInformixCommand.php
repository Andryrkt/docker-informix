<?php

# app/src/Command/TestInformixCommand.php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:test-informix')]
class TestInformixCommand extends Command
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        parent::__construct();
        $this->connection = $connection;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Test 1 : connexion (on force via une requête, pas connect() directement)
        try {
            $this->connection->executeQuery('SELECT FIRST 1 tabid FROM systables');
            $output->writeln('<info>✓ Connexion OK</info>');
        } catch (\Exception $e) {
            $output->writeln('<error>✗ Connexion échouée : ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }

        // Test 2 : requête simple
        try {
            $result = $this->connection->executeQuery('SELECT FIRST 1 tabname FROM systables');
            $row = $result->fetchAssociative();
            $output->writeln('<info>✓ Requête OK : ' . json_encode($row) . '</info>');
        } catch (\Exception $e) {
            $output->writeln('<error>✗ Requête échouée : ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }

        // Test 3 : interroger la table neg_ent (premières lignes)
        try {
            $result = $this->connection->executeQuery(
                "SELECT FIRST 5 * FROM informix.neg_ent"
            );
            $rows = $result->fetchAllAssociative();
            $output->writeln('<info>✓ Lignes trouvées dans neg_ent (max 5) : ' . count($rows) . '</info>');
            foreach ($rows as $row) {
                $output->writeln('   - ' . json_encode($row));
            }
        } catch (\Exception $e) {
            $output->writeln('<error>✗ Requête table neg_ent échouée : ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
