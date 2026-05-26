<?php
# app/src/Doctrine/Informix/InformixPlatform.php

namespace App\Doctrine\Informix;

use Doctrine\DBAL\Platforms\AbstractPlatform;

class InformixPlatform extends AbstractPlatform
{
    public function getName(): string
    {
        return 'informix';
    }

    // ── Méthodes abstraites obligatoires ──────────────────────────────────

    public function getSmallIntTypeDeclarationSQL(array $column): string
    {
        return 'SMALLINT';
    }

    public function _getCommonIntegerTypeDeclarationSQL(array $column): string
    {
        return !empty($column['autoincrement']) ? 'SERIAL' : '';
    }

    public function initializeDoctrineTypeMappings(): void
    {
        $this->doctrineTypeMapping = [
            'char'         => 'string',
            'varchar'      => 'string',
            'nchar'        => 'string',
            'nvarchar'     => 'string',
            'lvarchar'     => 'string',
            'text'         => 'text',
            'byte'         => 'blob',
            'smallint'     => 'smallint',
            'integer'      => 'integer',
            'int'          => 'integer',
            'int8'         => 'bigint',
            'serial'       => 'integer',
            'serial8'      => 'bigint',
            'bigserial'    => 'bigint',
            'float'        => 'float',
            'smallfloat'   => 'float',
            'double'       => 'float',
            'decimal'      => 'decimal',
            'money'        => 'decimal',
            'numeric'      => 'decimal',
            'date'         => 'date',
            'datetime'     => 'datetime',
            'boolean'      => 'boolean',
        ];
    }

    public function getClobTypeDeclarationSQL(array $column): string
    {
        return 'TEXT';
    }

    public function getBlobTypeDeclarationSQL(array $column): string
    {
        return 'BYTE';
    }

    // ── Types ─────────────────────────────────────────────────────────────

    public function getIntegerTypeDeclarationSQL(array $column): string
    {
        return !empty($column['autoincrement']) ? 'SERIAL' : 'INTEGER';
    }

    public function getBigIntTypeDeclarationSQL(array $column): string
    {
        return !empty($column['autoincrement']) ? 'SERIAL8' : 'INT8';
    }

    public function getVarcharTypeDeclarationSQL(array $column): string
    {
        return 'VARCHAR(' . ($column['length'] ?? 255) . ')';
    }

    public function getBooleanTypeDeclarationSQL(array $column): string
    {
        return 'BOOLEAN';
    }

    public function getDateTimeTypeDeclarationSQL(array $column): string
    {
        return 'DATETIME YEAR TO SECOND';
    }

    public function getDateTypeDeclarationSQL(array $column): string
    {
        return 'DATE';
    }

    public function getTimeTypeDeclarationSQL(array $column): string
    {
        return 'DATETIME HOUR TO SECOND';
    }

    // ── SQL divers ────────────────────────────────────────────────────────

    public function getCurrentDateSQL(): string
    {
        return 'TODAY';
    }
    public function getCurrentTimeSQL(): string
    {
        return 'CURRENT HOUR TO SECOND';
    }
    public function getCurrentTimestampSQL(): string
    {
        return 'CURRENT YEAR TO SECOND';
    }

    public function getListTablesSQL(): string
    {
        return "SELECT tabname FROM systables WHERE tabtype = 'T' AND tabid > 99";
    }

    // ── SKIP/FIRST (Informix) ─────────────────────────────────────────────

    protected function doModifyLimitQuery(string $query, ?int $limit, int $offset): string
    {
        $skip  = $offset > 0     ? "SKIP $offset "  : '';
        $first = $limit !== null ? "FIRST $limit "  : '';

        if ($skip || $first) {
            $query = preg_replace('/^SELECT\s+/i', "SELECT {$skip}{$first}", $query);
        }

        return $query;
    }

    // ── Capacités ─────────────────────────────────────────────────────────

    public function supportsSequences(): bool
    {
        return false;
    }
    public function supportsIdentityColumns(): bool
    {
        return true;
    }
    public function supportsInlineColumnComments(): bool
    {
        return false;
    }

    // ── DDL ───────────────────────────────────────────────────────────────

    public function getCreateTableSQL(\Doctrine\DBAL\Schema\Table $table, int $createFlags = self::CREATE_INDEXES): array
    {
        return parent::getCreateTableSQL($table, $createFlags);
    }

    // ── Expressions ───────────────────────────────────────────────────────

    public function getLocateExpression(string $string, string $substr, ?string $startPos = null): string
    {
        // Informix : CHARINDEX ou utiliser une expression native
        if ($startPos !== null) {
            return "CHARINDEX($substr, $string, $startPos)";
        }
        return "CHARINDEX($substr, $string)";
    }

    public function getDateDiffExpression(string $date1, string $date2): string
    {
        // Informix : soustraction directe de dates retourne des jours
        return "($date1 - $date2)";
    }

    public function getDateArithmeticIntervalExpression(
        string $date,
        string $operator,
        string $interval,
        \Doctrine\DBAL\Platforms\DateIntervalUnit $unit
    ): string {
        $intervalStr = match ($unit) {
            \Doctrine\DBAL\Platforms\DateIntervalUnit::YEAR   => "$interval UNITS YEAR",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::MONTH  => "$interval UNITS MONTH",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::WEEK   => ($interval * 7) . " UNITS DAY",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::DAY    => "$interval UNITS DAY",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::HOUR   => "$interval UNITS HOUR",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::MINUTE => "$interval UNITS MINUTE",
            \Doctrine\DBAL\Platforms\DateIntervalUnit::SECOND => "$interval UNITS SECOND",
            default => "$interval UNITS DAY",
        };

        return "($date $operator $intervalStr)";
    }

    public function getTrimExpression(
        string $str,
        \Doctrine\DBAL\Platforms\TrimMode $mode = \Doctrine\DBAL\Platforms\TrimMode::UNSPECIFIED,
        ?string $char = null
    ): string {
        return match ($mode) {
            \Doctrine\DBAL\Platforms\TrimMode::LEADING  => "LTRIM($str)",
            \Doctrine\DBAL\Platforms\TrimMode::TRAILING => "RTRIM($str)",
            default                                      => "TRIM($str)",
        };
    }

    public function getColumnDeclarationListSQL(array $columns): string
    {
        $declarations = [];
        foreach ($columns as $name => $column) {
            $declarations[] = $this->getColumnDeclarationSQL($name, $column);
        }
        return implode(', ', $declarations);
    }

    public function getSubstringExpression(string $string, string $start, ?string $length = null): string
    {
        if ($length !== null) {
            return "SUBSTRING($string FROM $start FOR $length)";
        }
        return "SUBSTRING($string FROM $start)";
    }

    public function getLengthExpression(string $column): string
    {
        return "LENGTH($column)";
    }

    public function getDateTimeTzTypeDeclarationSQL(array $column): string
    {
        return 'DATETIME YEAR TO SECOND';
    }

    public function getFloatDeclarationSQL(array $column): string
    {
        return 'FLOAT';
    }

    // ── Les 6 méthodes abstraites restantes ───────────────────────────────

    public function getCurrentDatabaseExpression(): string
    {
        // Informix : DBINFO retourne le nom de la base courante
        return "DBINFO('dbname')";
    }

    public function getAlterTableSQL(\Doctrine\DBAL\Schema\TableDiff $diff): array
    {
        $sql = [];
        foreach ($diff->addedColumns as $column) {
            $sql[] = 'ALTER TABLE ' . $diff->name
                . ' ADD ' . $this->getColumnDeclarationSQL($column->getName(), $column->toArray());
        }
        foreach ($diff->changedColumns as $columnDiff) {
            $sql[] = 'ALTER TABLE ' . $diff->name
                . ' MODIFY ' . $this->getColumnDeclarationSQL(
                    $columnDiff->column->getName(),
                    $columnDiff->column->toArray()
                );
        }
        foreach ($diff->removedColumns as $column) {
            $sql[] = 'ALTER TABLE ' . $diff->name . ' DROP ' . $column->getName();
        }
        return $sql;
    }

    public function getListViewsSQL(string $database): string
    {
        return "SELECT tabname AS viewname, '' AS viewdefinition
                FROM systables
                WHERE tabtype = 'V' AND tabid > 99";
    }

    public function getCreateDatabaseSQL(string $name): string
    {
        return "CREATE DATABASE $name";
    }

    public function getDropDatabaseSQL(string $name): string
    {
        return "DROP DATABASE $name";
    }

    public function getListDatabasesSQL(): string
    {
        // Informix n'a pas de requête standard, on retourne une requête vide
        return "SELECT name FROM sysmaster:sysdatabases";
    }
    // ── 3 dernières méthodes abstraites ──────────────────────────────────

    public function getSetTransactionIsolationSQL(
        \Doctrine\DBAL\TransactionIsolationLevel $level
    ): string {
        return match ($level) {
            \Doctrine\DBAL\TransactionIsolationLevel::READ_UNCOMMITTED => 'SET ISOLATION TO DIRTY READ',
            \Doctrine\DBAL\TransactionIsolationLevel::READ_COMMITTED   => 'SET ISOLATION TO COMMITTED READ',
            \Doctrine\DBAL\TransactionIsolationLevel::REPEATABLE_READ  => 'SET ISOLATION TO REPEATABLE READ',
            \Doctrine\DBAL\TransactionIsolationLevel::SERIALIZABLE     => 'SET ISOLATION TO SERIALIZABLE',
            default                                                     => 'SET ISOLATION TO COMMITTED READ',
        };
    }

    protected function createReservedKeywordsList(): \Doctrine\DBAL\Platforms\Keywords\KeywordList
    {
        // On réutilise une liste générique faute de liste Informix native
        return new \Doctrine\DBAL\Platforms\Keywords\SQLKeywords();
    }

    public function createSchemaManager(
        \Doctrine\DBAL\Connection $connection
    ): \App\Doctrine\Informix\InformixSchemaManager {
        return new \App\Doctrine\Informix\InformixSchemaManager($connection, $this);
    }
}
