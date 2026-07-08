---
sidebar_position: 3
---

# Guide de l'Environnement Docker

Ce document explique comment utiliser et gérer l'architecture multi-conteneurs du projet HFF.

## Architecture des Conteneurs

Le projet est divisé en trois services isolés :

1.  **Backend (hff_backend)** : API Symfony 7.4 (PHP 8.3) avec drivers Informix, SQL Server et LDAP.
2.  **Frontend (hff_frontend)** : Application React + Vite.
3.  **Documentation (hff_docs)** : Site Docusaurus (ce site même).

## Accès aux Services

En mode développement, chaque service est accessible via une URL spécifique sur `localhost` :

| Service | URL | Port |
| :--- | :--- | :--- |
| **Frontend (React)** | [http://localhost:5173](http://localhost:5173) | 5173 |
| **API Backend** | [http://localhost:8080](http://localhost:8080) | 8080 |
| **Documentation** | [http://localhost:3000](http://localhost:3000) | 3000 |

## Commandes Utiles

Les commandes suivantes doivent être exécutées à la racine du projet (là où se trouve le fichier `docker-compose.yml`).

### Gestion des Conteneurs

```bash
# Lancer tous les services en arrière-plan
docker compose up -d

# Arrêter les services
docker compose stop

# Tout supprimer et reconstruire (en cas de changement de Dockerfile)
docker compose down
docker compose up -d --build
```

### Consultation des Logs

Très utile pour débugger ou vérifier l'avancement des installations `npm`.

```bash
# Voir les logs du frontend (Vite / npm install)
docker logs -f hff_frontend

# Voir les logs du backend (Apache / PHP)
docker logs -f hff_backend

# Voir les logs de la documentation
docker logs -f hff_docs
```

### Exécution de Commandes Interne

#### Symfony (Backend)
```bash
# Vider le cache
docker compose exec backend symfony-console cache:clear

# Voir la liste des commandes Symfony
docker compose exec backend symfony-console list

# Accéder au shell interne du conteneur
docker compose exec backend bash
```

#### Frontend & Docs (Node.js)
```bash
# Installer un nouveau package dans le frontend
docker compose exec frontend npm install <package_name>

# Accéder au shell du frontend
docker compose exec frontend sh
```

## Structure du Projet

- **`/backend`** : Contient le code Symfony, le `Dockerfile` de production et les fichiers d'installation Informix.
- **`/frontend`** : Contient le code React et son `Dockerfile-dev`.
- **`/docs-hff`** : Contient les sources de cette documentation.
- **`docker-compose.yml`** : Fichier d'orchestration à la racine.

## Points d'Attention

- **Réseau** : Le backend doit avoir accès aux IPs `192.168.0.11` (Informix), `192.168.0.28` (SQL Server) et `192.168.0.1` (LDAP).
- **CORS** : La configuration CORS dans Symfony (`backend/config/packages/nelmio_cors.yaml` et `.env`) autorise explicitement les requêtes venant de `localhost:5173`.
