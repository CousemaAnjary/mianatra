# Mianatra — Convention de commits et gestion des branches

## 1. Objectif

Ce document définit les règles Git du projet **Mianatra**.

L’objectif est d’avoir un workflow :

- simple ;
- rapide ;
- compréhensible par toute l’équipe ;
- adapté à un hackathon ;
- propre pour les revues de code ;
- compatible avec une évolution après le MVP.

Le projet utilise :

- une branche principale protégée ;
- des branches courtes par fonctionnalité ou correction ;
- des commits basés sur la convention **Conventional Commits** ;
- des Pull Requests courtes et ciblées.

---

# 2. Stratégie Git retenue

## 2.1 Modèle utilisé

Le projet utilise une stratégie proche de **GitHub Flow**.

La branche principale est :

```text
main
```

Toutes les modifications sont développées dans une branche séparée, puis fusionnées dans `main`.

## 2.2 Pourquoi ne pas utiliser `develop`

Pour le MVP et le hackathon, une branche `develop` ajouterait une étape supplémentaire sans réel bénéfice.

Le workflow reste donc :

```text
main
  ├── feat/onboarding
  ├── feat/course-import
  ├── fix/ollama-timeout
  └── chore/update-dependencies
```

Puis :

```text
branche courte
      ↓
Pull Request
      ↓
vérification
      ↓
merge dans main
```

## 2.3 Branche `main`

La branche `main` doit toujours :

- compiler ;
- démarrer ;
- passer le typecheck ;
- passer le lint ;
- contenir une version démontrable ;
- ne pas contenir de code cassé ;
- ne pas recevoir de commit direct sauf urgence exceptionnelle.

---

# 3. Types de branches

## 3.1 Fonctionnalité

Préfixe :

```text
feat/
```

Exemples :

```text
feat/onboarding
feat/course-import
feat/revision-sheet
feat/exercise-session
feat/progress-dashboard
```

Utiliser ce type pour :

- nouvel écran ;
- nouvelle fonctionnalité ;
- nouveau module ;
- nouvelle intégration fonctionnelle.

---

## 3.2 Correction de bug

Préfixe :

```text
fix/
```

Exemples :

```text
fix/course-page-order
fix/ollama-timeout
fix/progress-calculation
fix/onboarding-validation
```

Utiliser ce type pour corriger :

- bug fonctionnel ;
- erreur de calcul ;
- crash ;
- mauvaise navigation ;
- problème de persistance ;
- problème réseau.

---

## 3.3 Correction urgente

Préfixe :

```text
hotfix/
```

Exemples :

```text
hotfix/app-crash-startup
hotfix/database-migration
```

Utiliser uniquement lorsque :

- `main` est inutilisable ;
- la démo est bloquée ;
- une correction doit être livrée immédiatement.

Après correction, la branche est fusionnée directement dans `main`.

---

## 3.4 Refactorisation

Préfixe :

```text
refactor/
```

Exemples :

```text
refactor/ai-provider
refactor/course-repository
refactor/exercise-components
```

Utiliser lorsque le comportement fonctionnel ne change pas, mais que le code est réorganisé.

---

## 3.5 Tâche technique

Préfixe :

```text
chore/
```

Exemples :

```text
chore/update-dependencies
chore/configure-eslint
chore/add-demo-seed
chore/update-readme
```

Utiliser pour :

- configuration ;
- dépendances ;
- scripts ;
- documentation technique ;
- nettoyage ;
- outils de développement.

---

## 3.6 Documentation

Préfixe :

```text
docs/
```

Exemples :

```text
docs/update-cdc
docs/add-architecture-guide
docs/add-ollama-setup
```

---

## 3.7 Tests

Préfixe :

```text
test/
```

Exemples :

```text
test/progress-service
test/course-import-flow
test/exercise-validation
```

---

## 3.8 Design et interface

Préfixe recommandé :

```text
ui/
```

Exemples :

```text
ui/home-screen
ui/course-card
ui/revision-session
ui/design-system
```

Utiliser lorsque la modification concerne principalement :

- couleurs ;
- espacements ;
- composants visuels ;
- responsive ;
- accessibilité visuelle ;
- conformité à la maquette.

Si la modification UI ajoute aussi une nouvelle fonctionnalité, utiliser plutôt `feat/`.

---

# 4. Convention de nommage des branches

## 4.1 Format

```text
type/description-courte
```

Exemple :

```text
feat/course-import
```

## 4.2 Règles

- utiliser uniquement des minuscules ;
- utiliser des tirets ;
- ne pas utiliser d’espace ;
- éviter les accents ;
- garder un nom court ;
- décrire une seule intention ;
- ne pas inclure le nom du développeur.

## 4.3 Bons exemples

```text
feat/onboarding
feat/course-analysis
fix/image-compression
ui/home-dashboard
chore/drizzle-migrations
```

## 4.4 Mauvais exemples

```text
nouvelle-branche
Francisca-modifs
feature1
test-final
correction
branche-2
```

---

# 5. Création d’une branche

Toujours partir d’une version récente de `main`.

```bash
git switch main
git pull origin main
git switch -c feat/course-import
```

Avant de commencer une nouvelle tâche :

```bash
git status
```

Le dépôt doit être propre.

---

# 6. Convention de commits

## 6.1 Format général

```text
type(scope): description
```

Exemple :

```text
feat(course-import): add multiple page selection
```

## 6.2 Format complet

```text
type(scope): description courte

Corps optionnel expliquant le changement.

Footer optionnel.
```

Exemple :

```text
fix(progress): correct concept score calculation

Ignore abandoned attempts when calculating the mastery score.
```

---

# 7. Types de commits

## `feat`

Ajout d’une fonctionnalité.

```text
feat(onboarding): add class selection step
feat(courses): add course detail screen
feat(ai): add Ollama course analysis
```

## `fix`

Correction d’un bug.

```text
fix(import): preserve page order after restart
fix(session): prevent empty answer submission
fix(ai): handle invalid JSON response
```

## `docs`

Documentation uniquement.

```text
docs(readme): add Ollama setup instructions
docs(architecture): document feature modules
```

## `style`

Modification de format sans changement fonctionnel.

```text
style(home): align subject cards spacing
style(ui): apply Nunito typography
```

Attention : `style` désigne ici le format ou l’apparence, pas une nouvelle fonctionnalité.

## `refactor`

Réorganisation du code sans modifier le comportement.

```text
refactor(ai): extract Ollama provider
refactor(db): split Drizzle schema files
```

## `test`

Ajout ou modification de tests.

```text
test(progress): add mastery status cases
test(import): cover page reordering
```

## `chore`

Maintenance technique.

```text
chore(deps): update Expo dependencies
chore(config): add environment validation
chore(seed): add demo course data
```

## `perf`

Amélioration des performances.

```text
perf(images): compress pages before upload
perf(db): add course indexes
```

## `build`

Modification du système de build.

```text
build(expo): configure Android development build
build(drizzle): add migration generation script
```

## `ci`

Modification de l’intégration continue.

```text
ci(github): add lint and typecheck workflow
```

## `revert`

Annulation d’un commit.

```text
revert: revert course deletion flow
```

---

# 8. Scopes recommandés

Le scope correspond au module concerné.

## Scopes fonctionnels

```text
onboarding
home
subjects
courses
import
analysis
revision
exercises
session
progress
recommendations
profile
settings
```

## Scopes techniques

```text
ai
ollama
db
drizzle
sqlite
images
files
navigation
ui
theme
config
deps
tests
docs
```

## Exemples

```text
feat(import): add gallery image picker
fix(ollama): handle server unavailable state
refactor(db): move course queries to repository
style(theme): update terracotta color token
```

---

# 9. Règles de rédaction des commits

## 9.1 Description

La description doit :

- commencer par un verbe ;
- être courte ;
- décrire ce que fait le commit ;
- ne pas finir par un point ;
- rester en anglais pour garder une convention technique uniforme.

## 9.2 Verbes recommandés

```text
add
update
remove
fix
prevent
handle
create
extract
rename
improve
validate
persist
display
```

## 9.3 Bons exemples

```text
feat(courses): add course archive action
fix(images): prevent duplicate page imports
refactor(ai): extract provider interface
docs(readme): add local network setup
```

## 9.4 Mauvais exemples

```text
modification
ça marche
final version
fix bug
changes
update stuff
```

---

# 10. Taille d’un commit

Un commit doit correspondre à une modification logique.

## Bon commit

```text
feat(import): add page rotation
```

Il contient uniquement :

- bouton rotation ;
- fonction rotation ;
- sauvegarde de la rotation ;
- test associé.

## Mauvais commit

```text
feat: add onboarding, import, database and fix styles
```

Ce commit contient trop de sujets.

## Règle

Un commit doit pouvoir être :

- compris rapidement ;
- annulé sans casser des fonctionnalités non liées ;
- relu facilement.

---

# 11. Fréquence des commits

Faire un commit lorsque :

- une petite fonctionnalité fonctionne ;
- un bug est corrigé ;
- une étape technique est terminée ;
- les tests passent ;
- le code est dans un état cohérent.

Ne pas attendre la fin de la journée pour tout committer.

---

# 12. Workflow quotidien

## 12.1 Début de tâche

```bash
git switch main
git pull origin main
git switch -c feat/revision-sheet
```

## 12.2 Développement

```bash
git status
git add src/features/revision
git commit -m "feat(revision): add revision sheet view"
```

## 12.3 Vérification

```bash
npm run lint
npm run typecheck
npm test
```

## 12.4 Mise à jour avec `main`

```bash
git fetch origin
git rebase origin/main
```

## 12.5 Publication

```bash
git push -u origin feat/revision-sheet
```

## 12.6 Pull Request

Créer la Pull Request vers :

```text
main
```

---

# 13. Pull Requests

## 13.1 Taille

Une Pull Request doit idéalement :

- concerner une fonctionnalité ;
- contenir peu de fichiers ;
- rester relisible en moins de 15 minutes ;
- éviter les modifications non liées.

## 13.2 Titre

Le titre suit Conventional Commits.

```text
feat(import): add multi-page course import
```

## 13.3 Description recommandée

```markdown
## Objectif

Permettre à l’élève d’ajouter plusieurs pages à un cours.

## Changements

- ajout depuis la galerie ;
- réorganisation des pages ;
- suppression d’une page ;
- sauvegarde de l’ordre dans SQLite.

## Vérifications

- [x] lint
- [x] typecheck
- [x] test sur Android
- [x] données sauvegardées après redémarrage

## Captures

Ajouter les captures si l’interface change.
```

---

# 14. Modèle de Pull Request

Créer le fichier :

```text
.github/pull_request_template.md
```

Contenu recommandé :

```markdown
## Objectif

Décrire le problème résolu ou la fonctionnalité ajoutée.

## Changements

- 
- 
- 

## Type de changement

- [ ] Fonctionnalité
- [ ] Correction
- [ ] Interface
- [ ] Refactorisation
- [ ] Documentation
- [ ] Test
- [ ] Configuration

## Vérifications

- [ ] Le projet démarre
- [ ] Le lint passe
- [ ] Le typecheck passe
- [ ] Les tests concernés passent
- [ ] Testé sur Android
- [ ] Les données persistent correctement
- [ ] Les erreurs sont gérées
- [ ] L’interface respecte le design system

## Captures ou vidéo

Ajouter des captures si le changement est visuel.

## Notes

Ajouter les limites ou informations importantes.
```

---

# 15. Revue de code

## 15.1 Points à vérifier

Le reviewer vérifie :

- la fonctionnalité ;
- la lisibilité ;
- les types TypeScript ;
- l’absence de `any` ;
- la gestion des erreurs ;
- la validation Zod ;
- la persistance SQLite ;
- la conformité au design system ;
- l’absence d’appel direct à Ollama dans les composants ;
- l’absence de requête SQL dans les écrans ;
- les tests importants.

## 15.2 Ton des commentaires

Les commentaires doivent être :

- précis ;
- respectueux ;
- orientés solution ;
- liés au code.

Bon exemple :

```text
Cette logique pourrait être déplacée dans course.service.ts afin de garder l’écran léger.
```

Mauvais exemple :

```text
Ce code est mauvais.
```

---

# 16. Stratégie de merge

## 16.1 Méthode recommandée

Utiliser :

```text
Squash and merge
```

Avantages :

- un commit propre par Pull Request ;
- historique lisible ;
- suppression des petits commits intermédiaires ;
- retour en arrière plus simple.

## 16.2 Message du squash

Le message final doit suivre Conventional Commits.

```text
feat(import): add multi-page course import
```

## 16.3 Suppression de branche

Après fusion :

```bash
git branch -d feat/course-import
git push origin --delete feat/course-import
```

GitHub peut être configuré pour supprimer automatiquement les branches fusionnées.

---

# 17. Mise à jour d’une branche

## Méthode recommandée

Utiliser `rebase` avant la Pull Request.

```bash
git fetch origin
git rebase origin/main
```

En cas de conflit :

```bash
git status
```

Corriger les fichiers, puis :

```bash
git add .
git rebase --continue
```

Après un rebase d’une branche déjà publiée :

```bash
git push --force-with-lease
```

Ne jamais utiliser :

```bash
git push --force
```

`--force-with-lease` protège les modifications distantes.

---

# 18. Gestion des conflits

## Étapes

1. lire les deux versions ;
2. comprendre l’intention ;
3. ne pas choisir automatiquement une version ;
4. tester après résolution ;
5. relancer lint et typecheck ;
6. vérifier l’écran concerné.

## Commandes

```bash
git status
git add fichier-corrige.ts
git rebase --continue
```

Pour annuler :

```bash
git rebase --abort
```

---

# 19. Protection de la branche `main`

Configurer les règles suivantes sur GitHub :

- interdiction de push direct ;
- Pull Request obligatoire ;
- au moins une approbation si plusieurs développeurs ;
- statut CI obligatoire ;
- branche à jour avant merge ;
- conversations résolues ;
- suppression automatique des branches ;
- force push interdit ;
- suppression de `main` interdite.

Pour un hackathon à deux personnes, une approbation peut être facultative afin de ne pas bloquer le développement.

---

# 20. Vérifications automatiques

Avant merge, exécuter :

```bash
npm run lint
npm run typecheck
npm test
```

Pipeline minimal GitHub Actions :

```yaml
name: Quality

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --runInBand
```

---

# 21. Commits temporaires

Pendant le développement local, des commits intermédiaires sont acceptables :

```text
wip(import): add page grid
```

Mais ils doivent être nettoyés lors du squash.

Éviter de fusionner dans `main` des commits comme :

```text
wip
test
ça marche
final final
```

---

# 22. Breaking changes

Une modification incompatible doit utiliser `!`.

Exemple :

```text
feat(db)!: rename course progress columns
```

Ou ajouter :

```text
BREAKING CHANGE: existing local databases require migration 0004.
```

Pour le MVP, limiter les breaking changes.

---

# 23. Tags et versions

Utiliser le versionnement sémantique :

```text
MAJOR.MINOR.PATCH
```

Exemples :

```text
v0.1.0
v0.2.0
v1.0.0
```

## Avant le MVP

```text
v0.1.0
```

Première version démontrable.

## Nouvelle fonctionnalité

```text
v0.2.0
```

## Correction

```text
v0.2.1
```

## Première version publique stable

```text
v1.0.0
```

---

# 24. Création d’une version

```bash
git switch main
git pull origin main
git tag -a v0.1.0 -m "Mianatra MVP"
git push origin v0.1.0
```

Créer ensuite une GitHub Release avec :

- résumé ;
- nouvelles fonctionnalités ;
- bugs connus ;
- APK ou lien Expo ;
- captures ;
- instructions de démonstration.

---

# 25. Convention de changelog

Créer :

```text
CHANGELOG.md
```

Exemple :

```markdown
# Changelog

## [0.1.0] - 2026-07-26

### Added

- onboarding ;
- import de plusieurs pages ;
- analyse Gemma via Ollama ;
- fiche de révision ;
- exercices ;
- rapport de séance.

### Fixed

- ordre des pages ;
- persistance des sessions.
```

---

# 26. Gestion des migrations Drizzle

Chaque modification de schéma doit être isolée.

Branche :

```text
feat/add-recommendations-table
```

Commit :

```text
feat(db): add recommendations table
```

Génération :

```bash
npm run db:generate
```

La Pull Request doit inclure :

- modification du schéma ;
- migration générée ;
- repository mis à jour ;
- test de migration.

Ne pas modifier une ancienne migration déjà fusionnée dans `main`.

---

# 27. Gestion des fichiers sensibles

Ne jamais committer :

```text
.env
.env.local
*.keystore
*.jks
credentials.json
secrets.json
```

Ajouter au `.gitignore`.

Commiter uniquement :

```text
.env.example
```

Exemple :

```env
EXPO_PUBLIC_AI_PROVIDER=ollama
EXPO_PUBLIC_OLLAMA_BASE_URL=http://192.168.1.25:11434
EXPO_PUBLIC_OLLAMA_MODEL=gemma4:e2b
```

Ne pas mettre de vraie adresse sensible ou de clé privée.

---

# 28. Fichiers générés

Ne pas committer :

- `node_modules` ;
- cache Expo ;
- logs ;
- fichiers temporaires ;
- images prises pendant les tests ;
- bases SQLite locales ;
- build local non nécessaire.

Le dossier de migrations Drizzle doit être committé.

---

# 29. Convention pour les issues

## Titre

```text
[Module] Description
```

Exemple :

```text
[Import] Allow page reordering
[AI] Handle invalid Ollama JSON
[Progress] Calculate mastery status
```

## Labels recommandés

```text
feature
bug
ui
documentation
technical
priority-high
priority-medium
priority-low
hackathon
```

---

# 30. Lien branche et issue

Si une issue possède le numéro `24` :

```text
feat/24-course-import
```

ou :

```text
fix/24-page-order
```

Dans la Pull Request :

```text
Closes #24
```

La fermeture automatique de l’issue se fera après le merge.

Pour une petite équipe, le numéro est facultatif.

---

# 31. Workflow simplifié pour le hackathon

Pour aller vite sans casser le projet :

## Étape 1

Créer une tâche courte.

```text
feat/course-import
```

## Étape 2

Développer pendant 1 à 3 heures maximum.

## Étape 3

Faire des commits cohérents.

```text
feat(import): add image selection
feat(import): add page ordering
fix(import): persist page order
```

## Étape 4

Vérifier :

```bash
npm run lint
npm run typecheck
```

## Étape 5

Créer une petite Pull Request.

## Étape 6

Faire un `Squash and merge`.

## Étape 7

Repartir immédiatement de `main`.

---

# 32. Workflow d’urgence pendant la démo

Si un bug critique apparaît :

```bash
git switch main
git pull origin main
git switch -c hotfix/demo-course-loading
```

Corriger uniquement le bug.

```bash
git add .
git commit -m "fix(courses): restore demo course loading"
git push -u origin hotfix/demo-course-loading
```

Créer une PR courte, vérifier, puis merger.

Ne pas ajouter d’autres améliorations dans le hotfix.

---

# 33. Responsabilités de l’équipe

## Responsable d’une branche

La personne qui crée la branche doit :

- garder la branche à jour ;
- résoudre les conflits ;
- rédiger la PR ;
- vérifier les tests ;
- répondre aux commentaires ;
- supprimer la branche après merge.

## Reviewer

Le reviewer doit :

- vérifier le comportement ;
- signaler les problèmes bloquants ;
- éviter les demandes de changement purement personnelles ;
- approuver rapidement lorsque le code est correct.

---

# 34. Exemple de workflow complet

## Création

```bash
git switch main
git pull
git switch -c feat/course-import
```

## Premier commit

```bash
git add src/features/course-import
git commit -m "feat(import): add page image selection"
```

## Deuxième commit

```bash
git add src/features/course-import src/db
git commit -m "feat(import): persist selected course pages"
```

## Mise à jour

```bash
git fetch origin
git rebase origin/main
```

## Vérification

```bash
npm run lint
npm run typecheck
npm test
```

## Publication

```bash
git push -u origin feat/course-import
```

## Pull Request

Titre :

```text
feat(import): add multi-page course import
```

Après approbation :

```text
Squash and merge
```

---

# 35. Commandes Git utiles

## Voir l’état

```bash
git status
```

## Voir les branches

```bash
git branch
```

## Changer de branche

```bash
git switch nom-branche
```

## Créer une branche

```bash
git switch -c feat/course-import
```

## Voir les commits

```bash
git log --oneline --graph --decorate
```

## Annuler les modifications d’un fichier non indexé

```bash
git restore fichier.ts
```

## Retirer un fichier du staging

```bash
git restore --staged fichier.ts
```

## Modifier le dernier commit

```bash
git commit --amend
```

## Mettre temporairement les modifications de côté

```bash
git stash push -m "course import work"
```

## Restaurer le stash

```bash
git stash pop
```

---

# 36. Fichier `.gitmessage`

L’équipe peut ajouter un modèle local :

```text
# type(scope): description
#
# Types:
# feat, fix, docs, style, refactor, test, chore, perf, build, ci
#
# Example:
# feat(import): add multiple page selection
```

Configuration :

```bash
git config commit.template .gitmessage
```

---

# 37. Résumé des règles

## Branches

```text
main
feat/*
fix/*
hotfix/*
ui/*
refactor/*
chore/*
docs/*
test/*
```

## Commits

```text
type(scope): description
```

## Merge

```text
Squash and merge
```

## Source de vérité

```text
main
```

## Vérifications

```bash
npm run lint
npm run typecheck
npm test
```

## Interdictions

- push direct sur `main` ;
- commit contenant plusieurs fonctionnalités ;
- secrets dans Git ;
- branche longue ;
- message `final`, `test` ou `changes` ;
- force push sans `--force-with-lease`.

---

# 38. Convention officielle

La convention officielle du projet Mianatra est :

> **Des branches courtes créées depuis `main`, des commits Conventional Commits, des Pull Requests ciblées, puis un Squash and Merge afin de conserver un historique propre et lisible.**

Ce workflow permet d’aller vite pendant le hackathon tout en gardant un dépôt suffisamment propre pour poursuivre le développement après le MVP.
