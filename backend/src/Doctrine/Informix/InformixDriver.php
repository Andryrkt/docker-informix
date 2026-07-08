<?php
namespace App\Doctrine\Informix;
use Doctrine\DBAL\Driver;
use Doctrine\DBAL\Driver\Connection as DriverConnection;
use Doctrine\DBAL\Platforms\AbstractPlatform;

class InformixDriver implements Driver
{
    public function connect(array $params): DriverConnection
    {
        $host     = $params['host']     ?? '192.168.0.11';
        $port     = $params['port']     ?? '9088';
        $dbname   = $params['dbname']   ?? 'ips_test';
        $user     = $params['user']     ?? 'informix';
        $password = $params['password'] ?? '';
        $server   = $params['server']   ?? getenv('INFORMIXSERVER') ?: 'ol_iriumprod_net';

        $dsn = "informix:host=$host;service=$port;server=$server;database=$dbname;protocol=onsoctcp;DELIMIDENT=Y";

        // echo "🔍 DSN : $dsn\n";

        try {
            $pdo = new \PDO($dsn, $user, $password, [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_TIMEOUT => 10,
                // Le driver Informix renvoie les noms de colonnes en MAJUSCULES
                // (ex: "ID" au lieu de "id"), y compris pour des alias déclarés
                // en minuscules dans le SQL. Sans ce forçage, Doctrine ORM ne
                // peut pas hydrater les entités (IdentifierFlattener cherche
                // la clé "id" et ne trouve que "ID") et tout accès par clé
                // minuscule sur un résultat brut (ex: $row['numero_devis'])
                // échoue silencieusement.
                \PDO::ATTR_CASE => \PDO::CASE_LOWER,
            ]);
            // echo "✅ Connexion PDO réussie\n";
            return new \Doctrine\DBAL\Driver\PDO\Connection($pdo);
        } catch (\PDOException $e) {
            echo "❌ Erreur : " . $e->getMessage() . "\n";
            throw new \Doctrine\DBAL\Driver\PDO\Exception($e);
        }
    }

    public function getDatabasePlatform(\Doctrine\DBAL\ServerVersionProvider $versionProvider): AbstractPlatform
    {
        return new InformixPlatform();
    }

    public function getSchemaManager(\Doctrine\DBAL\Connection $conn, AbstractPlatform $platform)
    {
        return new InformixSchemaManager($conn, $platform);
    }

    public function getExceptionConverter(): \Doctrine\DBAL\Driver\API\ExceptionConverter
    {
        return new class implements \Doctrine\DBAL\Driver\API\ExceptionConverter {
            public function convert(\Doctrine\DBAL\Driver\Exception $exception, ?\Doctrine\DBAL\Query $query): \Doctrine\DBAL\Exception\DriverException
            {
                return new \Doctrine\DBAL\Exception\DriverException($exception, $query);
            }
        };
    }
}
