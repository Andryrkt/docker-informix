# creation de database sqlserver
$ php bin/console doctrine:database:create --em=sqlserver

# supprimer la database sqlserver
$ php bin/console doctrine:database:drop --em=sqlserver --force


# creation des table
$ php bin/console doctrine:migrations:migrate --em=sqlserver
$ php bin/console doctrine:schema:update --em=sqlserver --force

# creation des donnees
$ php bin/console doctrine:fixtures:load --em=sqlserver --no-interaction
