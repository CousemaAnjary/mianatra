# Mianatra — Architecture du projet et organisation des dossiers

## 1. Objectif du document

Ce document définit l’architecture technique et l’organisation des dossiers du projet **Mianatra**.

Le projet utilise :

- React Native ;
- Expo ;
- Expo Router ;
- TypeScript ;
- SQLite ;
- Drizzle ORM ;
- NativeWind ;
- Gluestack UI ;
- Zustand ;
- Zod ;
- Ollama sur PC pour le MVP ;
- Gemma via une API REST locale.

L’objectif est d’obtenir une architecture :

- simple à comprendre ;
- rapide à développer ;
- adaptée à un hackathon ;
- propre et maintenable ;
- facile à tester ;
- évolutive ;
- compatible avec une future intégration de Gemma hors ligne.

---

# 2. Choix d’architecture

## 2.1 Architecture retenue

Le projet utilise une architecture :

> **Feature-first avec une couche de services partagés**

Cela signifie que chaque grande fonctionnalité possède son propre dossier.

Exemples :

- onboarding ;
- cours ;
- exercices ;
- progression ;
- profil.

Les éléments communs restent dans des dossiers partagés :

- base de données ;
- composants UI ;
- services IA ;
- thème ;
- utilitaires.

## 2.2 Pourquoi cette architecture

Une architecture uniquement organisée par type devient vite difficile à parcourir :

```text
components/
services/
hooks/
screens/
types/
```

Tous les fichiers de toutes les fonctionnalités finissent mélangés.

Avec une architecture par fonctionnalité :

```text
features/
├── courses/
├── exercises/
├── onboarding/
└── progress/
```

Chaque fonctionnalité regroupe sa logique, ses composants, ses hooks et ses schémas.

Cela permet :

- de retrouver rapidement le code ;
- de travailler à plusieurs ;
- de supprimer ou modifier une fonctionnalité facilement ;
- d’éviter un dossier `components` gigantesque ;
- de limiter les dépendances entre modules.

---

# 3. Principes généraux

## 3.1 Rester simple

Le projet ne doit pas reproduire une architecture d’entreprise complexe.

Pour le MVP, éviter :

- plusieurs couches abstraites inutiles ;
- les factories pour chaque objet ;
- les use cases pour chaque petite action ;
- les événements de domaine complexes ;
- les microservices ;
- les dépendances circulaires ;
- les stores globaux trop importants.

## 3.2 Une responsabilité par fichier

Chaque fichier doit avoir un rôle principal.

Exemples :

```text
course.repository.ts
```

gère uniquement les données des cours.

```text
useCourseDetail.ts
```

gère la logique de l’écran de détail.

```text
CourseCard.tsx
```

affiche une carte de cours.

## 3.3 Les écrans restent légers

Un écran Expo Router doit principalement :

- récupérer les paramètres de navigation ;
- appeler un hook de fonctionnalité ;
- composer des composants ;
- gérer la navigation.

Un écran ne doit pas contenir :

- des requêtes SQL ;
- des appels directs à Ollama ;
- des centaines de lignes de logique ;
- des transformations complexes ;
- des règles métier.

## 3.4 Le code métier ne dépend pas de l’interface

Les fonctions de progression, correction et recommandation doivent pouvoir fonctionner sans React Native.

Exemple :

```ts
calculateConceptStatus({
  attempts: 5,
  correctAnswers: 3,
  usedHints: 2,
});
```

Cette fonction doit rester dans un fichier métier indépendant.

---

# 4. Organisation générale recommandée

```text
mianatra/
├── app/
├── assets/
├── src/
├── drizzle/
├── scripts/
├── tests/
├── .env
├── .env.example
├── app.json
├── babel.config.js
├── drizzle.config.ts
├── eslint.config.js
├── global.css
├── metro.config.js
├── nativewind-env.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

# 5. Dossier `app`

## 5.1 Rôle

Le dossier `app` contient uniquement les routes Expo Router.

Il ne doit pas contenir toute la logique métier.

## 5.2 Structure recommandée

```text
app/
├── _layout.tsx
├── index.tsx
│
├── onboarding/
│   ├── _layout.tsx
│   └── index.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── courses.tsx
│   └── profile.tsx
│
├── course/
│   ├── add/
│   │   ├── index.tsx
│   │   ├── source.tsx
│   │   ├── pages.tsx
│   │   ├── processing.tsx
│   │   └── review.tsx
│   │
│   └── [courseId]/
│       ├── index.tsx
│       ├── revision-sheet.tsx
│       ├── results.tsx
│       └── mistakes.tsx
│
├── session/
│   └── [sessionId]/
│       ├── index.tsx
│       ├── correction.tsx
│       └── complete.tsx
│
├── settings/
│   ├── index.tsx
│   └── ai.tsx
│
└── +not-found.tsx
```

## 5.3 Rôle des groupes de routes

### `(tabs)`

Contient la navigation principale :

- accueil ;
- mes cours ;
- profil.

### `onboarding`

Contient la création initiale du profil.

### `course/add`

Contient le parcours d’ajout :

```text
Choix de matière
→ Choix de source
→ Ajout des pages
→ Traitement
→ Vérification
```

### `course/[courseId]`

Contient les écrans liés à un cours précis.

### `session/[sessionId]`

Contient la session de révision active.

---

# 6. Dossier `src`

## 6.1 Structure globale

```text
src/
├── components/
├── config/
├── constants/
├── db/
├── features/
├── hooks/
├── lib/
├── providers/
├── services/
├── stores/
├── theme/
├── types/
└── utils/
```

---

# 7. Dossier `src/features`

## 7.1 Structure générale d’une fonctionnalité

Chaque fonctionnalité peut suivre cette structure :

```text
features/
└── courses/
    ├── components/
    ├── hooks/
    ├── schemas/
    ├── services/
    ├── types/
    ├── utils/
    └── index.ts
```

Tous les sous-dossiers ne sont pas obligatoires.

Créer uniquement ceux qui sont réellement nécessaires.

## 7.2 Fonctionnalités principales

```text
src/features/
├── onboarding/
├── home/
├── subjects/
├── courses/
├── course-import/
├── revision/
├── exercises/
├── study-session/
├── progress/
├── recommendations/
├── profile/
└── settings/
```

---

# 8. Module `onboarding`

```text
src/features/onboarding/
├── components/
│   ├── AgeStep.tsx
│   ├── ClassStep.tsx
│   ├── NameStep.tsx
│   └── OnboardingProgress.tsx
│
├── hooks/
│   └── useOnboarding.ts
│
├── schemas/
│   └── onboarding.schema.ts
│
├── services/
│   └── onboarding.service.ts
│
├── types/
│   └── onboarding.types.ts
│
└── index.ts
```

## Responsabilités

- formulaire du profil ;
- validation ;
- navigation entre les étapes ;
- enregistrement initial ;
- détection de la fin de l’onboarding.

---

# 9. Module `home`

```text
src/features/home/
├── components/
│   ├── GreetingHeader.tsx
│   ├── HomeEmptyState.tsx
│   ├── RecommendedStudyCard.tsx
│   ├── StudyStreakBadge.tsx
│   └── SubjectProgressList.tsx
│
├── hooks/
│   └── useHomeDashboard.ts
│
├── services/
│   └── home.service.ts
│
├── types/
│   └── home.types.ts
│
└── index.ts
```

## Responsabilités

- données de l’accueil ;
- recommandation principale ;
- progression rapide ;
- dernière activité ;
- état vide ;
- accès à l’ajout de cours.

---

# 10. Module `subjects`

```text
src/features/subjects/
├── components/
│   ├── SubjectCard.tsx
│   ├── SubjectIcon.tsx
│   └── SubjectPicker.tsx
│
├── constants/
│   └── default-subjects.ts
│
├── hooks/
│   └── useSubjects.ts
│
├── services/
│   └── subject.service.ts
│
├── types/
│   └── subject.types.ts
│
└── index.ts
```

## Responsabilités

- matières disponibles ;
- couleurs et icônes ;
- sélection d’une matière ;
- progression par matière.

---

# 11. Module `courses`

```text
src/features/courses/
├── components/
│   ├── CourseCard.tsx
│   ├── CourseHeader.tsx
│   ├── CourseList.tsx
│   ├── CourseProgress.tsx
│   ├── CourseStatusSection.tsx
│   └── CourseTabs.tsx
│
├── hooks/
│   ├── useCourse.ts
│   ├── useCourseActions.ts
│   └── useCourses.ts
│
├── schemas/
│   └── course.schema.ts
│
├── services/
│   └── course.service.ts
│
├── types/
│   └── course.types.ts
│
├── utils/
│   └── course-formatters.ts
│
└── index.ts
```

## Responsabilités

- liste des cours ;
- détail ;
- renommage ;
- archivage ;
- suppression ;
- progression du cours ;
- regroupement par matière.

---

# 12. Module `course-import`

```text
src/features/course-import/
├── components/
│   ├── AddPageButton.tsx
│   ├── CoursePageGrid.tsx
│   ├── CoursePageItem.tsx
│   ├── ImageQualityWarning.tsx
│   ├── ImportSourceSheet.tsx
│   ├── PageOrderControls.tsx
│   └── ProcessingSteps.tsx
│
├── hooks/
│   ├── useCourseImport.ts
│   ├── useCoursePages.ts
│   └── useImagePicker.ts
│
├── schemas/
│   ├── course-analysis.schema.ts
│   └── import.schema.ts
│
├── services/
│   ├── course-analysis.service.ts
│   ├── course-import.service.ts
│   └── image-processing.service.ts
│
├── stores/
│   └── course-import.store.ts
│
├── types/
│   └── course-import.types.ts
│
├── utils/
│   ├── image-compression.ts
│   └── page-order.ts
│
└── index.ts
```

## Responsabilités

- ajout de photos ;
- galerie ;
- caméra ;
- PDF plus tard ;
- ordre des pages ;
- suppression ;
- rotation ;
- compression ;
- analyse IA ;
- validation des informations détectées.

## Pourquoi un store local

Le parcours d’ajout se déroule sur plusieurs écrans.

Le store permet de garder temporairement :

- matière choisie ;
- images ;
- ordre ;
- état de traitement ;
- résultat d’analyse.

Une fois le cours enregistré, le store doit être réinitialisé.

---

# 13. Module `revision`

```text
src/features/revision/
├── components/
│   ├── DefinitionBlock.tsx
│   ├── FormulaBlock.tsx
│   ├── KeyConceptList.tsx
│   ├── RevisionSection.tsx
│   └── RevisionSheetView.tsx
│
├── hooks/
│   └── useRevisionSheet.ts
│
├── schemas/
│   └── revision-sheet.schema.ts
│
├── services/
│   └── revision.service.ts
│
├── types/
│   └── revision.types.ts
│
└── index.ts
```

## Responsabilités

- génération de fiche ;
- affichage ;
- sections ;
- définitions ;
- formules ;
- exemples ;
- régénération.

---

# 14. Module `exercises`

```text
src/features/exercises/
├── components/
│   ├── AnswerInput.tsx
│   ├── ExerciseContent.tsx
│   ├── ExerciseProgress.tsx
│   ├── HintPanel.tsx
│   ├── MultipleChoiceAnswer.tsx
│   ├── NumericAnswer.tsx
│   ├── ShortAnswer.tsx
│   └── TrueFalseAnswer.tsx
│
├── hooks/
│   ├── useExercise.ts
│   └── useExerciseAnswer.ts
│
├── schemas/
│   └── exercise.schema.ts
│
├── services/
│   ├── exercise-generation.service.ts
│   └── exercise-validation.service.ts
│
├── types/
│   └── exercise.types.ts
│
├── utils/
│   ├── answer-normalizer.ts
│   └── exercise-checker.ts
│
└── index.ts
```

## Responsabilités

- affichage des différents exercices ;
- saisie ;
- validation ;
- indices ;
- réponse attendue ;
- comparaison déterministe lorsque possible.

---

# 15. Module `study-session`

```text
src/features/study-session/
├── components/
│   ├── CorrectionPanel.tsx
│   ├── SessionHeader.tsx
│   ├── SessionProgress.tsx
│   └── SessionSummary.tsx
│
├── hooks/
│   ├── useActiveSession.ts
│   ├── useSessionCorrection.ts
│   └── useSessionNavigation.ts
│
├── schemas/
│   └── study-session.schema.ts
│
├── services/
│   ├── correction.service.ts
│   └── study-session.service.ts
│
├── stores/
│   └── active-session.store.ts
│
├── types/
│   └── study-session.types.ts
│
└── index.ts
```

## Responsabilités

- session active ;
- exercice courant ;
- réponses ;
- correction ;
- passage à l’exercice suivant ;
- reprise après interruption ;
- fin de séance.

---

# 16. Module `progress`

```text
src/features/progress/
├── components/
│   ├── ConceptProgressCard.tsx
│   ├── ProgressBar.tsx
│   ├── ProgressCircle.tsx
│   └── ProgressStatusBadge.tsx
│
├── domain/
│   ├── calculate-concept-score.ts
│   ├── calculate-course-progress.ts
│   └── determine-concept-status.ts
│
├── hooks/
│   └── useProgress.ts
│
├── services/
│   └── progress.service.ts
│
├── types/
│   └── progress.types.ts
│
└── index.ts
```

## Responsabilités

- score par notion ;
- progression par cours ;
- progression par matière ;
- statuts ;
- calculs déterministes.

## Règle importante

Les pourcentages ne doivent pas être inventés par Gemma.

Ils doivent être calculés par le code.

---

# 17. Module `recommendations`

```text
src/features/recommendations/
├── domain/
│   ├── build-recommendation.ts
│   └── rank-recommendations.ts
│
├── hooks/
│   └── useRecommendation.ts
│
├── services/
│   └── recommendation.service.ts
│
├── types/
│   └── recommendation.types.ts
│
└── index.ts
```

## Responsabilités

- prochaine séance ;
- reprise d’une session ;
- notion à renforcer ;
- durée estimée ;
- priorité.

---

# 18. Module `profile`

```text
src/features/profile/
├── components/
│   ├── ProfileHeader.tsx
│   ├── ProfileStatCard.tsx
│   └── SettingsRow.tsx
│
├── hooks/
│   └── useProfile.ts
│
├── schemas/
│   └── profile.schema.ts
│
├── services/
│   └── profile.service.ts
│
├── types/
│   └── profile.types.ts
│
└── index.ts
```

---

# 19. Dossier `src/components`

## 19.1 Rôle

Contient uniquement les composants réellement partagés entre plusieurs fonctionnalités.

```text
src/components/
├── ui/
├── layout/
├── feedback/
└── brand/
```

## 19.2 Composants UI

```text
src/components/ui/
├── AppButton.tsx
├── AppCard.tsx
├── AppDialog.tsx
├── AppIconButton.tsx
├── AppInput.tsx
├── AppScreen.tsx
├── AppSelect.tsx
├── AppText.tsx
├── AppTextarea.tsx
├── Badge.tsx
├── Divider.tsx
├── LoadingSpinner.tsx
└── index.ts
```

## 19.3 Layout

```text
src/components/layout/
├── AppHeader.tsx
├── BottomTabBar.tsx
├── ScreenContainer.tsx
├── Section.tsx
└── index.ts
```

## 19.4 Feedback

```text
src/components/feedback/
├── EmptyState.tsx
├── ErrorState.tsx
├── LoadingState.tsx
├── OfflineBanner.tsx
├── SuccessMessage.tsx
└── index.ts
```

## 19.5 Brand

```text
src/components/brand/
├── LambaPattern.tsx
├── MianatraLogo.tsx
└── index.ts
```

## Règle

Un composant spécifique à une fonctionnalité reste dans cette fonctionnalité.

Exemple :

```text
CourseCard.tsx
```

reste dans :

```text
features/courses/components/
```

Il ne va dans `src/components` que s’il devient réellement générique.

---

# 20. Dossier `src/db`

## 20.1 Structure

```text
src/db/
├── client.ts
├── schema/
│   ├── app-settings.table.ts
│   ├── concepts.table.ts
│   ├── course-analyses.table.ts
│   ├── course-pages.table.ts
│   ├── courses.table.ts
│   ├── exercise-attempts.table.ts
│   ├── exercises.table.ts
│   ├── index.ts
│   ├── progress.table.ts
│   ├── recommendations.table.ts
│   ├── reports.table.ts
│   ├── revision-sheets.table.ts
│   ├── sessions.table.ts
│   ├── subjects.table.ts
│   └── users.table.ts
│
├── repositories/
│   ├── course.repository.ts
│   ├── exercise.repository.ts
│   ├── progress.repository.ts
│   ├── report.repository.ts
│   ├── session.repository.ts
│   ├── subject.repository.ts
│   └── user.repository.ts
│
├── migrations.ts
├── seed.ts
└── types.ts
```

## 20.2 `client.ts`

Responsable de :

- initialiser Expo SQLite ;
- créer la connexion Drizzle ;
- exporter le client ;
- appliquer les migrations.

## 20.3 Tables

Une table par fichier permet de garder les schémas lisibles.

## 20.4 Repositories

Les repositories regroupent les requêtes SQLite.

Exemple :

```ts
export const courseRepository = {
  findAll,
  findById,
  create,
  update,
  archive,
  remove,
};
```

Les composants et hooks ne doivent pas écrire directement des requêtes Drizzle.

---

# 21. Dossier `drizzle`

```text
drizzle/
├── 0000_initial.sql
├── 0001_add_recommendations.sql
└── meta/
```

Ce dossier contient les migrations générées.

Ne pas modifier manuellement une migration déjà utilisée.

Créer une nouvelle migration pour chaque évolution.

---

# 22. Dossier `src/services`

```text
src/services/
├── ai/
├── files/
├── images/
└── logging/
```

---

# 23. Service IA

## 23.1 Structure

```text
src/services/ai/
├── providers/
│   ├── ollama.provider.ts
│   └── index.ts
│
├── prompts/
│   ├── analyze-course.prompt.ts
│   ├── classify-mistake.prompt.ts
│   ├── explain-answer.prompt.ts
│   ├── generate-exercises.prompt.ts
│   ├── generate-report.prompt.ts
│   └── generate-revision-sheet.prompt.ts
│
├── schemas/
│   ├── ai-course-analysis.schema.ts
│   ├── ai-correction.schema.ts
│   ├── ai-exercise.schema.ts
│   ├── ai-report.schema.ts
│   └── ai-revision-sheet.schema.ts
│
├── ai-provider.interface.ts
├── ai.service.ts
├── ai.types.ts
├── ai.errors.ts
└── index.ts
```

## 23.2 Interface

```ts
export interface AIProvider {
  checkHealth(): Promise<AIHealthStatus>;

  analyzeCourse(
    input: AnalyzeCourseInput
  ): Promise<CourseAnalysisOutput>;

  generateRevisionSheet(
    input: RevisionSheetInput
  ): Promise<RevisionSheetOutput>;

  generateExercises(
    input: GenerateExercisesInput
  ): Promise<ExerciseOutput[]>;

  explainAnswer(
    input: ExplainAnswerInput
  ): Promise<CorrectionOutput>;

  generateSessionReport(
    input: SessionReportInput
  ): Promise<SessionReportOutput>;
}
```

## 23.3 `ai.service.ts`

Ce fichier choisit le provider actif.

```ts
const provider = createAIProvider(config.aiProvider);

export const aiService = {
  checkHealth: () => provider.checkHealth(),
  analyzeCourse: (input) => provider.analyzeCourse(input),
  generateRevisionSheet: (input) =>
    provider.generateRevisionSheet(input),
};
```

Le reste de l’application appelle `aiService`.

Il ne doit pas importer directement `ollama.provider.ts`.

---

# 24. Service fichiers

```text
src/services/files/
├── file.service.ts
├── file.types.ts
└── index.ts
```

## Responsabilités

- créer les dossiers locaux ;
- déplacer une image ;
- supprimer un fichier ;
- créer des noms uniques ;
- vérifier l’existence ;
- nettoyer les fichiers temporaires.

---

# 25. Service images

```text
src/services/images/
├── image-compression.service.ts
├── image-quality.service.ts
├── image-rotation.service.ts
├── image.types.ts
└── index.ts
```

## Responsabilités

- compression ;
- rotation ;
- création de miniatures ;
- conversion base64 ;
- vérification basique de qualité.

---

# 26. Dossier `src/stores`

## 26.1 Structure

```text
src/stores/
├── app.store.ts
├── auth.store.ts
└── index.ts
```

Le projet ne nécessite pas un store global pour toutes les données.

SQLite reste la source principale de vérité.

## 26.2 Stores de fonctionnalité

Les stores temporaires restent dans la fonctionnalité concernée :

```text
features/course-import/stores/course-import.store.ts
features/study-session/stores/active-session.store.ts
```

## 26.3 Ce qui va dans Zustand

Utiliser Zustand pour :

- état temporaire multi-écrans ;
- session active ;
- import en cours ;
- préférences simples ;
- état de connexion Ollama.

Ne pas utiliser Zustand pour remplacer SQLite.

---

# 27. Dossier `src/config`

```text
src/config/
├── env.ts
├── ai.config.ts
├── app.config.ts
└── index.ts
```

## 27.1 Validation des variables

```ts
const EnvSchema = z.object({
  EXPO_PUBLIC_AI_PROVIDER: z
    .enum(["ollama", "cloud", "offline"])
    .default("ollama"),

  EXPO_PUBLIC_OLLAMA_BASE_URL: z.string().url(),

  EXPO_PUBLIC_OLLAMA_MODEL: z.string().min(1),
});
```

L’application doit échouer avec un message clair en développement si une variable manque.

---

# 28. Dossier `src/theme`

```text
src/theme/
├── colors.ts
├── components.ts
├── radius.ts
├── shadows.ts
├── spacing.ts
├── typography.ts
└── index.ts
```

## Exemple

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

Les couleurs ne doivent pas être répétées manuellement dans chaque composant.

---

# 29. Dossier `src/constants`

```text
src/constants/
├── routes.ts
├── storage.ts
├── study-status.ts
└── index.ts
```

## Exemples

```ts
export const STUDY_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  NEEDS_REINFORCEMENT: "needs_reinforcement",
  MASTERED: "mastered",
} as const;
```

---

# 30. Dossier `src/types`

```text
src/types/
├── common.types.ts
├── navigation.types.ts
└── index.ts
```

Ce dossier contient uniquement les types partagés.

Les types spécifiques restent dans leur fonctionnalité.

---

# 31. Dossier `src/utils`

```text
src/utils/
├── date.ts
├── id.ts
├── json.ts
├── number.ts
├── result.ts
├── string.ts
└── index.ts
```

## Règles

Un utilitaire doit :

- être générique ;
- ne pas dépendre d’une fonctionnalité ;
- rester pur lorsque possible ;
- être testé lorsqu’il contient une logique importante.

---

# 32. Dossier `src/hooks`

```text
src/hooks/
├── useAppReady.ts
├── useDebounce.ts
├── useNetworkStatus.ts
└── index.ts
```

Uniquement les hooks vraiment globaux.

Les hooks métier restent dans leurs fonctionnalités.

---

# 33. Dossier `src/providers`

```text
src/providers/
├── AppProviders.tsx
├── DatabaseProvider.tsx
├── GluestackProvider.tsx
└── index.ts
```

## `AppProviders.tsx`

Regroupe les providers globaux :

```tsx
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GluestackProvider>
      <DatabaseProvider>
        {children}
      </DatabaseProvider>
    </GluestackProvider>
  );
}
```

Éviter d’accumuler trop de providers dans `_layout.tsx`.

---

# 34. Dossier `assets`

```text
assets/
├── fonts/
├── icons/
├── illustrations/
├── images/
├── patterns/
└── samples/
```

## Contenu

### `fonts`

- Nunito Sans.

### `icons`

- icônes personnalisées ;
- logo.

### `illustrations`

- onboarding ;
- élève lisant ;
- rapport de séance.

### `patterns`

- motifs lamba.

### `samples`

- exemples de pages de cours pour la démonstration.

---

# 35. Dossier `scripts`

```text
scripts/
├── check-env.ts
├── reset-database.ts
├── seed-demo.ts
└── verify-ollama.ts
```

## Utilité

- vérifier les variables ;
- réinitialiser la base ;
- charger les données de démo ;
- tester Ollama.

---

# 36. Dossier `tests`

```text
tests/
├── integration/
├── mocks/
└── setup/
```

Les tests unitaires peuvent être placés près des fichiers :

```text
calculate-concept-score.test.ts
```

Les tests d’intégration restent dans `tests/integration`.

---

# 37. Flux de données principal

## 37.1 Ajout d’un cours

```text
Écran
  ↓
useCourseImport
  ↓
courseImportService
  ↓
imageService
  ↓
courseRepository
  ↓
SQLite
```

Puis :

```text
courseAnalysisService
  ↓
aiService
  ↓
OllamaAIProvider
  ↓
Ollama sur PC
```

La réponse revient :

```text
Ollama
  ↓
Zod validation
  ↓
courseAnalysisService
  ↓
courseRepository
  ↓
SQLite
  ↓
Écran de vérification
```

## 37.2 Session d’exercice

```text
Écran
  ↓
useActiveSession
  ↓
studySessionService
  ↓
sessionRepository
  ↓
SQLite
```

Après la réponse :

```text
exerciseValidationService
  ↓
Correction déterministe ou IA
  ↓
attemptRepository
  ↓
progressService
  ↓
progressRepository
  ↓
SQLite
```

---

# 38. Séparation des responsabilités

## Écran

Responsable de :

- navigation ;
- composition visuelle ;
- paramètres de route.

## Composant

Responsable de :

- affichage ;
- interactions locales ;
- accessibilité.

## Hook

Responsable de :

- état de l’écran ;
- chargement ;
- orchestration ;
- appels aux services.

## Service

Responsable de :

- règles métier ;
- enchaînement d’actions ;
- transformation des données.

## Repository

Responsable de :

- lecture SQLite ;
- écriture SQLite ;
- transactions.

## Provider IA

Responsable de :

- communication avec Ollama ;
- requête HTTP ;
- format de réponse ;
- erreurs réseau.

## Schéma Zod

Responsable de :

- validation des entrées ;
- validation des réponses IA ;
- sécurité des données.

---

# 39. Exemple d’un écran propre

```tsx
export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  const {
    course,
    progress,
    isLoading,
    error,
    startRevision,
  } = useCourseDetail(courseId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !course) {
    return <ErrorState message="Cours introuvable." />;
  }

  return (
    <AppScreen>
      <CourseHeader course={course} />
      <CourseProgress progress={progress} />
      <CourseActions onStartRevision={startRevision} />
    </AppScreen>
  );
}
```

L’écran ne contient ni SQL ni appel Ollama.

---

# 40. Exemple d’un service propre

```ts
export async function createCourseFromPages(
  input: CreateCourseInput,
): Promise<Course> {
  return db.transaction(async () => {
    const course = await courseRepository.create({
      subjectId: input.subjectId,
      title: input.title ?? "Nouveau cours",
      status: "draft",
    });

    await coursePageRepository.createMany(
      input.pages.map((page, index) => ({
        courseId: course.id,
        localUri: page.localUri,
        pageIndex: index,
      })),
    );

    return course;
  });
}
```

---

# 41. Exemple d’un hook propre

```ts
export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await courseService.getCourseDetail(courseId);
      setCourse(result);
    } catch (caughtError) {
      setError(toError(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    course,
    isLoading,
    error,
    reload: load,
  };
}
```

---

# 42. Gestion des erreurs

## 42.1 Erreurs métier

Créer des classes simples :

```text
CourseNotFoundError
InvalidCoursePageError
AIUnavailableError
InvalidAIResponseError
DatabaseError
```

## 42.2 Résultat standard

Pour certains services :

```ts
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

Ne pas utiliser ce modèle partout si cela alourdit inutilement le code.

## 42.3 Interface

Les écrans doivent gérer au minimum :

- chargement ;
- succès ;
- erreur ;
- état vide ;
- absence d’Ollama ;
- absence de connexion locale.

---

# 43. Gestion du chargement

## 43.1 Chargement court

Utiliser un spinner ou skeleton.

## 43.2 Chargement IA

Afficher les étapes réelles :

```text
Pages préparées
Cours analysé
Notions détectées
Fiche en préparation
```

Ne jamais bloquer l’écran sans indication.

---

# 44. Gestion de l’état hors ligne

## Données disponibles hors ligne

- profil ;
- matières ;
- cours ;
- pages ;
- fiches déjà générées ;
- exercices déjà générés ;
- progression ;
- historique ;
- rapports.

## Données nécessitant Ollama

- nouvelle analyse ;
- nouvelle fiche ;
- nouveaux exercices ;
- explication IA ;
- nouveau rapport génératif.

Si Ollama est indisponible :

- ne pas supprimer les données ;
- afficher une explication ;
- permettre de réessayer ;
- conserver le cours en brouillon.

---

# 45. Navigation

## 45.1 Règles

- utiliser Expo Router ;
- centraliser les chemins importants dans `routes.ts` ;
- passer uniquement des identifiants dans les paramètres ;
- ne pas passer des objets complets dans la navigation ;
- recharger les données depuis SQLite.

## Exemple

```ts
router.push({
  pathname: "/course/[courseId]",
  params: { courseId },
});
```

---

# 46. Conventions de nommage

## Fichiers

```text
kebab-case.ts
kebab-case.tsx
```

Exemples :

```text
course-card.tsx
course.repository.ts
use-course-detail.ts
```

Une autre convention acceptable est PascalCase pour les composants :

```text
CourseCard.tsx
```

Choisir une convention et la garder partout.

## Composants

```text
PascalCase
```

## Fonctions

```text
camelCase
```

## Constantes

```text
UPPER_SNAKE_CASE
```

## Types

```text
PascalCase
```

## Tables SQL

```text
snake_case
```

---

# 47. Imports

## Alias TypeScript

Configurer :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./app/*"],
      "@assets/*": ["./assets/*"]
    }
  }
}
```

## Exemple

```ts
import { AppButton } from "@/components/ui";
import { courseService } from "@/features/courses";
import { db } from "@/db/client";
```

Éviter :

```ts
../../../../../components/ui/AppButton
```

---

# 48. Exports

Chaque module peut avoir un fichier `index.ts`.

Exemple :

```ts
export * from "./components/CourseCard";
export * from "./hooks/useCourses";
export * from "./services/course.service";
```

Ne pas exporter tous les fichiers internes.

Exposer uniquement l’API publique du module.

---

# 49. Dépendances entre modules

## Autorisé

```text
features/courses
→ db
→ components partagés
→ services partagés
```

## À éviter

```text
features/courses
↔ features/exercises
```

Une dépendance circulaire doit être évitée.

Si plusieurs modules partagent une logique, la déplacer dans :

- `src/services` ;
- `src/lib` ;
- `src/utils` ;
- un module métier partagé.

---

# 50. Dossier `src/lib`

```text
src/lib/
├── logger.ts
├── query-keys.ts
└── index.ts
```

Utiliser ce dossier uniquement pour de petites abstractions techniques partagées.

Ne pas y déplacer toute la logique métier.

---

# 51. NativeWind et Gluestack

## 51.1 Répartition

Utiliser Gluestack pour :

- champs ;
- dialogs ;
- modales ;
- overlays ;
- composants accessibles complexes.

Utiliser NativeWind pour :

- layout ;
- spacing ;
- couleurs ;
- typographie ;
- tailles ;
- responsive.

## 51.2 Composants wrappers

Créer des composants Mianatra au-dessus de Gluestack.

Exemple :

```tsx
export function AppButton(props: AppButtonProps) {
  return (
    <Button
      className="h-14 rounded-2xl bg-primary-500"
      {...props}
    />
  );
}
```

Les écrans utilisent `AppButton`, pas directement plusieurs variantes différentes de Gluestack.

---

# 52. Base de données comme source de vérité

SQLite est la source de vérité pour :

- profil ;
- cours ;
- pages ;
- exercices ;
- progression ;
- rapports.

Zustand ne doit pas dupliquer durablement toute la base.

## Exemple

Bon :

```text
SQLite → données persistantes
Zustand → import temporaire
```

Mauvais :

```text
SQLite + Zustand avec les mêmes données complètes
```

---

# 53. Gestion des données de démonstration

Créer :

```text
src/db/seed.ts
```

Le seed ajoute :

- un profil Fara ;
- plusieurs matières ;
- un cours de mathématiques ;
- une fiche ;
- cinq exercices ;
- une progression ;
- un rapport.

Ajouter une commande :

```bash
npm run seed:demo
```

Cela permet de présenter l’application même si Ollama rencontre un problème.

---

# 54. Scripts recommandés

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "db:generate": "drizzle-kit generate",
    "db:reset": "tsx scripts/reset-database.ts",
    "seed:demo": "tsx scripts/seed-demo.ts",
    "ollama:check": "tsx scripts/verify-ollama.ts"
  }
}
```

---

# 55. Ordre de développement recommandé

## Étape 1 — Base du projet

- Expo ;
- TypeScript ;
- NativeWind ;
- Gluestack ;
- Expo Router ;
- thème ;
- composants de base.

## Étape 2 — Base locale

- SQLite ;
- Drizzle ;
- tables ;
- migrations ;
- repositories ;
- seed de démonstration.

## Étape 3 — Parcours simple

- onboarding ;
- accueil ;
- mes cours ;
- profil.

## Étape 4 — Ajout de cours

- sélection matière ;
- images ;
- réorganisation ;
- enregistrement local.

## Étape 5 — IA

- interface AIProvider ;
- OllamaAIProvider ;
- analyse ;
- Zod ;
- gestion des erreurs.

## Étape 6 — Révision

- fiche ;
- exercices ;
- session ;
- correction ;
- rapport.

## Étape 7 — Adaptation

- progression ;
- notions faibles ;
- exercices ciblés ;
- recommandation.

## Étape 8 — Stabilisation

- tests ;
- erreurs ;
- accessibilité ;
- performance ;
- données de démo.

---

# 56. Architecture minimale pour le hackathon

Si le temps est très limité, commencer avec :

```text
src/
├── components/
├── db/
├── features/
│   ├── onboarding/
│   ├── courses/
│   ├── course-import/
│   ├── exercises/
│   └── progress/
├── services/
│   └── ai/
├── theme/
└── utils/
```

Ne pas créer tous les dossiers vides dès le départ.

Créer un dossier seulement lorsqu’un vrai fichier doit y être ajouté.

---

# 57. Règles pour garder le projet propre

1. Aucun appel SQL dans un écran.
2. Aucun appel Ollama dans un composant.
3. Aucun fichier de plus de 300 lignes sans raison.
4. Aucun store global géant.
5. Aucun type `any`.
6. Toute réponse IA est validée avec Zod.
7. Toute image est enregistrée avant l’analyse.
8. Toute opération multiple utilise une transaction.
9. Les composants communs utilisent le design system.
10. Les pourcentages sont calculés par le code.
11. Les erreurs sont affichées clairement.
12. Les routes ne transportent que des identifiants.
13. Les données persistantes restent dans SQLite.
14. Les états temporaires restent dans les hooks ou Zustand.
15. Chaque module expose une API publique claire.

---

# 58. Anti-patterns à éviter

## Écran géant

```text
CourseScreen.tsx — 1 500 lignes
```

## Service universel

```text
app.service.ts
```

qui gère :

- cours ;
- profil ;
- IA ;
- exercices ;
- fichiers.

## Base appelée partout

```ts
db.select().from(courses)
```

directement dans chaque composant.

## Appel Ollama direct

```ts
fetch("http://192.168...")
```

dans un écran.

## Données IA non validées

```ts
const result = JSON.parse(response);
```

sans schéma Zod.

## Styles dupliqués

```tsx
className="bg-[#D94B24]"
```

répété dans toute l’application.

Préférer les tokens du thème.

---

# 59. Résumé de l’architecture

```text
Expo Router
    ↓
Écrans légers
    ↓
Hooks de fonctionnalité
    ↓
Services métier
    ↓
Repositories / AIProvider / File services
    ↓
SQLite / Ollama / FileSystem
```

## Source de vérité

```text
SQLite
```

## État temporaire

```text
Hooks React + Zustand ciblé
```

## Interface

```text
Gluestack + NativeWind + composants Mianatra
```

## Intelligence artificielle du MVP

```text
AIProvider
    ↓
OllamaAIProvider
    ↓
Ollama sur PC
    ↓
Gemma
```

---

# 60. Structure finale recommandée

```text
mianatra/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding/
│   ├── (tabs)/
│   ├── course/
│   ├── session/
│   └── settings/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── illustrations/
│   ├── patterns/
│   └── samples/
│
├── src/
│   ├── components/
│   │   ├── brand/
│   │   ├── feedback/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── config/
│   ├── constants/
│   │
│   ├── db/
│   │   ├── repositories/
│   │   ├── schema/
│   │   ├── client.ts
│   │   ├── migrations.ts
│   │   └── seed.ts
│   │
│   ├── features/
│   │   ├── onboarding/
│   │   ├── home/
│   │   ├── subjects/
│   │   ├── courses/
│   │   ├── course-import/
│   │   ├── revision/
│   │   ├── exercises/
│   │   ├── study-session/
│   │   ├── progress/
│   │   ├── recommendations/
│   │   ├── profile/
│   │   └── settings/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   │
│   ├── services/
│   │   ├── ai/
│   │   ├── files/
│   │   ├── images/
│   │   └── logging/
│   │
│   ├── stores/
│   ├── theme/
│   ├── types/
│   └── utils/
│
├── drizzle/
├── scripts/
├── tests/
├── .env
├── .env.example
├── app.json
├── drizzle.config.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

# 61. Décision finale

L’architecture officielle de Mianatra est :

> **Une architecture feature-first simple, avec Expo Router pour la navigation, SQLite comme source de vérité, Drizzle pour l’accès aux données, des services métier légers, un AIProvider remplaçable et des composants partagés basés sur NativeWind et Gluestack.**

Cette organisation permet de développer rapidement le MVP sans sacrifier la qualité du code ni bloquer les évolutions futures.
