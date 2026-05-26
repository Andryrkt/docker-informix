<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

use Doctrine\DBAL\Connection;

#[AsCommand(name: 'app:test-sqlserver')]
class TestSqlServerCommand extends Command
{
    private Connection $sqlserverConnection;

    public function __construct(Connection $sqlserverConnection)
    {
        parent::__construct();
        $this->sqlserverConnection = $sqlserverConnection;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $result = $this->sqlserverConnection->executeQuery('SELECT @@VERSION as version');
            $row = $result->fetchAssociative();

            $io->success('✅ Connexion SQL Server réussie !');
            $io->text('Version : ' . $row['version']);
        } catch (\Exception $e) {
            $io->error('❌ Erreur : ' . $e->getMessage());
        }

        return Command::SUCCESS;
    }
}
