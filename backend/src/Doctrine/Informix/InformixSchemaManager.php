<?php
# app/src/Doctrine/Informix/InformixSchemaManager.php

namespace App\Doctrine\Informix;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Result;
use Doctrine\DBAL\Schema\AbstractSchemaManager;
use Doctrine\DBAL\Schema\Column;
use Doctrine\DBAL\Schema\ForeignKeyConstraint;
use Doctrine\DBAL\Schema\Index;
use Doctrine\DBAL\Schema\TableDiff;
use Doctrine\DBAL\Schema\View;
use Doctrine\DBAL\Types\Type;

class InformixSchemaManager extends AbstractSchemaManager
{
    // ── Noms des tables ───────────────────────────────────────────────────

    protected function selectTableNames(string $databaseName): Result
    {
        return $this->connection->executeQuery(
            "SELECT tabname FROM systables WHERE tabtype = 'T' AND tabid > 99 ORDER BY tabname"
        );
    }

    // ── Colonnes ──────────────────────────────────────────────────────────

    protected function selectTableColumns(string $databaseName, ?string $tableName = null): Result
    {
        $sql = "
            SELECT
                c.colname,
                c.coltype,
                c.collength,
                c.colno,
                t.tabname,
                CASE WHEN c.coltype < 256 THEN 'N' ELSE 'Y' END AS nullable
            FROM syscolumns c
            JOIN systables t ON c.tabid = t.tabid
            WHERE t.tabtype = 'T' AND t.tabid > 99
        ";

        if ($tableName !== null) {
            $sql .= " AND t.tabname = '$tableName'";
        }

        $sql .= " ORDER BY c.colno";

        return $this->connection->executeQuery($sql);
    }

    // ── Index ─────────────────────────────────────────────────────────────

    protected function selectIndexColumns(string $databaseName, ?string $tableName = null): Result
    {
        $sql = "
            SELECT
                i.idxname,
                i.idxtype,
                t.tabname,
                i.part1, i.part2, i.part3, i.part4,
                i.part5, i.part6, i.part7, i.part8
            FROM sysindexes i
            JOIN systables t ON i.tabid = t.tabid
            WHERE t.tabid > 99
        ";

        if ($tableName !== null) {
            $sql .= " AND t.tabname = '$tableName'";
        }

        return $this->connection->executeQuery($sql);
    }

    // ── Clés étrangères ───────────────────────────────────────────────────

    protected function selectForeignKeyColumns(string $databaseName, ?string $tableName = null): Result
    {
        $sql = "
            SELECT
                r.constrid,
                t.tabname,
                tc.tabname AS reftabname,
                c.colname,
                rc.colname AS refcolname
            FROM sysconstraints r
            JOIN systables t  ON r.tabid  = t.tabid
            JOIN systables tc ON r.tabid  = tc.tabid
            JOIN syscolumns c  ON c.tabid = t.tabid
            JOIN syscolumns rc ON rc.tabid = tc.tabid
            WHERE r.constrtype = 'R'
        ";

        if ($tableName !== null) {
            $sql .= " AND t.tabname = '$tableName'";
        }

        return $this->connection->executeQuery($sql);
    }

    // ── Vues ──────────────────────────────────────────────────────────────

    protected function selectViews(string $databaseName): Result
    {
        return $this->connection->executeQuery(
            "SELECT tabname AS viewname, '' AS viewdefinition
             FROM systables WHERE tabtype = 'V' AND tabid > 99"
        );
    }

    // ── Portage des données retournées ────────────────────────────────────

    protected function _getPortableTableColumnDefinition(array $tableColumn): Column
    {
        $type = $this->extractDoctrineType($tableColumn['coltype'] ?? 0);

        return new Column(
            trim($tableColumn['colname']),
            Type::getType($type),
            [
                'notnull' => (($tableColumn['coltype'] ?? 0) < 256),
                'length'  => $tableColumn['collength'] ?? null,
            ]
        );
    }

    protected function _getPortableTableDefinition(array $table): string
    {
        return trim($table['TABNAME']);
    }

    protected function _getPortableViewDefinition(array $view): View
    {
        return new View(trim($view['viewname']), $view['viewdefinition'] ?? '');
    }

    protected function _getPortableTableIndexesList(array $tableIndexes, string $tableName): array
    {
        $indexes = [];
        foreach ($tableIndexes as $row) {
            $name    = trim($row['idxname']);
            $unique  = ($row['idxtype'] === 'U');
            $primary = str_starts_with($name, ' ');
            $indexes[] = new Index($name, [], $unique, $primary);
        }
        return $indexes;
    }

    protected function _getPortableTableForeignKeysList(array $tableForeignKeys): array
    {
        $fks = [];
        foreach ($tableForeignKeys as $row) {
            $fks[] = new ForeignKeyConstraint(
                [$row['colname']],
                $row['reftabname'],
                [$row['refcolname']]
            );
        }
        return $fks;
    }

    // ── Helper type Informix → Doctrine ───────────────────────────────────

    private function extractDoctrineType(int $informixType): string
    {
        return match ($informixType % 256) {
            0       => 'string',    // CHAR
            1       => 'smallint',
            2       => 'integer',
            3       => 'float',
            4       => 'float',
            5       => 'decimal',
            6       => 'integer',   // SERIAL
            7       => 'date',
            8       => 'datetime',
            10      => 'string',    // VARCHAR
            13      => 'string',    // NCHAR
            15      => 'text',      // LVARCHAR
            default => 'string',
        };
    }

    protected function fetchTableOptionsByTable(string $databaseName, ?string $tableName = null): array
    {
        // Informix n'a pas d'options de table standard (ENGINE, CHARSET, etc.)
        return [];
    }

    protected function _getPortableTableForeignKeyDefinition(array $tableForeignKey): ForeignKeyConstraint
    {
        return new ForeignKeyConstraint(
            [$tableForeignKey['colname']],
            $tableForeignKey['reftabname'],
            [$tableForeignKey['refcolname']],
            $tableForeignKey['constrid'] ?? null
        );
    }
}
