<?php

namespace App\Doctrine\SqlServer;

use Doctrine\DBAL\Driver;
use Doctrine\DBAL\Driver\Connection as DriverConnection;
use Doctrine\DBAL\Driver\PDO\Connection as PDOConnection;
use Doctrine\DBAL\Driver\PDO\Exception as PDOException;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Platforms\SQLServerPlatform;

class SqlServerDriver implements Driver
{
    public function connect(array $params): DriverConnection
    {
        $host     = $params['host']   ?? '127.0.0.1';
        $port     = $params['port']   ?? 1433;
        $dbname   = $params['dbname'] ?? '';
        $user     = $params['user']   ?? '';
        $password = $params['password'] ?? '';

        // TrustServerCertificate DOIT être dans le DSN — pdo_sqlsrv ignore cette
        // option quand elle est passée comme driverOption (4e arg PDO), ce qui
        // provoque un échec SSL suivi de retries coutant ~2.5s par connexion.
        $dsn = sprintf(
            'sqlsrv:Server=%s,%d;Database=%s;TrustServerCertificate=1;Encrypt=no;LoginTimeout=10',
            $host,
            (int) $port,
            $dbname,
        );

        // SQLSRV_ENCODING_UTF8 = 65001 : force pdo_sqlsrv à envoyer/recevoir
        // les chaînes en UTF-8 plutôt qu'en Windows-1252 (encodage système par défaut).
        $options = [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION];
        if (defined('PDO::SQLSRV_ATTR_ENCODING') && defined('PDO::SQLSRV_ENCODING_UTF8')) {
            $options[\PDO::SQLSRV_ATTR_ENCODING] = \PDO::SQLSRV_ENCODING_UTF8;
        }

        try {
            $t = microtime(true);
            $pdo = new \PDO($dsn, $user, $password, $options);
            error_log(sprintf('[SQLDRV] PDO connect: %dms | DSN: %s | trace: %s',
                (int)((microtime(true) - $t) * 1000),
                $dsn,
                implode(' < ', array_map(
                    fn($f) => ($f['class'] ?? '') . '::' . ($f['function'] ?? ''),
                    array_slice(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 8), 0, 5)
                ))
            ));

            return new PDOConnection($pdo);
        } catch (\PDOException $e) {
            throw new PDOException($e);
        }
    }

    public function getDatabasePlatform(\Doctrine\DBAL\ServerVersionProvider $versionProvider): AbstractPlatform
    {
        return new SQLServerPlatform();
    }

    public function getSchemaManager(\Doctrine\DBAL\Connection $conn, AbstractPlatform $platform): \Doctrine\DBAL\Schema\AbstractSchemaManager
    {
        return new \Doctrine\DBAL\Schema\SQLServerSchemaManager($conn, $platform);
    }

    public function getExceptionConverter(): \Doctrine\DBAL\Driver\API\ExceptionConverter
    {
        return new \Doctrine\DBAL\Driver\API\SQLSrv\ExceptionConverter();
    }
}
