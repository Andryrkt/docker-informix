<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Ldap\Ldap;

class TestLdapCommand extends Command
{
    protected static $defaultName = 'app:test-ldap';
    protected static $defaultDescription = 'Teste la connexion et la recherche sur le serveur LDAP';

    private string $ldapUrl;
    private string $ldapSearchDn;
    private string $ldapSearchPassword;
    private string $ldapBaseDn;

    public function __construct(
        string $ldapUrl,
        string $ldapSearchDn,
        string $ldapSearchPassword,
        string $ldapBaseDn
    ) {
        parent::__construct(self::$defaultName);
        $this->ldapUrl = $ldapUrl;
        $this->ldapSearchDn = $ldapSearchDn;
        $this->ldapSearchPassword = $ldapSearchPassword;
        $this->ldapBaseDn = $ldapBaseDn;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'Le nom d\'utilisateur (sAMAccountName) à rechercher')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $username = $input->getArgument('username');

        try {
            $io->info(sprintf('Tentative de connexion au serveur LDAP : %s', $this->ldapUrl));
            
            $ldap = Ldap::create('ext_ldap', [
                'connection_string' => $this->ldapUrl,
            ]);

            $io->info(sprintf('Bind avec le compte de service : %s', $this->ldapSearchDn));
            $ldap->bind($this->ldapSearchDn, $this->ldapSearchPassword);

            $io->success('Connexion (Bind) réussie !');

            $io->info(sprintf('Recherche de l\'utilisateur "%s" dans l\'OU : %s', $username, $this->ldapBaseDn));
            
            $query = $ldap->query($this->ldapBaseDn, '(sAMAccountName='.$username.')');
            $results = $query->execute();
            
            $users = $results->toArray();
            
            if (count($users) > 0) {
                $user = $users[0];
                $io->success(sprintf('Utilisateur trouvé : %s', $user->getAttribute('cn')[0] ?? 'Inconnu'));
                
                if ($user->hasAttribute('mail')) {
                    $io->writeln(' Email : ' . $user->getAttribute('mail')[0]);
                }
                if ($user->hasAttribute('title')) {
                    $io->writeln(' Titre : ' . $user->getAttribute('title')[0]);
                }
                if ($user->hasAttribute('department')) {
                    $io->writeln(' Département : ' . $user->getAttribute('department')[0]);
                }
            } else {
                $io->warning('La connexion fonctionne, mais cet utilisateur n\'a pas été trouvé dans cet OU.');
            }

        } catch (\Exception $e) {
            $io->error('Erreur LDAP : ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
