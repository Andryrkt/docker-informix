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

        // Test 3 : lister les tables utilisateur
        try {
            $result = $this->connection->executeQuery(
                "SELECT tabname FROM systables WHERE tabtype = 'T' AND tabid > 99"
            );
            $tables = $result->fetchAllAssociative();
            $output->writeln('<info>✓ Tables trouvées : ' . count($tables) . '</info>');
            foreach ($tables as $table) {
                $output->writeln('   - ' . trim($table['tabname']));
            }
        } catch (\Exception $e) {
            $output->writeln('<error>✗ Liste tables échouée : ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
