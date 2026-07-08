<?php

namespace App\Tests\Unit\Security\Entity;

use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires pour l'entité UserPermission.
 * Aucune dépendance sur la base de données ni sur le kernel Symfony.
 */
class UserPermissionTest extends TestCase
{
    private function makePermission(): UserPermission
    {
        return new UserPermission();
    }

    // ── Valeurs par défaut ───────────────────────────────────────────────────

    public function testDefaultScopeIsAll(): void
    {
        $perm = $this->makePermission();
        $this->assertTrue($perm->isScopeAll());
    }

    public function testDefaultActionsIsEmpty(): void
    {
        $perm = $this->makePermission();
        $this->assertSame([], $perm->getActions());
    }

    public function testDefaultAgencyScopesIsEmpty(): void
    {
        $perm = $this->makePermission();
        $this->assertSame([], $perm->getAgencyScopes());
    }

    public function testIdIsNullBeforePersist(): void
    {
        $this->assertNull($this->makePermission()->getId());
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public function testSetAndGetResourceType(): void
    {
        $perm = $this->makePermission();
        $perm->setResourceType('module');
        $this->assertSame('module', $perm->getResourceType());

        $perm->setResourceType('menu');
        $this->assertSame('menu', $perm->getResourceType());
    }

    public function testSetAndGetResourceId(): void
    {
        $perm = $this->makePermission();
        $perm->setResourceId(42);
        $this->assertSame(42, $perm->getResourceId());
    }

    public function testSetAndGetUser(): void
    {
        $perm = $this->makePermission();
        $user = new User();
        $perm->setUser($user);
        $this->assertSame($user, $perm->getUser());
    }

    public function testSetAndGetCompany(): void
    {
        $perm = $this->makePermission();
        $company = new Company();
        $perm->setCompany($company);
        $this->assertSame($company, $perm->getCompany());
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    public function testSetActions(): void
    {
        $perm = $this->makePermission();
        $perm->setActions(['view', 'edit']);
        $this->assertSame(['view', 'edit'], $perm->getActions());
    }

    public function testSetActionsDeduplicates(): void
    {
        $perm = $this->makePermission();
        $perm->setActions(['view', 'edit', 'view', 'edit']);
        $this->assertCount(2, $perm->getActions());
        $this->assertContains('view', $perm->getActions());
        $this->assertContains('edit', $perm->getActions());
    }

    public function testHasActionReturnsTrueWhenPresent(): void
    {
        $perm = $this->makePermission();
        $perm->setActions(['view', 'edit', 'validate']);

        $this->assertTrue($perm->hasAction('view'));
        $this->assertTrue($perm->hasAction('edit'));
        $this->assertTrue($perm->hasAction('validate'));
    }

    public function testHasActionReturnsFalseWhenAbsent(): void
    {
        $perm = $this->makePermission();
        $perm->setActions(['view']);

        $this->assertFalse($perm->hasAction('edit'));
        $this->assertFalse($perm->hasAction('delete'));
        $this->assertFalse($perm->hasAction(''));
    }

    public function testHasActionIsCaseSensitive(): void
    {
        $perm = $this->makePermission();
        $perm->setActions(['view']);

        $this->assertFalse($perm->hasAction('VIEW'));
        $this->assertFalse($perm->hasAction('View'));
    }

    // ── Scope ────────────────────────────────────────────────────────────────

    public function testSetScopeAllToFalse(): void
    {
        $perm = $this->makePermission();
        $perm->setScopeAll(false);
        $this->assertFalse($perm->isScopeAll());
    }

    public function testSetScopeAllToTrue(): void
    {
        $perm = $this->makePermission();
        $perm->setScopeAll(false);
        $perm->setScopeAll(true);
        $this->assertTrue($perm->isScopeAll());
    }

    public function testSetAndGetAgencyScopes(): void
    {
        $perm = $this->makePermission();

        $scopes = [
            ['agencyId' => 12, 'allServices' => true,  'serviceIds' => []],
            ['agencyId' => 7,  'allServices' => false, 'serviceIds' => [3, 9]],
        ];

        $perm->setAgencyScopes($scopes);
        $this->assertSame($scopes, $perm->getAgencyScopes());
    }

    public function testSetEmptyAgencyScopes(): void
    {
        $perm = $this->makePermission();
        $perm->setAgencyScopes([]);
        $this->assertSame([], $perm->getAgencyScopes());
    }

    public function testAgencyScopesWithMixedServices(): void
    {
        $perm = $this->makePermission();
        $perm->setScopeAll(false);

        $scopes = [
            ['agencyId' => 1, 'allServices' => true,  'serviceIds' => []],
            ['agencyId' => 2, 'allServices' => false, 'serviceIds' => [10, 20, 30]],
        ];
        $perm->setAgencyScopes($scopes);

        $result = $perm->getAgencyScopes();
        $this->assertCount(2, $result);

        $this->assertTrue($result[0]['allServices']);
        $this->assertEmpty($result[0]['serviceIds']);

        $this->assertFalse($result[1]['allServices']);
        $this->assertCount(3, $result[1]['serviceIds']);
    }

    // ── Fluent interface ─────────────────────────────────────────────────────

    public function testSettersReturnStaticForFluentChaining(): void
    {
        $perm = $this->makePermission();

        $result = $perm
            ->setResourceType('module')
            ->setResourceId(1)
            ->setActions(['view'])
            ->setScopeAll(true)
            ->setAgencyScopes([]);

        $this->assertInstanceOf(UserPermission::class, $result);
    }
}
