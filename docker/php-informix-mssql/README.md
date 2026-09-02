# Image de base `hff/php-informix-mssql`

PHP 8.3 + Apache + pilotes Informix/SQL Server/LDAP, partagée entre
badm-rental et les futures applications HFF qui ont besoin des mêmes
connexions Informix/SQL Server. Rien de spécifique à une application
n'est présent ici — voir `api/Dockerfile` (badm-rental) pour un exemple
de projet qui en hérite.

## Prérequis avant de construire l'image

Le SDK Informix (propriété IBM, ~77 Mo) n'est **pas commité dans git**
(`lib/` est ignoré). À déposer manuellement une seule fois par machine qui
construit cette image (dev ou serveur) :

- `lib/ibm.csdk.15.0.1.0.Linux.64.x86_64.tar`
- `lib/response.properties`
- `lib/pdo_informix/` (sources de l'extension PHP, sans son propre dossier
  `docker/` ni `tests/` — non utilisés par ce build)

## Construire l'image

```bash
docker build -t hff/php-informix-mssql:8.3 docker/php-informix-mssql
```

À refaire à chaque fois que ce `Dockerfile` change (mise à jour de PHP, des
pilotes...). Les applications qui en héritent (`FROM
hff/php-informix-mssql:8.3`) doivent la reconstruire (ou la re-tirer d'un
registre, si on en met un en place plus tard) avant leur propre build.
