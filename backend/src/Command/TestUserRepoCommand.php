<?php

namespace App\Command;

use App\Security\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:test-user-repo')]
class TestUserRepoCommand extends Command
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        parent::__construct();
        $this->userRepository = $userRepository;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->info('Test de findOrCreateFromLdap...');

        $start = microtime(true);
        try {
            $user = $this->userRepository->findOrCreateFromLdap('test_user', [
                'mail' => 'test@hff.mg',
                'cn' => 'Test User',
                'dn' => 'CN=Test User,DC=fraise,DC=hff,DC=mg'
            ]);
            $io->success(sprintf('Utilisateur %s créé/mis à jour en %.2f s', $user->getUserIdentifier(), microtime(true) - $start));
        } catch (\Exception $e) {
            $io->error('Erreur : ' . $e->getMessage());
            $io->note(sprintf('Temps écoulé avant erreur : %.2f s', microtime(true) - $start));
        }

        return Command::SUCCESS;
    }
}
