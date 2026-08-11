# Documentation Architecture Front-end (SCOMAT)

Ce document décrit l'architecture, les patterns complexes et les choix techniques principaux utilisés dans le développement du Front-end. L'application est construite avec React, TypeScript et Vite, en mettant l'accent sur la sécurité, la modularité et l'expérience utilisateur.

## 1. Architecture Orientée Domaine (Domain-Driven Design - DDD)

L'application abandonne la structure classique par type de fichier (ex: tous les composants ensemble, tous les hooks ensemble) au profit d'une **architecture orientée domaine**. Tout le code métier est encapsulé dans le dossier `src/domains/`.

Chaque sous-dossier de `domains/` représente un "Bounded Context" (Contexte Délimité) tel que :
- `admin` (Administration)
- `atelier` (Atelier mécanique)
- `authentification` (Connexion et profils)
- `magasin` (Gestion des stocks et pièces)
- `it` (Support informatique)

À l'intérieur de chaque domaine, l'architecture est découpée logiquement :
- **`api/`** : Appels réseaux spécifiques au domaine (généralement via Axios).
- **`components/`** : Composants React spécifiques à ce domaine.
- **`hook/`** (ou `hooks/`) : Hooks personnalisés (React Query) pour la gestion d'état et le data-fetching du domaine.
- **`pages/`** : Vues principales du routage.
- **`schema/`** : Définitions Zod et types TypeScript pour la validation des données.

Cette approche permet de scaler l'application indéfiniment tout en gardant un code fortement cohésif et faiblement couplé.

## 2. Sécurité & Gestion des Habilitations

La sécurité est implémentée à plusieurs couches de l'application :

### 2.1. Intercepteurs Axios & Gestion des Tokens
Toutes les requêtes passent par une instance configurée (`conf/axios.ts`). 
- **Injection** : Les `access_token` et `X-Active-Company-ID` sont automatiquement injectés dans les headers.
- **Refresh Token** : L'intercepteur intercepte les erreurs HTTP `401 Unauthorized`. Si un `refresh_token` est disponible, il place les requêtes en échec dans une file d'attente (queue), effectue la requête de rafraîchissement, met à jour le token, et rejoue automatiquement les requêtes échouées.
- **Déconnexion sécurisée** : Lors du `logout` (dans `authContext.tsx`), les tokens sont supprimés de manière synchrone avant de vider le cache de React Query (`queryClient.clear()`). Cela empêche l'application de déclencher des requêtes réseau non authentifiées qui provoqueraient des rechargements brutaux de la page (`window.location.href`).

### 2.2. Route Guards (Composants de protection)
Le routage React Router est protégé par des composants d'enveloppement (Guards) :
- `<RequireAuth>` : Vérifie la présence de l'utilisateur. Si absent, il utilise `<Navigate to="/login" replace />` pour bloquer l'accès sans rechargement de page.
- `<RequireCompany>` : S'assure que l'utilisateur a sélectionné une société de travail avant d'accéder au dashboard métier.
- `<AnonymousOnly>` : Empêche un utilisateur déjà connecté de retourner sur la page de connexion.

### 2.3. Routage Dynamique Sécurisé
La fonction `buildRoutesFromMenu(modules)` convertit dynamiquement le payload du menu renvoyé par l'API (qui dépend des droits du backend) en un arbre de routes React Router (`RouteObject[]`). 
- Le fallback (`<DynamicRouteFallback />` ou `*`) s'assure qu'en cas de rechargement manuel (F5) sur une URL dynamique, le système affiche un spinner de chargement, construit le routeur, puis affiche la page, évitant ainsi l'erreur 404 intempestive de React Router v6.

## 3. Personnalisation de l'Interface (Custom Labels & Icônes)

### 3.1. Custom Labels (Fil d'Ariane & Titres)
Pour que l'expérience utilisateur soit la plus compréhensible possible, les routes techniques sont converties en noms lisibles via `components/common/Custom/customLabels.ts`. 
Ce dictionnaire agit comme un mapper :
```typescript
{
  "liste-devis-neg": "Liste des devis",
  "dit-list": "Consultation des DIT",
  "a-livrer": "À livrer"
}
```
Ce système est notamment utilisé par le composant `<AppBreadcrumb>` pour traduire dynamiquement les segments d'URL (`/magasin/ordre-reparation/a-livrer`) en un fil d'ariane lisible (`Magasin > Ordre réparation > À livrer`).

### 3.2. Gestion Multi-Bibliothèques d'Icônes
Le projet utilise une approche hybride pour garantir une iconographie riche :
1. **Lucide React** & **Phosphor Icons** : Utilisés pour les composants d'interface moderne (StatCards, notifications, actions rapides).
2. **FontAwesome** : Utilisé pour la structure du menu principal. Le fichier `lib/navigationToModuleItems.ts` contient des mappages complexes (`moduleIconMap`, `sectionIconMap`, `itemIconMap`) qui associent chaque label renvoyé par le backend à une icône FontAwesome spécifique, assurant un rendu visuel constant même si l'ordre du menu change côté base de données.

## 4. Traitement Intelligent des Documents et OCR Intégré

L'une des fonctionnalités les plus complexes du Front-end est le module d'Analyse Documentaire et de reconnaissance optique de caractères (OCR), principalement implémenté dans `lib/document-analysis.ts`.

### 4.1. Architecture OCR Non-Bloquante
La reconnaissance de texte se fait entièrement côté client (navigateur) pour des raisons de confidentialité et de rapidité :
- **Tesseract.js** est instancié via des Web Workers (threads en arrière-plan) afin de ne pas figer l'interface utilisateur (Main Thread) pendant l'analyse des images ou des PDF.
- Un **Worker Partagé** (`sharedOcrWorkerPromise`) est utilisé pour éviter le rechargement coûteux du modèle OCR à chaque nouveau fichier.

### 4.2. Prétraitement via Canvas
Avant l'OCR, les documents (images ou pages PDF générées via `pdfjs-dist`) sont dessinés sur un `<canvas>` HTML avec une résolution optimisée (`ocrTargetLongEdge`, par défaut 2000px). Cela garantit un équilibre parfait entre les performances du navigateur et la précision de la reconnaissance du texte.

### 4.3. Validation Automatique et Règles Anti-Fraude
Le système d'OCR est profondément couplé à la logique métier (notamment pour les composants comme `OrdreReparationForm.tsx` ou `FactureForm.tsx`) :
- **`ocrValidation`** : Des règles strictes sont définies sur les champs. Par exemple, le système peut vérifier automatiquement que le texte OCRisé d'une facture contient bien les mots "facture" ou certaines chaînes de caractères.
- **Pénalité de Confiance (`averageOcrConfidence`)** : L'algorithme calcule un score de confiance moyen des mots reconnus. Si ce score tombe en dessous de certains seuils (ex: < 50%), le système applique automatiquement des points de "pénalité" (fraude potentielle), signalant à l'utilisateur ou à l'administrateur que le document est potentiellement falsifié, illisible ou d'une qualité suspecte.

## 5. Configuration Avancée, Caching et Paramétrage

L'application intègre des stratégies agressives mais maîtrisées de caching afin d'optimiser les performances, tout en maintenant une synchronisation fluide avec le backend.

### 5.1. Configuration de React Query (Data Fetching)
Le `queryClient` (dans `lib/queryClient.ts`) est paramétré globalement pour limiter les requêtes superflues :
- **`staleTime: 10 minutes`** : Une donnée récupérée est considérée comme "fraîche" pendant 10 minutes. Pendant ce délai, aucun appel réseau supplémentaire ne sera fait pour la même ressource, même si le composant est re-rendu.
- **`gcTime: 7 jours`** (Garbage Collection Time) : Les données inactives restent en mémoire pendant 7 jours avant d'être purgées.
- **`refetchOnWindowFocus: false`** : Contrairement au paramètre par défaut de React Query, l'application ne recharge pas les données à chaque fois que l'utilisateur change d'onglet, préservant la bande passante.

### 5.2. Persistance via IndexedDB (`idb-keyval`)
Pour offrir une expérience hors-ligne partielle et un chargement instantané au lancement, le cache de React Query est **persisté dans le navigateur** à l'aide d'IndexedDB (`main.tsx`).
- **`createAsyncStoragePersister`** : Synchronise l'état de React Query dans la base IndexedDB.
- **Cache Buster (`buster`)** : Lors d'un changement majeur dans la structure des données de l'API (ex: renommage de champs JSON), la propriété `buster` est modifiée (ex: `"2026-07-16-agence-service-code"`). Cela invalide *instantanément et globalement* le cache persistant de tous les utilisateurs sans qu'ils aient besoin de vider leur cache navigateur.

### 5.3. Intercepteurs Axios & File d'attente (Queue)
La configuration Axios (`conf/axios.ts`) implémente une stratégie très robuste de rafraîchissement de token (Refresh Token) :
- Lorsqu'une requête échoue avec une erreur `401 Unauthorized`, Axios verrouille les requêtes suivantes (`isRefreshing = true`).
- Toutes les requêtes entrantes pendant ce rafraîchissement sont interceptées et mises en pause dans une **file d'attente** (`failedQueue`).
- Une fois le nouveau token obtenu (via `/auth/refresh`), l'application remplace silencieusement le token et **rejoue automatiquement** toutes les requêtes bloquées.
- Si le rafraîchissement échoue (session totalement expirée), la file d'attente est rejetée et la fonction `handleLogout()` purge l'application.

### 5.4. Cache Session (SessionStorage)
Pour les requêtes très critiques impactant le routage, comme le chargement dynamique du menu, le hook `useMenu.ts` utilise le `sessionStorage`. Les modules sont stockés avec la clé `menu_modules`. Cela permet de garder le menu (et donc les routes accessibles) immédiatement disponible en cas de simple rafraîchissement (F5) pendant la durée de vie de l'onglet, évitant de recharger inutilement la base de données à chaque navigation tout en préservant la sécurité puisque le cache meurt avec l'onglet.

## 6. Guide d'Onboarding 

Cette section résume la philosophie de la stack technologique et les éléments vitaux à comprendre pour l'intégration de nouveaux collaborateurs ou pour l'évaluation par le management.

### 6.1. Stack Technologique (Ultra-Moderne)
Le socle technique a été sélectionné pour sa longévité, ses performances et sa sécurité :
- **Framework Core** : **React 19** avec **Vite 8** (Builds instantanés, HMR ultra-rapide).
- **Routage** : **React Router v7** (Dernière génération, Data Routers).
- **Gestion d'État & Data Fetching** : **TanStack Query v5** (Gestion parfaite de l'asynchrone, du cache et du hors-ligne).
- **Styling & UI** : **TailwindCSS v4** couplé avec **Shadcn UI** et **Radix UI** (Composants accessibles sans surcharge de CSS).
- **Validation** : **Zod** (Schémas de validation stricts, permettant de sécuriser les formulaires avant tout appel API).
- **Tests** : **Vitest** (Intégration de tests unitaires et UI natively supportés via les scripts `test:ui` et `coverage`).

### 6.2. Atouts Métier
- **Scalabilité (Architecture DDD)** : Le code est découpé par `domains/` (Métier). Si une nouvelle équipe est recrutée pour travailler sur la comptabilité (`compta`), elle ne touchera pas au code de l'atelier (`atelier`). Cela permet un développement en parallèle avec un risque de régression quasi nul.
- **Auditabilité et Traçabilité** : L'application possède un système de tracking d'audit silencieux. Par exemple, via `sendAuditNavigationLog` dans Axios, toute erreur 403, 404 ou 500 est interceptée et remontée à l'API d'audit backend sans bloquer l'utilisateur.
- **Détection de Fraude (OCR)** : Le système OCR intègre des pénalités automatiques de confiance qui sécurisent les process (ex: faux documents d'intervention) avant même que le backend n'ait à s'en soucier, offrant un gain de temps énorme aux opérateurs.

### 6.3. Standards et Bonnes Pratiques pour Développeurs
1. **Ne jamais muter le Routeur directement** : Les routes métier doivent être exposées par l'API et rendues par `buildRoutesFromMenu`. Ne forcez pas des routes statiques sensibles dans `AppRoutes.tsx`.
2. **Utiliser React Query au lieu des useEffects** : Pour tout appel API, passez systématiquement par un hook custom (ex: `useProfile`) encapsulant `useQuery` ou `useMutation`.
3. **Composants d'Interface (Atomiques)** : N'utilisez pas de balises HTML brutes stylisées manuellement pour les composants récurrents (boutons, inputs). Utilisez toujours les composants Shadcn existants dans `components/ui/` ou `components/common/`.
4. **Validation Zod Obligatoire** : Tout payload sortant vers une API (Formulaires) doit être validé côté front via un schéma Zod pour bloquer les requêtes malformées et préserver la bande passante.

### 6.4. Commandes Essentielles (Scripts NPM)
- `npm run dev` : Lancement du serveur de développement Vite.
- `npm run build` : Compilation TypeScript (via `tsc -b`) et build optimisé pour la production.
- `npm run lint` : Vérification du code via ESLint pour maintenir une qualité de code stricte.
- `npm run test:ui` : Lancement de l'interface graphique Vitest pour debugger et visualiser l'exécution des tests.
