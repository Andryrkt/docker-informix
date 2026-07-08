<?php

namespace App\Security;

use App\Security\Entity\User;
use App\Security\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Ldap\Exception\ConnectionException;
use Symfony\Component\Ldap\Ldap;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

/**
 * Authenticateur LDAP personnalisé.
 *
 * Flux :
 *  1. Intercepte POST /api/login avec JSON { username, password }
 *  2. Bind avec le compte de service → recherche l'utilisateur dans l'AD
 *  3. Bind avec username@fraise.hff.mg + password → valide les credentials
 *  4. Crée/met à jour l'utilisateur dans SQL Server
 *  5. Retourne un Passport que Lexik JWT transforme en token
 */
class LdapAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly Ldap                     $ldap,
        private readonly UserRepository           $userRepository,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly string                   $ldapSearchDn,
        private readonly string                   $ldapSearchPassword,
        private readonly string                   $ldapBaseDn,
        private readonly string                   $ldapDomain = 'fraise.hff.mg',
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->getPathInfo() === '/api/login'
            && $request->isMethod('POST')
            && str_contains((string) $request->headers->get('Content-Type', ''), 'application/json');
    }

    public function authenticate(Request $request): Passport
    {
        $data = json_decode($request->getContent(), true);

        $username = trim($data['username'] ?? '');
        $password  = $data['password'] ?? '';

        if ($username === '' || $password === '') {
            throw new BadCredentialsException('Les champs username et password sont obligatoires.');
        }

        // ── 1. Bind avec le compte de service pour chercher l'utilisateur ──────
        $t0 = microtime(true);
        try {
            $this->ldap->bind($this->ldapSearchDn, $this->ldapSearchPassword);
        } catch (ConnectionException $e) {
            throw new AuthenticationException('Impossible de joindre le serveur LDAP : ' . $e->getMessage());
        }
        error_log(sprintf('[AUTH] bind service: %dms', (int)((microtime(true) - $t0) * 1000)));

        // ── 2. Recherche par sAMAccountName ────────────────────────────────────
        $t1 = microtime(true);
        $query   = $this->ldap->query($this->ldapBaseDn, sprintf('(sAMAccountName=%s)', ldap_escape($username, '', LDAP_ESCAPE_FILTER)));
        $results = $query->execute()->toArray();
        error_log(sprintf('[AUTH] LDAP search: %dms', (int)((microtime(true) - $t1) * 1000)));

        if (count($results) === 0) {
            throw new BadCredentialsException('Utilisateur introuvable dans l\'annuaire.');
        }

        $entry = $results[0];
        $dn    = $entry->getDn();

        // ── 3. Bind utilisateur → valide le mot de passe ───────────────────────
        $t2 = microtime(true);
        try {
            // Utilisation du DN complet trouvé pour un bind plus précis et rapide
            $this->ldap->bind($dn, $password);
        } catch (ConnectionException) {
            throw new BadCredentialsException('Nom d\'utilisateur ou mot de passe incorrect.');
        }
        error_log(sprintf('[AUTH] bind user: %dms', (int)((microtime(true) - $t2) * 1000)));

        // ── 4. Extraire les attributs LDAP ─────────────────────────────────────
        $getAttribute = static fn (string $attr): ?string =>
            $entry->hasAttribute($attr) ? ($entry->getAttribute($attr)[0] ?? null) : null;

        $ldapAttributes = [
            'dn'          => $dn,
            'cn'          => $getAttribute('cn'),
            'mail'        => $getAttribute('mail'),
            'department'  => $getAttribute('department'),
            'displayname' => $getAttribute('displayName'),
        ];

        // ── 5. Créer/mettre à jour en SQL Server ───────────────────────────────
        $t3 = microtime(true);
        try {
            $user = $this->userRepository->findOrCreateFromLdap($username, $ldapAttributes);
        } catch (\Throwable $e) {
            error_log('[AUTH] SQL Server unavailable: ' . $e->getMessage());
            throw new AuthenticationException(
                'Le service est temporairement indisponible (base de données inaccessible). Veuillez réessayer dans quelques instants.'
            );
        }
        error_log(sprintf('[AUTH] SQL upsert: %dms', (int)((microtime(true) - $t3) * 1000)));

        return new SelfValidatingPassport(
            new UserBadge($username, fn () => $user)
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        /** @var User $user */
        $user = $token->getUser();
        $jwt  = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $jwt,
            'user'  => [
                'username'    => $user->getUserIdentifier(),
                'displayName' => $user->getDisplayName(),
                'email'       => $user->getEmail(),
                'roles'       => $user->getRoles(),
            ]
        ]);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // getMessage() contient notre message personnalisé (ex: "Service indisponible")
        // getMessageKey() est le fallback Symfony si getMessage() est vide
        $message = $exception->getMessage()
            ?: strtr($exception->getMessageKey(), $exception->getMessageData());

        return new JsonResponse(
            ['error' => $message],
            Response::HTTP_UNAUTHORIZED
        );
    }
}
