# 🇫🇷 Oser Bouger

Application web permettant de parcourir, filtrer et consulter les événements culturels et sportifs parisiens, à partir du jeu de données ouvert [« Que faire à Paris »](https://opendata.paris.fr) de la ville de Paris. L'interface utilise le système de design de l'État français ([DSFR](https://www.systeme-de-design.gouv.fr/)).

## Stack technique

- **[Angular 21](https://angular.dev/)** — composants standalone, gestion d'état via les *signals* (pas de NgRx/Pinia)
- **[@gouvfr/dsfr](https://www.systeme-de-design.gouv.fr/)** — système de design de l'État
- **[Vitest](https://vitest.dev/)** — exécuté nativement via le builder Angular CLI (`@angular/build:unit-test`), pas de `vitest.config.ts` séparé
- **[Playwright](https://playwright.dev/)** — tests fonctionnels (e2e)
- **ESLint + Prettier** (config partagée `@chriscrat/eslint-config`), **Husky** + **lint-staged** (hooks de pre-commit), **commitlint** (convention de commits)

L'application est une SPA pure, sans backend : elle consomme directement l'API open-data de la ville de Paris.

## Démarrage

```bash
npm install
npm start        # équivalent à `ng serve`, sert l'app sur http://localhost:4200
```

Le serveur de développement recharge automatiquement l'application à chaque modification des fichiers source.

## Build

```bash
npm run build     # build de production dans dist/
npm run watch     # build en mode développement avec surveillance des fichiers
```

## Architecture

```
src/app/
├── app.routes.ts, app.config.ts     # routage (/, /event/:id) et configuration racine
├── environments/                    # URLs de l'API open-data
├── layout/                          # en-tête, pied de page
├── features/
│   ├── home/                        # page d'accueil (hero + liste d'événements)
│   └── events/
│       ├── components/              # liste, carte, filtres, détail d'un événement
│       ├── mappers/                 # fonctions pures de transformation (API -> vue)
│       ├── models/                  # types TypeScript du domaine
│       ├── pages/                   # page de détail d'un événement
│       └── services/
│           ├── events.service.ts    # client HTTP vers l'API open-data
│           └── events.store.ts      # état réactif (signals) : filtres, pagination, événement courant
└── ui/                               # composants de design system réutilisables
    (alert, button-group, card, checkbox, icon, pagination, sidemenu, tag, theme-toggle...)
```

Il n'existe pas de dossier `composables/`, `store/` (Pinia) ou `services/` au sens Vue.js : chaque service Angular `@Injectable({ providedIn: "root" })` porte à la fois la logique métier et l'état associé (voir `EventsStore`).

### Flux de données de la liste d'événements

`EventsStore` centralise l'état des filtres, de la pagination et des tags de catégorie, entièrement synchronisé avec les paramètres de requête de l'URL. Les méthodes de mutation (`goToPage`, `setFilters`, `resetFilters`, `filterByTag`) ne font que **naviguer** (`router.navigate()`) ; le chargement de la liste est déclenché uniquement par `EventsStore.ensureListSync()`, un pipeline réactif à l'URL (`toObservable` + `switchMap`) démarré une seule fois par `EventListCards`. Ce découplage évite les doubles requêtes réseau et annule automatiquement toute requête devenue obsolète.

## Tests

La stratégie de test à trois niveaux (unitaires, intégration, fonctionnels) est détaillée dans [`docs/testing.md`](docs/testing.md), avec les conventions à suivre et les helpers réutilisables (`src/testing/`).

```bash
npm test                # tests unitaires + intégration (Vitest)
npm test -- --watch     # idem, en mode watch
npm run e2e              # tests fonctionnels (Playwright, nécessite `npx playwright install --with-deps chromium` une première fois)
npm run e2e:ui            # tests fonctionnels avec l'interface Playwright
```

## Qualité de code

```bash
npm run lint      # ESLint sur l'ensemble du projet
```

- Un hook **pre-commit** (Husky + lint-staged) relance ESLint sur les fichiers modifiés avant chaque commit.
- Un hook **commit-msg** valide le format des messages de commit via commitlint (convention [Conventional Commits](https://www.conventionalcommits.org/), scopes autorisés définis dans `commitlint.config.mjs`).

## Ressources complémentaires

Pour la référence complète de l'Angular CLI, voir [angular.dev/tools/cli](https://angular.dev/tools/cli).
