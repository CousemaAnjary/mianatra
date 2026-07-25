# Mianatra — Architecture du projet adaptée au code actuel

## 1. Objet du document

Ce document définit l’organisation officielle du projet **Mianatra** en tenant compte du dépôt existant.

Il remplace les propositions précédentes qui plaçaient les routes dans un dossier racine `app/` ou prévoyaient trop de dossiers dès le démarrage.

Le projet actuel utilise notamment :

- React Native ;
- Expo SDK 54 ;
- Expo Router ;
- TypeScript strict ;
- NativeWind ;
- Gluestack UI ;
- Expo SQLite ;
- Drizzle ORM ;
- migrations Drizzle chargées par Expo ;
- Gemma via Ollama dans une phase ultérieure du MVP.

L’objectif est de conserver une architecture :

- simple à développer ;
- conforme au code déjà créé ;
- lisible ;
- adaptée au hackathon ;
- suffisamment propre pour évoluer après le MVP.

---

# 2. Corrections importantes par rapport à l’ancien document

## 2.1 Les routes se trouvent dans `src/app`

Dans le dépôt actuel, Expo Router utilise :

```text
src/app/
```

Il ne faut donc pas créer un second dossier :

```text
app/
```

à la racine.

La seule arborescence de routes officielle est :

```text
src/app/
```

## 2.2 `src` contient aussi les routes

La séparation correcte est :

```text
src/
├── app/          # routes Expo Router
├── components/   # composants
├── db/           # SQLite et Drizzle
├── features/     # fonctionnalités métier à ajouter progressivement
├── services/     # services techniques partagés
└── ...
```

Il n’y a pas d’opposition entre `app` et `src` : dans ce projet, `app` est un sous-dossier de `src`.

## 2.3 Les migrations Drizzle restent dans `src/db/migrations`

Le dépôt utilise actuellement :

```text
src/db/migrations/
```

Le fichier `drizzle.config.ts` pointe également vers :

```text
out: "./src/db/migrations"
```

Il ne faut donc pas créer un dossier racine `drizzle/` en parallèle.

## 2.4 `src/components/ui` est réservé à Gluestack

Le dossier actuel contient les composants générés ou configurés par Gluestack :

```text
src/components/ui/
├── button/
└── gluestack-ui-provider/
```

Il faut conserver cette logique.

Les composants métier de Mianatra ne doivent pas tous être ajoutés dans `ui/`.

Exemples :

```text
CourseCard
RecommendedStudyCard
ExerciseQuestion
SessionReport
```

doivent rester dans leur module fonctionnel ou dans `src/components/shared` s’ils sont réellement communs.

## 2.5 Ne pas créer tous les dossiers à l’avance

Le projet actuel est encore léger.

Il ne faut pas générer immédiatement des dizaines de dossiers vides.

Un dossier est créé seulement lorsqu’une première fonctionnalité en a besoin.

## 2.6 Ne pas documenter comme installées des dépendances absentes

Dans le dépôt actuel, les éléments suivants ne sont pas encore installés :

- Zustand ;
- Zod ;
- React Hook Form ;
- Expo Image Picker ;
- Expo Camera ;
- Expo FileSystem ;
- Expo Image Manipulator ;
- Lucide React Native ;
- Jest ;
- React Native Testing Library.

Ils peuvent être ajoutés plus tard, mais ne doivent pas être présentés comme déjà opérationnels.

---

# 3. Structure actuelle constatée

La structure utile du dépôt est actuellement :

```text
mianatra/
├── assets/
│   └── images/
│
├── doc/
│   ├── MIANATRA_ARCHITECTURE_PROJET.md
│   ├── MIANATRA_CAHIER_DES_CHARGES_V2_OLLAMA.md
│   ├── MIANATRA_GIT_CONVENTIONS.md
│   ├── Mianatra Design System.md
│   ├── Mianatra spec.md
│   ├── icons/
│   ├── images/
│   └── pages/
│
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── about.tsx
│   │   │   └── index.tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── button/
│   │       └── gluestack-ui-provider/
│   │
│   └── db/
│       ├── client.ts
│       ├── schema.ts
│       └── migrations/
│
├── .env.example
├── app.json
├── babel.config.js
├── drizzle.config.ts
├── global.css
├── metro.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

Cette base est correcte. L’architecture doit évoluer progressivement autour d’elle.

---

# 4. Architecture retenue

## 4.1 Principe général

Mianatra adopte une architecture :

> **Feature-first légère, à l’intérieur du dossier `src` existant**

Les routes restent dans `src/app`.

La logique métier est progressivement placée dans `src/features`.

Les éléments techniques partagés sont placés dans :

- `src/db` ;
- `src/services` ;
- `src/config` ;
- `src/theme` ;
- `src/components/shared`.

## 4.2 Flux général

```text
Route Expo Router
        ↓
Composants de fonctionnalité
        ↓
Hook ou service de fonctionnalité
        ↓
Repository ou service partagé
        ↓
SQLite / fichiers / Ollama
```

## 4.3 Source de vérité

Pour les données persistantes :

```text
SQLite + Drizzle
```

Pour les états temporaires d’un écran :

```text
useState / useReducer
```

Un store global ne doit être ajouté que si un parcours multi-écrans le justifie réellement.

---

# 5. Structure cible simple

La structure cible du MVP est la suivante :

```text
mianatra/
├── assets/
│   ├── images/
│   ├── illustrations/
│   ├── patterns/
│   └── samples/
│
├── doc/
│   ├── MIANATRA_ARCHITECTURE_PROJET.md
│   ├── MIANATRA_CAHIER_DES_CHARGES_V2_OLLAMA.md
│   ├── MIANATRA_GIT_CONVENTIONS.md
│   ├── Mianatra Design System.md
│   └── Mianatra spec.md
│
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── db/
│   ├── features/
│   ├── services/
│   ├── theme/
│   ├── types/
│   └── utils/
│
├── .env
├── .env.example
├── app.json
├── babel.config.js
├── drizzle.config.ts
├── global.css
├── metro.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

Tous ces dossiers ne doivent pas obligatoirement être créés immédiatement.

---

# 6. Organisation de `src/app`

## 6.1 Rôle

`src/app` contient uniquement :

- les routes Expo Router ;
- les layouts ;
- les redirections ;
- la composition des écrans ;
- la récupération des paramètres de route.

Les routes ne doivent pas contenir :

- de requête SQL directe ;
- d’appel direct à Ollama ;
- de logique métier importante ;
- de gros schéma de validation ;
- de calcul de progression.

## 6.2 Structure progressive recommandée

Pour le MVP :

```text
src/app/
├── _layout.tsx
├── index.tsx
├── onboarding.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── courses.tsx
│   └── profile.tsx
│
├── course/
│   ├── add.tsx
│   └── [courseId]/
│       ├── index.tsx
│       ├── revision.tsx
│       └── results.tsx
│
├── session/
│   └── [sessionId]/
│       ├── index.tsx
│       ├── correction.tsx
│       └── report.tsx
│
├── settings/
│   └── ai.tsx
│
└── +not-found.tsx
```

## 6.3 Pourquoi cette structure reste simple

Le parcours d’ajout d’un cours peut être géré dans une seule route :

```text
src/app/course/add.tsx
```

avec des étapes internes :

```text
matière
→ source
→ pages
→ traitement
→ vérification
```

Il n’est pas nécessaire de créer cinq routes distinctes tant que la logique reste lisible.

## 6.4 Routes actuelles à faire évoluer

Le fichier :

```text
src/app/(tabs)/about.tsx
```

est un écran du starter Expo.

Il sera remplacé par :

```text
src/app/(tabs)/courses.tsx
```

Puis un troisième onglet sera ajouté :

```text
src/app/(tabs)/profile.tsx
```

La navigation finale comportera :

- Accueil ;
- Mes cours ;
- Profil.

---

# 7. `src/app/_layout.tsx`

## 7.1 Rôle actuel

Le layout racine :

- importe `global.css` ;
- applique les migrations Drizzle ;
- monte `GluestackUIProvider` ;
- affiche la navigation `Stack`.

Cette organisation est correcte pour le démarrage.

## 7.2 Règle

Le layout racine peut rester simple tant qu’il ne devient pas trop volumineux.

Structure acceptable :

```tsx
export default function RootLayout() {
  const migration = useMigrations(db, migrations);

  if (migration.error) {
    return <MigrationError />;
  }

  if (!migration.success) {
    return <MigrationLoading />;
  }

  return (
    <GluestackUIProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GluestackUIProvider>
  );
}
```

## 7.3 Évolution éventuelle

Si le layout devient trop chargé, créer plus tard :

```text
src/components/app/
├── AppProviders.tsx
└── DatabaseGate.tsx
```

Ce refactor n’est pas obligatoire au début.

---

# 8. Organisation de `src/components`

## 8.1 Structure

```text
src/components/
├── ui/
├── shared/
└── app/
```

## 8.2 `src/components/ui`

Réservé aux primitives de Gluestack et à leurs variantes générées.

Existant :

```text
src/components/ui/
├── button/
└── gluestack-ui-provider/
```

Futurs exemples :

```text
input/
modal/
select/
spinner/
```

Éviter de modifier fortement le code généré si une configuration Gluestack doit pouvoir le régénérer.

## 8.3 `src/components/shared`

Contient les composants visuels propres à Mianatra mais communs à plusieurs fonctionnalités.

Exemples :

```text
src/components/shared/
├── AppScreen.tsx
├── AppHeader.tsx
├── EmptyState.tsx
├── ErrorState.tsx
├── LoadingState.tsx
├── ProgressBar.tsx
└── StatusBadge.tsx
```

## 8.4 `src/components/app`

Optionnel.

Peut contenir :

```text
AppProviders.tsx
DatabaseGate.tsx
```

Ne pas créer ce dossier tant que `_layout.tsx` reste simple.

---

# 9. Organisation de `src/features`

## 9.1 Rôle

Chaque dossier représente une grande fonctionnalité utilisateur.

Structure minimale :

```text
src/features/
├── onboarding/
├── home/
├── courses/
├── course-import/
├── revision/
├── study-session/
├── progress/
└── profile/
```

## 9.2 Structure interne souple

Un module ne doit pas obligatoirement contenir huit sous-dossiers.

Commencer simplement :

```text
src/features/courses/
├── CourseCard.tsx
├── course.service.ts
├── course.types.ts
└── index.ts
```

Lorsqu’il grandit :

```text
src/features/courses/
├── components/
│   ├── CourseCard.tsx
│   └── CourseList.tsx
├── hooks/
│   └── useCourses.ts
├── course.service.ts
├── course.types.ts
└── index.ts
```

Créer un sous-dossier uniquement à partir de plusieurs fichiers du même type.

---

# 10. Module onboarding

Structure initiale :

```text
src/features/onboarding/
├── OnboardingForm.tsx
├── onboarding.service.ts
├── onboarding.types.ts
└── index.ts
```

Responsabilités :

- prénom ;
- âge ;
- classe ;
- série ;
- langue ;
- validation ;
- création du profil ;
- fin de l’onboarding.

Lorsque Zod et React Hook Form seront installés :

```text
onboarding.schema.ts
useOnboardingForm.ts
```

pourront être ajoutés.

---

# 11. Module home

```text
src/features/home/
├── HomeDashboard.tsx
├── RecommendedStudyCard.tsx
├── SubjectProgressList.tsx
├── home.service.ts
└── index.ts
```

Responsabilités :

- message personnalisé ;
- cours recommandé ;
- progression récente ;
- série de révision ;
- état vide.

---

# 12. Module courses

```text
src/features/courses/
├── CourseCard.tsx
├── CourseDetail.tsx
├── CourseList.tsx
├── course.service.ts
├── course.types.ts
└── index.ts
```

Responsabilités :

- liste des cours ;
- détail du cours ;
- matière ;
- renommage ;
- archivage ;
- suppression ;
- accès à la fiche et aux exercices.

Les matières peuvent rester dans ce module pour le MVP.

Il n’est pas nécessaire de créer immédiatement un module `subjects` séparé.

---

# 13. Module course-import

```text
src/features/course-import/
├── CourseImportFlow.tsx
├── CoursePageGrid.tsx
├── CoursePageThumbnail.tsx
├── course-import.service.ts
├── course-import.types.ts
└── index.ts
```

Responsabilités :

- choix de matière ;
- sélection des images ;
- ordre des pages ;
- suppression ;
- rotation ;
- compression ;
- compilation ;
- analyse ;
- vérification du résultat.

## État temporaire

Au début, utiliser :

```text
useState
ou
useReducer
```

dans `CourseImportFlow`.

Ajouter Zustand uniquement si l’état doit survivre entre plusieurs routes.

---

# 14. Module revision

```text
src/features/revision/
├── RevisionSheet.tsx
├── revision.service.ts
├── revision.types.ts
└── index.ts
```

Responsabilités :

- fiche de révision ;
- notions importantes ;
- définitions ;
- formules ;
- exemples ;
- lancement d’une séance.

---

# 15. Module study-session

```text
src/features/study-session/
├── ExerciseView.tsx
├── CorrectionView.tsx
├── SessionProgress.tsx
├── SessionReport.tsx
├── study-session.service.ts
├── study-session.types.ts
└── index.ts
```

Responsabilités :

- séance active ;
- exercice courant ;
- réponse ;
- indice ;
- correction ;
- passage à la question suivante ;
- rapport.

Pour le MVP, les exercices restent dans ce module.

Un module `exercises` séparé n’est utile que si la logique devient importante.

---

# 16. Module progress

```text
src/features/progress/
├── progress.service.ts
├── progress.types.ts
├── calculateConceptScore.ts
├── calculateCourseProgress.ts
└── index.ts
```

Responsabilités :

- score par notion ;
- statut ;
- progression du cours ;
- progression de la matière ;
- prochaine notion à renforcer.

Les calculs doivent rester déterministes.

Gemma ne doit pas inventer les pourcentages.

---

# 17. Module profile

```text
src/features/profile/
├── ProfileScreenContent.tsx
├── profile.service.ts
├── profile.types.ts
└── index.ts
```

Responsabilités :

- afficher le profil ;
- modifier les informations ;
- afficher les statistiques ;
- supprimer les données ;
- accéder aux paramètres IA.

---

# 18. Organisation de `src/db`

## 18.1 Structure adaptée au dépôt actuel

```text
src/db/
├── client.ts
├── schema.ts
├── migrations/
│   ├── migrations.js
│   └── ...migrations générées
└── repositories/
    ├── course.repository.ts
    ├── session.repository.ts
    └── user.repository.ts
```

## 18.2 `schema.ts`

Pour le MVP, conserver un seul fichier :

```text
src/db/schema.ts
```

C’est plus simple.

Le découpage en plusieurs fichiers ne sera nécessaire que lorsque le fichier deviendra difficile à lire.

Exemple futur possible :

```text
src/db/schema/
├── courses.ts
├── exercises.ts
├── users.ts
└── index.ts
```

Mais ce refactor ne doit pas être fait trop tôt.

## 18.3 Repositories

Créer le dossier :

```text
src/db/repositories/
```

au moment d’ajouter les premières vraies requêtes.

Les routes et composants ne doivent pas appeler directement Drizzle.

Exemple :

```ts
export const courseRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
```

## 18.4 Migrations

Conserver :

```text
src/db/migrations/
```

La configuration officielle reste :

```ts
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
});
```

Ne pas créer un second dossier de migrations ailleurs.

---

# 19. Base de données de développement

Le fichier racine :

```text
mianatra.db
```

sert principalement à Drizzle Studio ou à des essais locaux.

La base réellement utilisée par l’application mobile est créée par Expo SQLite dans l’espace de stockage de l’application :

```ts
openDatabaseSync("mianatra.db");
```

Il ne faut pas confondre les deux fichiers.

Le fichier racine `mianatra.db` peut être ignoré par Git si l’équipe ne souhaite pas partager des données locales de développement.

---

# 20. Organisation de `src/services`

Créer ce dossier seulement à partir du premier service partagé.

Structure recommandée :

```text
src/services/
├── ai/
├── files/
└── images/
```

---

# 21. Service IA

```text
src/services/ai/
├── ai-provider.ts
├── ai.service.ts
├── ollama.provider.ts
├── ai.types.ts
└── prompts/
    ├── analyze-course.ts
    ├── generate-exercises.ts
    └── generate-revision-sheet.ts
```

## Règles

- aucun écran n’appelle directement `fetch` vers Ollama ;
- seul `ollama.provider.ts` connaît l’URL HTTP ;
- les fonctionnalités appellent `ai.service.ts` ;
- le fournisseur pourra être remplacé plus tard.

Flux :

```text
course-import.service
        ↓
ai.service
        ↓
ollama.provider
        ↓
Ollama sur le PC
```

---

# 22. Service images

À créer lorsque l’import de cours commence :

```text
src/services/images/
├── image.service.ts
└── image.types.ts
```

Responsabilités :

- sélection ;
- compression ;
- rotation ;
- miniature ;
- base64 ;
- nettoyage temporaire.

Les dépendances Expo nécessaires seront ajoutées à ce moment.

---

# 23. Service fichiers

À créer seulement si les opérations deviennent nombreuses :

```text
src/services/files/
└── file.service.ts
```

Responsabilités :

- créer un dossier ;
- déplacer un fichier ;
- supprimer une image ;
- vérifier un chemin ;
- nettoyer les fichiers temporaires.

---

# 24. Organisation de `src/config`

```text
src/config/
├── env.ts
└── app.config.ts
```

## `env.ts`

Centralise les variables d’environnement.

Variables prévues :

```env
DB_FILE_NAME=./mianatra.db
EXPO_PUBLIC_AI_PROVIDER=ollama
EXPO_PUBLIC_OLLAMA_BASE_URL=http://192.168.1.25:11434
EXPO_PUBLIC_OLLAMA_MODEL=gemma4:e2b
```

Aucun composant ne doit lire directement plusieurs fois :

```ts
process.env.EXPO_PUBLIC_...
```

Utiliser un objet central :

```ts
export const env = {
  ollamaBaseUrl: process.env.EXPO_PUBLIC_OLLAMA_BASE_URL,
  ollamaModel: process.env.EXPO_PUBLIC_OLLAMA_MODEL,
};
```

Zod pourra être ajouté ensuite pour valider la configuration.

---

# 25. Organisation de `src/theme`

Le projet utilise actuellement les variables de Gluestack et NativeWind.

Créer progressivement :

```text
src/theme/
├── colors.ts
├── spacing.ts
├── radius.ts
└── typography.ts
```

Exemple :

```ts
export const colors = {
  background: "#FFF7E8",
  surface: "#FFFDF8",
  primary: "#D94B24",
  secondary: "#2E7D70",
  accent: "#F2B84B",
  text: "#2F241F",
  border: "#E8D9C7",
};
```

Le design system devra aussi être reflété dans la configuration Gluestack et Tailwind.

Éviter de répéter des valeurs hexadécimales dans tous les écrans.

---

# 26. Organisation des assets

## 26.1 Assets exécutés par l’application

Les fichiers utilisés par le code doivent être placés dans :

```text
assets/
```

Structure cible :

```text
assets/
├── images/
├── illustrations/
├── patterns/
└── samples/
```

## 26.2 Documentation visuelle

Les fichiers de référence peuvent rester dans :

```text
doc/images/
doc/pages/
doc/icons/
```

Ils ne doivent pas être utilisés comme chemins de production dans l’application.

## 26.3 Déplacement progressif

Lorsqu’une illustration est intégrée à l’application :

```text
doc/images/illustration_student_reading.png
```

elle doit être copiée vers :

```text
assets/illustrations/illustration_student_reading.png
```

Le dossier `doc` reste une documentation, pas un dossier runtime.

---

# 27. Alias d’import

Le projet actuel configure :

```json
"paths": {
  "@/*": ["./*"]
}
```

et Babel configure :

```text
@ → racine du projet
```

Les imports actuels corrects sont donc :

```ts
import { db } from "@/src/db/client";
import "@/global.css";
```

Il ne faut pas documenter pour l’instant :

```ts
import { db } from "@/db/client";
```

car cet alias n’est pas configuré.

## Évolution facultative

Plus tard, l’équipe peut ajouter :

```text
@src → ./src
@assets → ./assets
```

Mais cela n’est pas nécessaire pour le MVP.

La priorité est de rester cohérent avec le code actuel.

---

# 28. Fichiers de configuration racine

Les fichiers suivants restent à la racine :

```text
app.json
babel.config.js
drizzle.config.ts
global.css
metro.config.js
tailwind.config.js
tsconfig.json
```

## Pourquoi `global.css` reste à la racine

`metro.config.js` contient :

```ts
withNativeWind(config, { input: "./global.css" });
```

et `src/app/_layout.tsx` importe :

```ts
import "@/global.css";
```

Il ne faut donc pas déplacer ce fichier sans modifier ces deux configurations.

---

# 29. Dépendances à ajouter au bon moment

## Import des cours

Lorsque ce module démarre :

```bash
npx expo install expo-image-picker expo-camera expo-file-system expo-image-manipulator
```

## Validation

Lorsque les réponses IA et formulaires sont ajoutés :

```bash
npm install zod
```

## Formulaires complexes

Si nécessaire :

```bash
npm install react-hook-form
```

## État multi-écrans

Seulement si nécessaire :

```bash
npm install zustand
```

## Icônes

Le projet possède déjà :

```text
@expo/vector-icons
```

Il n’est donc pas obligatoire d’ajouter immédiatement Lucide.

Une seule bibliothèque doit être retenue dans l’interface finale.

---

# 30. Structure minimale immédiate

Pour commencer le développement sans surarchitecture :

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── shared/
├── db/
│   ├── migrations/
│   ├── client.ts
│   └── schema.ts
├── features/
│   ├── onboarding/
│   ├── home/
│   └── courses/
└── theme/
```

Puis ajouter seulement selon les besoins :

```text
course-import/
revision/
study-session/
progress/
services/ai/
services/images/
config/
```

---

# 31. Structure cible finale du MVP

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── courses.tsx
│   │   └── profile.tsx
│   ├── course/
│   │   ├── add.tsx
│   │   └── [courseId]/
│   │       ├── index.tsx
│   │       ├── revision.tsx
│   │       └── results.tsx
│   ├── session/
│   │   └── [sessionId]/
│   │       ├── index.tsx
│   │       ├── correction.tsx
│   │       └── report.tsx
│   └── settings/
│       └── ai.tsx
│
├── components/
│   ├── ui/
│   └── shared/
│
├── config/
│   └── env.ts
│
├── db/
│   ├── migrations/
│   ├── repositories/
│   ├── client.ts
│   └── schema.ts
│
├── features/
│   ├── onboarding/
│   ├── home/
│   ├── courses/
│   ├── course-import/
│   ├── revision/
│   ├── study-session/
│   ├── progress/
│   └── profile/
│
├── services/
│   ├── ai/
│   ├── files/
│   └── images/
│
├── theme/
│   ├── colors.ts
│   ├── radius.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── types/
└── utils/
```

---

# 32. Règles de responsabilité

## Route dans `src/app`

Elle :

- récupère les paramètres ;
- appelle le module correspondant ;
- gère la navigation ;
- compose l’écran.

Exemple :

```tsx
export default function CourseRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  return <CourseDetail courseId={courseId} />;
}
```

## Composant de fonctionnalité

Il :

- affiche la fonctionnalité ;
- utilise ses hooks ;
- gère les interactions visuelles.

## Service de fonctionnalité

Il :

- exécute les règles métier ;
- coordonne les repositories ;
- coordonne les services IA ou images.

## Repository

Il :

- lit SQLite ;
- écrit SQLite ;
- ne contient pas de logique visuelle.

## Service technique

Il :

- communique avec Ollama ;
- manipule les fichiers ;
- transforme les images.

---

# 33. Exemple de flux d’ajout de cours

```text
src/app/course/add.tsx
        ↓
CourseImportFlow
        ↓
course-import.service.ts
        ↓
image.service.ts
        ↓
course.repository.ts
        ↓
SQLite
```

Pour l’analyse :

```text
course-import.service.ts
        ↓
ai.service.ts
        ↓
ollama.provider.ts
        ↓
Ollama
```

---

# 34. Exemple de route légère

```tsx
import { CourseImportFlow } from "@/src/features/course-import";

export default function AddCourseRoute() {
  return <CourseImportFlow />;
}
```

Cette route ne contient pas :

- de `fetch` ;
- de SQL ;
- de logique de compression ;
- de prompt IA.

---

# 35. Exemple de repository

```ts
import { db } from "@/src/db/client";
import { coursesTable } from "@/src/db/schema";

export const courseRepository = {
  async findAll() {
    return db.select().from(coursesTable);
  },

  async create(values: typeof coursesTable.$inferInsert) {
    const [course] = await db
      .insert(coursesTable)
      .values(values)
      .returning();

    return course;
  },
};
```

---

# 36. Exemple de service

```ts
import { courseRepository } from "@/src/db/repositories/course.repository";

export const courseService = {
  async listCourses() {
    return courseRepository.findAll();
  },

  async createCourse(input: CreateCourseInput) {
    return courseRepository.create({
      title: input.title,
      subjectId: input.subjectId,
      status: "draft",
    });
  },
};
```

---

# 37. Gestion de l’état

## Utiliser l’état React pour

- formulaire local ;
- onglet actif ;
- dialogue ;
- chargement local ;
- étapes du parcours d’ajout dans une route.

## Utiliser SQLite pour

- profil ;
- cours ;
- pages ;
- fiche ;
- exercices ;
- réponses ;
- progression ;
- rapports.

## Ajouter un store uniquement pour

- import réparti entre plusieurs routes ;
- session active complexe ;
- état temporaire réellement partagé.

Ne pas dupliquer toute la base SQLite dans un store.

---

# 38. Gestion des erreurs

Chaque fonctionnalité doit prévoir :

- chargement ;
- état vide ;
- erreur ;
- succès.

Erreurs importantes :

- migration SQLite échouée ;
- Ollama indisponible ;
- image illisible ;
- réponse IA invalide ;
- cours introuvable ;
- session interrompue.

Les erreurs techniques partagées peuvent utiliser :

```text
src/components/shared/ErrorState.tsx
```

---

# 39. Conventions de fichiers

## Routes

```text
kebab-case.tsx
```

sauf les conventions Expo Router :

```text
_layout.tsx
[courseId]
(session)
```

## Composants React

```text
PascalCase.tsx
```

Exemple :

```text
CourseCard.tsx
```

## Services

```text
course.service.ts
```

## Repositories

```text
course.repository.ts
```

## Types

```text
course.types.ts
```

## Schémas

```text
course.schema.ts
```

## Hooks

```text
useCourses.ts
```

---

# 40. Règles pour rester simple et propre

1. Utiliser uniquement `src/app` pour les routes.
2. Ne jamais créer un second dossier racine `app`.
3. Réserver `src/components/ui` aux primitives Gluestack.
4. Garder les composants métier dans les fonctionnalités.
5. Conserver `src/db/migrations`.
6. Garder un seul `schema.ts` tant qu’il reste lisible.
7. Ne pas créer de dossier vide.
8. Ne pas ajouter Zustand tant que React suffit.
9. Ne pas ajouter un repository avant une vraie requête métier.
10. Ne pas appeler Ollama dans un écran.
11. Ne pas appeler Drizzle dans une route.
12. Garder les routes courtes.
13. Stocker les données persistantes dans SQLite.
14. Garder les références visuelles dans `doc`.
15. Copier les assets runtime dans `assets`.
16. Respecter l’alias actuel `@ → racine`.
17. Ne pas déplacer `global.css` sans mettre à jour Metro et le layout.
18. Installer les dépendances seulement lorsqu’elles deviennent utiles.

---

# 41. Plan d’évolution depuis le code actuel

## Étape 1 — Nettoyer les onglets du starter

- conserver `src/app/(tabs)/index.tsx` pour l’accueil ;
- remplacer `about.tsx` par `courses.tsx` ;
- ajouter `profile.tsx` ;
- adapter les icônes et couleurs.

## Étape 2 — Créer les composants communs

```text
src/components/shared/
```

Ajouter seulement :

- `AppScreen.tsx` ;
- `LoadingState.tsx` ;
- `ErrorState.tsx`.

## Étape 3 — Créer les premiers modules

```text
src/features/onboarding/
src/features/home/
src/features/courses/
```

## Étape 4 — Étendre le schéma Drizzle

Remplacer la table de démonstration actuelle par les modèles du cahier des charges.

## Étape 5 — Créer les repositories

```text
src/db/repositories/
```

## Étape 6 — Ajouter l’import de cours

Créer :

```text
src/features/course-import/
src/services/images/
```

## Étape 7 — Ajouter Ollama

Créer :

```text
src/services/ai/
src/config/env.ts
```

## Étape 8 — Ajouter les séances

Créer :

```text
src/features/revision/
src/features/study-session/
src/features/progress/
```

---

# 42. Décision finale

L’architecture officielle adaptée au dépôt actuel est :

> **Toutes les routes Expo Router restent dans `src/app`. Le dossier `src` contient également les fonctionnalités, composants, services et données. Les primitives Gluestack restent dans `src/components/ui`, les migrations restent dans `src/db/migrations`, et les nouveaux modules sont ajoutés progressivement sans créer de structure parallèle ou de dossiers inutiles.**