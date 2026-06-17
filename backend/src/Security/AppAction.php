<?php

namespace App\Security;

/**
 * Centralisation de toutes les actions possibles dans le système de permissions.
 */
final class AppAction
{
    // Lecture
    public const VIEW   = 'view';
    public const EXPORT = 'export';   // Excel, PDF, CSV...
    public const PRINT  = 'print';

    // Écriture
    public const CREATE = 'create';
    public const EDIT   = 'edit';
    public const DELETE = 'delete';

    // Actions métier spécifiques
    public const VALIDATE  = 'validate';   // valider un bon de commande
    public const APPROVE   = 'approve';    // approuver une demande
    public const DUPLICATE = 'duplicate';  // dupliquer une fiche
    public const ARCHIVE   = 'archive';

    // Import
    public const IMPORT = 'import';

    // Administration
    public const MANAGE_USERS = 'manage_users';
    public const MANAGE_PERMS = 'manage_permissions';

    public const ALL = [
        self::VIEW, self::EXPORT, self::PRINT,
        self::CREATE, self::EDIT, self::DELETE,
        self::VALIDATE, self::APPROVE, self::DUPLICATE, self::ARCHIVE,
        self::IMPORT, self::MANAGE_USERS, self::MANAGE_PERMS,
    ];
}
