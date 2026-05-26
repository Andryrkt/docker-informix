<?php
echo "<h1>✅ Connexion Informix PHP 8 - OK</h1>";

$dsn = "informix:host=192.168.0.11;service=9088;database=ips_test;server=ol_iriumprod_net;protocol=onsoctcp;";

try {
    $pdo = new PDO($dsn, "informix", "k6UK19zaaAV10i", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "<p style='color:green;font-weight:bold'>Connexion PDO réussie !</p>";

    // Plusieurs requêtes de test
    $queries = [
        "SELECT DBINFO('version','full') as informix_version",
        "SELECT * FROM systables WHERE tabname = 'systables' LIMIT 1",
        "SELECT CURRENT YEAR TO SECOND as date_du_serveur",
        "SELECT * FROM Informix.neg_ent LIMIT 1"
    ];

    foreach ($queries as $sql) {
        echo "<h3>Requête : $sql</h3>";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        print_r($row);
        echo "<hr>";
    }
} catch (PDOException $e) {
    echo "<p style='color:red'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</p>";
}
