<?php

namespace App\Tests\Unit\Security;

use App\Security\AppAction;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires pour AppAction.
 * Vérifie la cohérence des constantes et de la liste ALL.
 */
class AppActionTest extends TestCase
{
    public function testAllContainsExpectedNumberOfActions(): void
    {
        $this->assertCount(14, AppAction::ALL);
    }

    public function testAllContainsAllDeclaredConstants(): void
    {
        $expected = [
            AppAction::VIEW, AppAction::EXPORT, AppAction::PRINT,
            AppAction::CREATE, AppAction::EDIT, AppAction::DELETE,
            AppAction::VALIDATE, AppAction::APPROVE, AppAction::DUPLICATE, AppAction::ARCHIVE, AppAction::INTERVENE,
            AppAction::IMPORT, AppAction::MANAGE_USERS, AppAction::MANAGE_PERMS,
        ];

        foreach ($expected as $action) {
            $this->assertContains(
                $action,
                AppAction::ALL,
                "L'action '$action' est manquante dans AppAction::ALL"
            );
        }
    }

    public function testAllHasNoDuplicates(): void
    {
        $unique = array_unique(AppAction::ALL);
        $this->assertCount(count($unique), AppAction::ALL, 'AppAction::ALL contient des doublons');
    }

    public function testAllActionsAreNonEmptyStrings(): void
    {
        foreach (AppAction::ALL as $action) {
            $this->assertIsString($action);
            $this->assertNotEmpty($action);
        }
    }

    public function testActionConstantValues(): void
    {
        $this->assertSame('view',               AppAction::VIEW);
        $this->assertSame('export',             AppAction::EXPORT);
        $this->assertSame('print',              AppAction::PRINT);
        $this->assertSame('create',             AppAction::CREATE);
        $this->assertSame('edit',               AppAction::EDIT);
        $this->assertSame('delete',             AppAction::DELETE);
        $this->assertSame('validate',           AppAction::VALIDATE);
        $this->assertSame('approve',            AppAction::APPROVE);
        $this->assertSame('duplicate',          AppAction::DUPLICATE);
        $this->assertSame('archive',            AppAction::ARCHIVE);
        $this->assertSame('intervene',          AppAction::INTERVENE);
        $this->assertSame('import',             AppAction::IMPORT);
        $this->assertSame('manage_users',       AppAction::MANAGE_USERS);
        $this->assertSame('manage_permissions', AppAction::MANAGE_PERMS);
    }

    public function testActionsUseSnakeCase(): void
    {
        foreach (AppAction::ALL as $action) {
            $this->assertMatchesRegularExpression(
                '/^[a-z][a-z0-9_]*$/',
                $action,
                "L'action '$action' n'est pas en snake_case"
            );
        }
    }
}
