# Cahier des charges — Mianatra

## 1. Informations générales

### 1.1 Nom du projet

**Mianatra**

### 1.2 Type de produit

Application mobile éducative de révision personnalisée destinée aux lycéens malagasy.

### 1.3 Public cible

- Élèves de **Seconde**
- Élèves de **Première**
- Élèves de **Terminale**
- Lycéens préparant progressivement le baccalauréat malagasy

### 1.4 Objectif principal

Permettre à un élève de transformer les pages photographiées de ses propres cours en un parcours de révision personnalisé comprenant :

- une fiche de révision ;
- des exercices générés à partir du cours ;
- une correction expliquée ;
- une analyse des notions maîtrisées et à renforcer ;
- des exercices suivants adaptés à ses difficultés ;
- un suivi de progression simple.

### 1.5 Proposition de valeur

> Mianatra transforme les cours personnels d’un lycéen en séances de révision personnalisées, adaptées à ses erreurs et accessibles même avec une connexion limitée.

---

# 2. Périmètre du MVP

## 2.1 Fonctionnalités incluses

Le MVP doit permettre de :

1. créer un profil local ;
2. choisir sa classe et sa série ;
3. consulter l’accueil personnalisé ;
4. consulter la liste des matières et des cours ;
5. ajouter un cours à partir de plusieurs photos ;
6. réorganiser, supprimer ou remplacer les pages ;
7. compiler les pages en un seul cours ;
8. analyser le contenu du cours ;
9. confirmer ou corriger les informations détectées ;
10. générer une fiche de révision ;
11. générer une première série d’exercices ;
12. enregistrer les réponses de l’élève ;
13. corriger les exercices ;
14. expliquer les erreurs ;
15. identifier les notions maîtrisées et à renforcer ;
16. générer des exercices ciblés ;
17. afficher un rapport de séance ;
18. enregistrer la progression localement ;
19. consulter les résultats d’un cours ;
20. reprendre une séance interrompue.

## 2.2 Fonctionnalités exclues du MVP

Les fonctionnalités suivantes ne font pas partie de la première version :

- authentification distante obligatoire ;
- paiement ou abonnement ;
- espace parent complet ;
- espace enseignant complet ;
- messagerie ;
- réseau social ;
- classement public ;
- visioconférence ;
- marketplace de cours ;
- calendrier scolaire complexe ;
- synchronisation multi-appareils ;
- mode communautaire ;
- notifications avancées ;
- génération pour toutes les matières sans validation ;
- administration web complète.

---

# 3. Stack technique

## 3.1 Technologies principales

| Élément | Technologie |
|---|---|
| Application mobile | React Native |
| Environnement | Expo |
| Navigation | Expo Router |
| Base de données locale | SQLite |
| ORM | Drizzle ORM |
| Style | NativeWind |
| Composants UI | Gluestack UI |
| Langage | TypeScript |
| Gestion des formulaires | React Hook Form |
| Validation | Zod |
| Gestion d’état | Zustand ou Context API |
| Gestion des images | Expo Image Picker / Expo Camera |
| Compression d’images | Expo Image Manipulator |
| Fichiers locaux | Expo FileSystem |
| Icônes | Lucide React Native |
| IA du MVP | Gemma via Ollama exécuté sur un ordinateur |
| Communication IA | API REST HTTP locale Ollama |
| Modèle de développement | `gemma4:e2b`, configurable par variable d’environnement |
| Tests unitaires | Jest |
| Tests composants | React Native Testing Library |

## 3.2 Décision d’architecture IA pour le MVP

Pour le hackathon et la première version fonctionnelle, le modèle Gemma n’est pas embarqué directement dans l’application mobile.

L’architecture retenue est :

```text
Application Mianatra
React Native + Expo
        ↓
AIProvider TypeScript
        ↓
OllamaAIProvider
        ↓ HTTP local
Ollama exécuté sur le PC
        ↓
Modèle Gemma
```

Cette solution permet de :

- développer et tester rapidement ;
- utiliser Expo sans module natif d’inférence ;
- traiter des images de cours ;
- modifier les prompts sans reconstruire l’application ;
- changer de modèle facilement ;
- conserver une architecture compatible avec une future version hors ligne embarquée.

L’intégration d’un modèle Gemma directement dans l’application mobile est reportée après le MVP.

## 3.3 Principes techniques

- architecture **offline-first** pour les données fonctionnelles ;
- stockage local prioritaire dans SQLite ;
- l’application reste consultable hors connexion pour les données déjà générées ;
- la génération IA nécessite temporairement une connexion au PC exécutant Ollama ;
- composants réutilisables ;
- séparation entre interface, logique métier et accès aux données ;
- service IA accessible uniquement via une interface `AIProvider` ;
- fournisseur IA remplaçable sans modifier les écrans ;
- schémas TypeScript stricts ;
- validation systématique des réponses IA avec Zod ;
- aucune logique importante directement dans les composants d’écran ;
- aucun appel direct à Ollama depuis les composants React.

## 3.4 Configuration réseau du MVP

### Téléphone physique

Le téléphone et le PC doivent être connectés au même réseau local.

L’application utilise l’adresse IP locale du PC :

```text
http://192.168.x.x:11434
```

L’application ne doit jamais utiliser `localhost` pour joindre Ollama depuis un téléphone physique, car `localhost` désigne alors le téléphone.

### Émulateur Android

Pour joindre Ollama sur la machine hôte depuis l’émulateur Android :

```text
http://10.0.2.2:11434
```

### Configuration Ollama

Ollama doit écouter sur le réseau local :

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

Le port `11434` ne doit pas être exposé publiquement sur Internet.

## 3.5 Variables d’environnement

```env
EXPO_PUBLIC_AI_PROVIDER=ollama
EXPO_PUBLIC_OLLAMA_BASE_URL=http://192.168.1.25:11434
EXPO_PUBLIC_OLLAMA_MODEL=gemma4:e2b
```

Pour l’émulateur Android :

```env
EXPO_PUBLIC_OLLAMA_BASE_URL=http://10.0.2.2:11434
```

Les valeurs doivent être modifiables sans changer le code source.

---

# 4. Architecture fonctionnelle

L’application est divisée en modules indépendants.

## Liste des modules

1. Onboarding et profil
2. Accueil
3. Matières et cours
4. Ajout et compilation des pages
5. Analyse du cours
6. Détail du cours
7. Fiche de révision
8. Génération des exercices
9. Session d’exercice
10. Correction et explication
11. Analyse adaptative
12. Résultats et progression
13. Rapport de séance
14. Profil et paramètres
15. Stockage local
16. Service IA
17. Gestion des erreurs
18. Design system et composants partagés

---

# 5. Module 1 — Onboarding et profil

## 5.1 Objectif

Créer un profil local permettant de personnaliser l’expérience.

## 5.2 Écran concerné

- Onboarding
- Création du profil

## 5.3 Données demandées

- prénom ou pseudonyme ;
- âge ;
- classe ;
- série ;
- langue d’explication ;
- éventuellement établissement scolaire.

## 5.4 Fonctionnalités

- saisir le prénom ;
- sélectionner l’âge ;
- choisir entre Seconde, Première et Terminale ;
- choisir une série ;
- choisir la langue d’explication ;
- afficher l’avancement de l’onboarding ;
- enregistrer le profil dans SQLite ;
- rediriger vers l’accueil après validation ;
- ne plus afficher l’onboarding si le profil existe déjà.

## 5.5 Règles métier

- le prénom est obligatoire ;
- l’âge doit être compris entre 12 et 30 ans ;
- la classe est obligatoire ;
- la série peut être facultative pour la Seconde ;
- un seul profil principal est nécessaire dans le MVP ;
- le profil reste modifiable dans les paramètres.

## 5.6 Critères d’acceptation

- le profil est enregistré après fermeture de l’application ;
- l’utilisateur arrive sur l’accueil à la prochaine ouverture ;
- les informations saisies sont réutilisées dans les messages personnalisés.

---

# 6. Module 2 — Accueil

## 6.1 Objectif

Présenter immédiatement à l’élève la prochaine action utile.

## 6.2 Contenu

- message personnalisé ;
- série de jours de révision ;
- recommandation principale ;
- durée estimée ;
- liste courte des matières ;
- progression par matière ;
- bouton d’ajout de cours ;
- navigation principale.

## 6.3 Fonctionnalités

- afficher le prénom de l’utilisateur ;
- afficher la dernière activité ;
- afficher le prochain cours recommandé ;
- ouvrir une séance depuis la recommandation ;
- ouvrir une matière ;
- ouvrir la liste complète des cours ;
- lancer l’ajout d’un nouveau cours ;
- afficher un état vide si aucun cours n’existe.

## 6.4 Règles métier

La recommandation prioritaire doit être calculée selon :

1. notions à renforcer ;
2. séance interrompue ;
3. cours non révisé récemment ;
4. cours récemment ajouté ;
5. activité par défaut.

## 6.5 Critères d’acceptation

- l’écran ne reste jamais vide ;
- un utilisateur sans cours voit une invitation claire à ajouter son premier cours ;
- la recommandation redirige vers l’écran approprié.

---

# 7. Module 3 — Matières et cours

## 7.1 Objectif

Organiser les cours par matière et par chapitre.

## 7.2 Écrans concernés

- Mes cours
- Liste des chapitres
- Détail d’une matière

## 7.3 Fonctionnalités

- afficher toutes les matières ;
- filtrer par classe ;
- afficher les cours enregistrés ;
- afficher la progression ;
- afficher la notion principale à renforcer ;
- rechercher un cours ;
- trier par date, progression ou matière ;
- ouvrir un cours ;
- supprimer ou archiver un cours ;
- renommer un cours.

## 7.4 Règles métier

- une matière peut contenir plusieurs cours ;
- un cours appartient à une seule matière ;
- un cours possède une ou plusieurs pages ;
- la suppression doit demander confirmation ;
- la progression d’une matière est calculée à partir de ses cours.

## 7.5 Critères d’acceptation

- chaque cours apparaît dans la bonne matière ;
- la progression se met à jour après une séance ;
- les cours restent accessibles hors connexion.

---

# 8. Module 4 — Ajout et compilation des pages

## 8.1 Objectif

Permettre à l’élève d’ajouter plusieurs pages appartenant à un même cours.

## 8.2 Écrans concernés

- Choix de la matière
- Choix de la source
- Ajout de pages
- Prévisualisation
- Compilation

## 8.3 Sources acceptées

- appareil photo ;
- galerie ;
- fichier PDF ;
- images importées.

## 8.4 Fonctionnalités

- sélectionner une matière ;
- prendre une photo ;
- importer plusieurs images ;
- afficher les miniatures ;
- numéroter les pages ;
- réorganiser les pages ;
- supprimer une page ;
- remplacer une page ;
- tourner une page ;
- recadrer une page ;
- signaler une image floue ;
- compiler les pages ;
- enregistrer les fichiers localement.

## 8.5 Règles métier

- un cours doit contenir au moins une page ;
- l’ordre des pages doit être enregistré ;
- les photos originales doivent être conservées ;
- une version compressée peut être créée pour l’analyse ;
- la compilation nécessite une confirmation explicite ;
- les fichiers trop volumineux doivent être compressés.

## 8.6 Critères d’acceptation

- les pages restent dans le bon ordre après redémarrage ;
- l’utilisateur peut retirer une page avant compilation ;
- l’application ne perd pas les images si le traitement échoue.

---

# 9. Module 5 — Analyse du cours

## 9.1 Objectif

Extraire les informations importantes d’un cours importé.

## 9.2 Informations à extraire

- matière ;
- titre du chapitre ;
- niveau scolaire ;
- notions principales ;
- définitions ;
- formules ;
- exemples ;
- dates ;
- mots-clés ;
- structure générale du cours.

## 9.3 Fonctionnalités

- envoyer les pages au service IA ;
- recevoir une réponse structurée ;
- vérifier le format avec Zod ;
- afficher les informations détectées ;
- permettre la modification ;
- enregistrer l’analyse ;
- relancer l’analyse en cas d’échec ;
- conserver les données précédentes.

## 9.4 Format de sortie attendu

```json
{
  "subject": "Mathématiques",
  "title": "Fonctions du second degré",
  "level": "Terminale",
  "concepts": [
    {
      "name": "Sommet d’une parabole",
      "description": "Point le plus haut ou le plus bas de la parabole"
    }
  ],
  "definitions": [],
  "formulas": [],
  "examples": [],
  "summary": ""
}
```

## 9.5 Règles métier

- les données détectées ne sont jamais enregistrées définitivement sans validation ;
- l’élève peut corriger le titre et la matière ;
- les réponses invalides du modèle sont rejetées ;
- le cours reste accessible même si l’analyse échoue ;
- aucune donnée critique ne doit être inventée silencieusement.

## 9.6 Critères d’acceptation

- l’utilisateur peut confirmer ou modifier le résultat ;
- les données finales sont enregistrées dans SQLite ;
- une erreur IA ne bloque pas l’ajout du cours.

---

# 10. Module 6 — Détail du cours

## 10.1 Objectif

Centraliser toutes les informations d’un chapitre.

## 10.2 Éléments affichés

- matière ;
- titre ;
- nombre de pages ;
- dernière révision ;
- progression ;
- notions maîtrisées ;
- notions en progression ;
- notions à renforcer ;
- résumé ;
- exercices ;
- résultats.

## 10.3 Fonctionnalités

- consulter la fiche ;
- démarrer une révision ;
- faire des exercices ;
- voir les erreurs ;
- consulter les résultats ;
- renommer le cours ;
- supprimer ou archiver ;
- relancer l’analyse.

## 10.4 Critères d’acceptation

- les données du cours sont accessibles hors ligne ;
- la progression est cohérente avec les tentatives ;
- l’écran recommande une prochaine action.

---

# 11. Module 7 — Fiche de révision

## 11.1 Objectif

Créer une version courte et claire du cours.

## 11.2 Contenu

- résumé ;
- notions essentielles ;
- définitions ;
- formules ;
- exemples ;
- erreurs fréquentes ;
- points importants pour le baccalauréat.

## 11.3 Fonctionnalités

- générer une fiche ;
- afficher la fiche ;
- modifier une fiche ;
- régénérer une section ;
- marquer une notion comme comprise ;
- lancer des exercices depuis la fiche ;
- enregistrer la fiche localement.

## 11.4 Règles métier

- la fiche doit se baser uniquement sur le cours importé ;
- les formules doivent conserver leur notation ;
- les résumés doivent rester courts ;
- les contenus générés doivent être structurés.

## 11.5 Critères d’acceptation

- la fiche reste disponible après fermeture ;
- l’utilisateur peut accéder aux exercices depuis la fiche ;
- la fiche affiche clairement le titre et les notions.

---

# 12. Module 8 — Génération des exercices

## 12.1 Objectif

Créer des exercices adaptés au cours et au niveau de l’élève.

## 12.2 Types d’exercices MVP

- question à choix multiple ;
- réponse courte ;
- vrai ou faux ;
- exercice numérique simple ;
- question d’explication ;
- lecture de graphique.

## 12.3 Fonctionnalités

- générer une série initiale ;
- associer chaque exercice à une notion ;
- définir un niveau de difficulté ;
- enregistrer la réponse attendue ;
- générer une explication ;
- vérifier le format ;
- sauvegarder les exercices.

## 12.4 Structure d’un exercice

```json
{
  "type": "short_answer",
  "question": "Quelle est l’image de 2 ?",
  "expectedAnswer": "2",
  "conceptId": "lecture_graphique",
  "difficulty": 2,
  "hint": "Repère 2 sur l’axe horizontal.",
  "explanation": "Le point correspondant sur la courbe a pour ordonnée 2."
}
```

## 12.5 Règles métier

- chaque exercice doit cibler une notion ;
- la réponse correcte doit être stockée ;
- un exercice ne doit pas être présenté s’il est incomplet ;
- les exercices ciblés doivent dépendre des erreurs précédentes ;
- les résultats chiffrés doivent être vérifiés par du code lorsque possible.

## 12.6 Critères d’acceptation

- aucun exercice sans réponse attendue n’est affiché ;
- l’exercice est relié à une notion ;
- l’élève peut refaire une série.

---

# 13. Module 9 — Session d’exercice

## 13.1 Objectif

Proposer une expérience de révision simple et concentrée.

## 13.2 Fonctionnalités

- démarrer une session ;
- afficher un exercice à la fois ;
- afficher la progression ;
- saisir une réponse ;
- choisir une option ;
- demander un indice ;
- valider ;
- passer à la correction ;
- reprendre une session interrompue ;
- quitter avec confirmation.

## 13.3 Règles métier

- la réponse est enregistrée avant la correction ;
- l’indice ne doit pas révéler directement la réponse ;
- la session possède une date de début et de fin ;
- une session interrompue reste récupérable ;
- l’utilisateur ne peut pas valider une réponse vide lorsque la réponse est obligatoire.

## 13.4 Critères d’acceptation

- la progression est visible ;
- les réponses ne sont pas perdues ;
- une session peut être reprise.

---

# 14. Module 10 — Correction et explication

## 14.1 Objectif

Expliquer la réponse sans juger l’élève.

## 14.2 Fonctionnalités

- afficher si la réponse est correcte ;
- afficher la bonne réponse ;
- expliquer la méthode ;
- montrer un exemple ;
- identifier le type d’erreur ;
- proposer la question suivante ;
- proposer un exercice plus simple si nécessaire.

## 14.3 Types d’erreurs

- notion non comprise ;
- formule oubliée ;
- erreur de calcul ;
- mauvaise lecture de la consigne ;
- étape oubliée ;
- confusion entre deux concepts ;
- réponse incomplète.

## 14.4 Règles métier

- utiliser un langage positif ;
- ne pas afficher « Tu es mauvais » ;
- préférer « Cette notion demande encore de la pratique » ;
- la correction doit être enregistrée ;
- le type d’erreur doit alimenter la progression.

## 14.5 Critères d’acceptation

- chaque mauvaise réponse possède une explication ;
- la notion concernée est mise à jour ;
- la correction peut être consultée plus tard.

---

# 15. Module 11 — Analyse adaptative

## 15.1 Objectif

Adapter les exercices suivants aux difficultés de l’élève.

## 15.2 Fonctionnalités

- calculer un score par notion ;
- détecter les erreurs répétées ;
- ajuster la difficulté ;
- sélectionner les notions prioritaires ;
- générer des exercices ciblés ;
- proposer une prochaine séance.

## 15.3 Statuts d’une notion

- **non commencée** ;
- **à découvrir** ;
- **en progression** ;
- **à renforcer** ;
- **maîtrisée**.

## 15.4 Exemple de règle

```text
Si l’élève échoue deux fois sur la même notion :
- passer la notion en « À renforcer » ;
- proposer une explication plus simple ;
- générer deux exercices ciblés ;
- réduire temporairement la difficulté.
```

## 15.5 Critères d’acceptation

- les exercices ciblés correspondent à la notion faible ;
- la progression évolue après chaque session ;
- le statut est compréhensible par l’élève.

---

# 16. Module 12 — Résultats et progression

## 16.1 Objectif

Permettre à l’élève de suivre son évolution.

## 16.2 Fonctionnalités

- afficher la progression globale ;
- afficher la progression par matière ;
- afficher la progression par cours ;
- afficher les notions maîtrisées ;
- afficher les notions à renforcer ;
- afficher les dernières activités ;
- consulter les erreurs ;
- relancer une séance ciblée.

## 16.3 Calculs

La progression peut se baser sur :

- taux de réussite ;
- nombre de tentatives ;
- difficulté ;
- récence ;
- stabilité des résultats ;
- utilisation des indices.

## 16.4 Critères d’acceptation

- le calcul est déterministe ;
- l’IA ne choisit pas arbitrairement le pourcentage ;
- les résultats sont recalculés après chaque séance.

---

# 17. Module 13 — Rapport de séance

## 17.1 Objectif

Résumer la séance et indiquer la prochaine étape.

## 17.2 Contenu

- score ;
- nombre de réponses correctes ;
- durée ;
- point fort ;
- notion à renforcer ;
- progression ;
- recommandation suivante ;
- points gagnés éventuels.

## 17.3 Fonctionnalités

- générer le rapport ;
- continuer avec des exercices ciblés ;
- revenir à l’accueil ;
- consulter le détail des réponses ;
- enregistrer le rapport.

## 17.4 Critères d’acceptation

- le rapport ne montre pas uniquement une note ;
- il indique ce qui doit être travaillé ensuite ;
- il reste accessible dans l’historique.

---

# 18. Module 14 — Profil et paramètres

## 18.1 Objectif

Permettre à l’élève de modifier ses informations et préférences.

## 18.2 Fonctionnalités

- modifier le prénom ;
- modifier l’âge ;
- modifier la classe ;
- modifier la série ;
- choisir la langue ;
- consulter la progression globale ;
- consulter les objectifs ;
- consulter le temps d’étude ;
- gérer les paramètres ;
- supprimer les données ;
- réinitialiser l’application.

## 18.3 Critères d’acceptation

- les modifications sont sauvegardées ;
- la suppression des données demande confirmation ;
- l’utilisateur peut revenir à l’accueil.

---

# 19. Module 15 — Stockage local

## 19.1 Objectif

Garantir un fonctionnement local et durable.

## 19.2 Responsabilités

- créer la base SQLite ;
- gérer les migrations Drizzle ;
- enregistrer les profils ;
- enregistrer les cours ;
- enregistrer les pages ;
- enregistrer les exercices ;
- enregistrer les tentatives ;
- enregistrer les résultats ;
- enregistrer les sessions ;
- gérer les transactions ;
- supprimer les données liées proprement.

## 19.3 Règles techniques

- utiliser des identifiants UUID ;
- stocker les dates au format ISO ;
- utiliser des clés étrangères ;
- utiliser des transactions pour les opérations multiples ;
- ne pas stocker les images directement en BLOB ;
- stocker le chemin local du fichier ;
- prévoir les migrations dès le début.

---

# 20. Module 16 — Service IA

## 20.1 Objectif

Centraliser toutes les interactions avec Gemma et empêcher le reste de l’application de dépendre directement d’Ollama.

## 20.2 Fournisseur utilisé dans le MVP

Le fournisseur actif du MVP est :

```text
OllamaAIProvider
```

Ollama s’exécute sur un ordinateur connecté au même réseau local que le téléphone ou l’émulateur.

Le modèle par défaut est configuré par variable d’environnement :

```text
EXPO_PUBLIC_OLLAMA_MODEL=gemma4:e2b
```

Le nom du modèle ne doit pas être codé en dur dans les écrans ni dans les services métier.

## 20.3 Architecture remplaçable

```ts
export interface AIProvider {
  analyzeCourse(input: AnalyzeCourseInput): Promise<CourseAnalysisOutput>;
  generateRevisionSheet(input: RevisionSheetInput): Promise<RevisionSheetOutput>;
  generateExercises(input: ExerciseGenerationInput): Promise<ExerciseOutput[]>;
  explainAnswer(input: ExplainAnswerInput): Promise<CorrectionOutput>;
  classifyMistake(input: ClassifyMistakeInput): Promise<MistakeOutput>;
  generateSessionReport(input: SessionReportInput): Promise<SessionReportOutput>;
}
```

Implémentation du MVP :

```text
AIProvider
└── OllamaAIProvider
```

Implémentations futures possibles :

```text
AIProvider
├── OllamaAIProvider
├── CloudAIProvider
└── GemmaOfflineProvider
```

## 20.4 Endpoint Ollama

L’endpoint principal utilisé est :

```text
POST /api/chat
```

Exemple d’URL :

```text
http://192.168.1.25:11434/api/chat
```

Corps minimal :

```json
{
  "model": "gemma4:e2b",
  "messages": [],
  "stream": false,
  "format": "json",
  "keep_alive": "30m",
  "options": {
    "temperature": 0.2
  }
}
```

## 20.5 Sous-services

- analyse des pages ;
- extraction des notions ;
- création du résumé ;
- génération des exercices ;
- génération des indices ;
- explication des erreurs ;
- classification des erreurs ;
- génération du rapport ;
- génération des recommandations.

## 20.6 Envoi des images

Les chemins locaux du téléphone ne sont pas lisibles directement par Ollama.

L’application doit :

1. sélectionner ou photographier l’image ;
2. compresser l’image ;
3. lire le fichier en base64 ;
4. envoyer la chaîne base64 dans le champ `images` du message ;
5. supprimer les données temporaires inutiles après traitement.

Exemple conceptuel :

```ts
const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
  encoding: FileSystem.EncodingType.Base64,
});

await ollamaProvider.chat([
  {
    role: "user",
    content: prompt,
    images: [imageBase64],
  },
]);
```

## 20.7 Stratégie d’analyse de plusieurs pages

Pour limiter la mémoire, la taille des requêtes et les erreurs :

```text
Page 1 → compression → analyse
Page 2 → compression → analyse
Page 3 → compression → analyse
Page 4 → compression → analyse
                    ↓
Fusion des analyses textuelles
                    ↓
Validation utilisateur
                    ↓
Fiche de révision et exercices
```

Les pages ne doivent pas être envoyées toutes ensemble par défaut.

## 20.8 Sorties structurées

Chaque appel IA doit demander un JSON strict.

Les réponses doivent être :

1. récupérées comme texte ;
2. converties en objet ;
3. validées avec Zod ;
4. rejetées si elles ne respectent pas le schéma ;
5. éventuellement régénérées avec un prompt de correction ;
6. enregistrées seulement après validation.

Exemple :

```ts
const CourseAnalysisSchema = z.object({
  subject: z.string(),
  title: z.string(),
  level: z.string().nullable(),
  concepts: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    }),
  ),
  definitions: z.array(z.string()),
  formulas: z.array(z.string()),
  summary: z.string(),
});
```

## 20.9 Configuration recommandée par tâche

| Tâche | Température recommandée |
|---|---:|
| Extraction de cours | 0.1 |
| Classification d’erreur | 0.1 |
| Génération de fiche | 0.2 |
| Génération d’exercices | 0.3 |
| Explication pédagogique | 0.3 |
| Rapport de séance | 0.2 |

## 20.10 Règles métier

- le fournisseur IA doit être remplaçable ;
- les réponses doivent être validées avec Zod ;
- aucune réponse libre ne doit être directement enregistrée ;
- les prompts doivent demander du JSON strict ;
- les erreurs doivent avoir des valeurs de repli ;
- les appels doivent être journalisés localement en mode développement ;
- aucune clé secrète ne doit être stockée dans l’application pour Ollama local ;
- l’URL Ollama doit être configurable ;
- l’application doit détecter si Ollama est indisponible ;
- les données déjà générées restent accessibles si Ollama est hors ligne ;
- le modèle ne calcule pas directement les scores et pourcentages de progression ;
- les scores doivent être calculés par le code métier.

## 20.11 Sécurité

L’API locale Ollama ne doit pas être exposée sur Internet.

Pour le MVP :

- accès limité au réseau local ;
- aucun transfert vers un serveur public non prévu ;
- pas de port ouvert sur le routeur ;
- avertissement si l’URL configurée n’est pas locale ;
- possibilité d’effacer les images temporaires après analyse.

## 20.12 Critères d’acceptation

- l’application peut tester la disponibilité d’Ollama ;
- une page peut être envoyée et analysée ;
- la réponse est validée avec Zod ;
- une erreur réseau affiche une action de nouvelle tentative ;
- le cours reste enregistré même si l’analyse échoue ;
- le changement d’URL ou de modèle ne nécessite pas de modifier les écrans ;
- les données déjà générées sont consultables sans Ollama ;
- l’application fonctionne avec un téléphone physique et avec un émulateur Android.
# 21. Module 17 — Gestion des erreurs

## 21.1 États à gérer

- image floue ;
- image illisible ;
- fichier trop volumineux ;
- PDF invalide ;
- absence de connexion au réseau local ;
- PC Ollama non joignable ;
- service Ollama arrêté ;
- modèle Gemma non installé ;
- délai d’attente dépassé ;
- erreur du modèle ;
- réponse JSON invalide ;
- base indisponible ;
- espace local insuffisant ;
- session interrompue ;
- cours sans notion détectée.

## 21.2 Comportement attendu

Chaque erreur doit afficher :

- un titre court ;
- une explication simple ;
- une action principale ;
- une action secondaire si nécessaire.

## 21.3 Exemple

```text
Cette page est difficile à lire.

Reprends la photo avec plus de lumière ou continue avec cette page.

[Reprendre la photo]
[Continuer quand même]
```

---

# 22. Module 18 — Design system et composants partagés

## 22.1 Objectif

Garantir la cohérence visuelle.

## 22.2 Couleurs principales

| Rôle | Couleur |
|---|---|
| Fond | `#FFF7E8` |
| Surface | `#FFFDF8` |
| Primaire | `#D94B24` |
| Secondaire | `#2E7D70` |
| Accent | `#F2B84B` |
| Texte principal | `#2F241F` |
| Bordure | `#E8D9C7` |

## 22.3 Typographie

- Nunito Sans ;
- corps principal minimum 16 px ;
- titres larges et lisibles ;
- boutons en graisse 700.

## 22.4 Composants à créer

- `AppButton`
- `AppInput`
- `AppHeader`
- `BottomNavigation`
- `SubjectCard`
- `CourseCard`
- `RecommendationCard`
- `ProgressBar`
- `ProgressCircle`
- `StatusBadge`
- `CoursePageThumbnail`
- `ExerciseCard`
- `HintButton`
- `CorrectionPanel`
- `SessionReportCard`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `ConfirmDialog`

## 22.5 Règles

- une seule action principale par écran ;
- rayons de 16 à 20 px ;
- ombres douces ;
- motif malagasy discret ;
- jamais de design enfantin ;
- icônes de la même famille ;
- aucune information uniquement indiquée par une couleur.

---

# 23. Modèles de données

## 23.1 UserProfile

### Description

Représente le profil local de l’élève.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant UUID |
| displayName | text | Prénom ou pseudonyme |
| age | integer | Âge |
| grade | text | Seconde, Première ou Terminale |
| series | text nullable | Série scolaire |
| preferredLanguage | text | Français, Malagasy ou bilingue |
| schoolName | text nullable | Établissement |
| createdAt | text | Date de création |
| updatedAt | text | Date de modification |

### Fonctionnalités associées

- création du profil ;
- personnalisation de l’accueil ;
- filtrage du contenu ;
- adaptation du niveau des exercices.

---

## 23.2 Subject

### Description

Représente une matière scolaire.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| name | text | Nom de la matière |
| slug | text | Identifiant lisible |
| icon | text | Nom de l’icône |
| color | text | Couleur associée |
| isDefault | integer | Matière par défaut |
| createdAt | text | Date de création |

### Fonctionnalités associées

- organisation des cours ;
- filtre ;
- progression par matière ;
- couleur et icône.

---

## 23.3 Course

### Description

Représente un chapitre ou un ensemble cohérent de pages.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| userId | text | Profil propriétaire |
| subjectId | text | Matière |
| title | text | Titre du cours |
| grade | text | Niveau scolaire |
| status | text | draft, processing, ready, archived |
| summary | text nullable | Résumé |
| pageCount | integer | Nombre de pages |
| lastReviewedAt | text nullable | Dernière révision |
| createdAt | text | Date de création |
| updatedAt | text | Date de modification |

### Fonctionnalités associées

- consultation ;
- renommage ;
- archivage ;
- génération de fiche ;
- démarrage de séance.

---

## 23.4 CoursePage

### Description

Représente une image ou une page importée.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours parent |
| localUri | text | Chemin local |
| thumbnailUri | text nullable | Miniature |
| pageIndex | integer | Ordre |
| rotation | integer | Rotation |
| qualityStatus | text | good, blurry, unreadable |
| createdAt | text | Date |

### Fonctionnalités associées

- affichage de la miniature ;
- réorganisation ;
- suppression ;
- rotation ;
- analyse.

---

## 23.5 CourseAnalysis

### Description

Stocke le résultat structuré de l’analyse IA.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours |
| detectedTitle | text | Titre détecté |
| detectedSubject | text | Matière détectée |
| detectedLevel | text nullable | Niveau |
| rawJson | text | JSON complet |
| confidence | real nullable | Confiance |
| validatedByUser | integer | Confirmation utilisateur |
| createdAt | text | Date |

### Fonctionnalités associées

- vérification ;
- correction ;
- traçabilité ;
- relance de l’analyse.

---

## 23.6 Concept

### Description

Représente une notion pédagogique.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours |
| name | text | Nom |
| description | text nullable | Description |
| orderIndex | integer | Ordre |
| createdAt | text | Date |

### Fonctionnalités associées

- génération d’exercices ;
- progression ;
- recommandations ;
- rapports.

---

## 23.7 RevisionSheet

### Description

Représente la fiche de révision générée.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours |
| title | text | Titre |
| summary | text | Résumé |
| contentJson | text | Sections structurées |
| version | integer | Version |
| createdAt | text | Date |
| updatedAt | text | Date |

### Fonctionnalités associées

- affichage ;
- modification ;
- régénération ;
- lancement d’exercices.

---

## 23.8 Exercise

### Description

Représente un exercice.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours |
| conceptId | text | Notion |
| type | text | QCM, réponse courte, etc. |
| question | text | Énoncé |
| expectedAnswer | text | Réponse attendue |
| optionsJson | text nullable | Options |
| hint | text nullable | Indice |
| explanation | text | Explication |
| difficulty | integer | Niveau 1 à 5 |
| generatedFromWeakness | integer | Exercice ciblé |
| createdAt | text | Date |

### Fonctionnalités associées

- session ;
- correction ;
- adaptation ;
- historique.

---

## 23.9 ExerciseAttempt

### Description

Représente une réponse donnée par l’élève.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| exerciseId | text | Exercice |
| sessionId | text | Session |
| userAnswer | text | Réponse |
| isCorrect | integer | Correct ou non |
| usedHint | integer | Indice utilisé |
| mistakeType | text nullable | Type d’erreur |
| responseTimeMs | integer nullable | Temps de réponse |
| createdAt | text | Date |

### Fonctionnalités associées

- calcul du score ;
- analyse d’erreur ;
- historique ;
- progression.

---

## 23.10 StudySession

### Description

Représente une séance de révision.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| courseId | text | Cours |
| type | text | initial, targeted, retry |
| status | text | active, completed, abandoned |
| currentExerciseIndex | integer | Position |
| startedAt | text | Début |
| completedAt | text nullable | Fin |
| durationSeconds | integer | Durée |
| createdAt | text | Date |

### Fonctionnalités associées

- reprise ;
- navigation entre les exercices ;
- rapport ;
- historique.

---

## 23.11 ConceptProgress

### Description

Stocke la progression de l’élève sur une notion.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| userId | text | Élève |
| conceptId | text | Notion |
| score | real | Score 0 à 100 |
| status | text | Statut |
| attemptsCount | integer | Tentatives |
| correctCount | integer | Réussites |
| lastPracticedAt | text nullable | Dernière pratique |
| updatedAt | text | Date |

### Fonctionnalités associées

- progression ;
- détection des difficultés ;
- recommandation ;
- exercices ciblés.

---

## 23.12 SessionReport

### Description

Représente le bilan d’une séance.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| sessionId | text | Session |
| score | real | Score |
| correctAnswers | integer | Réponses correctes |
| totalAnswers | integer | Total |
| strongConceptId | text nullable | Point fort |
| weakConceptId | text nullable | Point à renforcer |
| summary | text | Résumé |
| recommendation | text | Prochaine action |
| createdAt | text | Date |

### Fonctionnalités associées

- rapport final ;
- historique ;
- recommandation.

---

## 23.13 Recommendation

### Description

Représente une action proposée à l’élève.

### Champs

| Champ | Type | Description |
|---|---|---|
| id | text | Identifiant |
| userId | text | Élève |
| courseId | text nullable | Cours |
| conceptId | text nullable | Notion |
| type | text | resume, targeted, new_course |
| title | text | Titre |
| description | text | Explication |
| estimatedMinutes | integer | Durée |
| priority | integer | Priorité |
| completedAt | text nullable | Réalisation |
| createdAt | text | Date |

### Fonctionnalités associées

- carte d’accueil ;
- prochaine séance ;
- reprise d’activité.

---

## 23.14 AppSetting

### Description

Stocke les préférences générales.

### Champs

| Champ | Type | Description |
|---|---|---|
| key | text | Clé unique |
| value | text | Valeur |
| updatedAt | text | Date |

### Exemples

- thème ;
- langue ;
- onboarding terminé ;
- mode économie de données ;
- dernier écran ouvert.

---

# 24. Relations principales

```text
UserProfile
  └── Course
        ├── CoursePage
        ├── CourseAnalysis
        ├── Concept
        │     └── ConceptProgress
        ├── RevisionSheet
        ├── Exercise
        │     └── ExerciseAttempt
        └── StudySession
              └── SessionReport
```

---

# 25. Navigation

## 25.1 Navigation principale

- Accueil
- Mes cours
- Profil

## 25.2 Parcours d’ajout

```text
Accueil
→ Choisir une matière
→ Choisir une source
→ Ajouter les pages
→ Compiler
→ Traitement
→ Vérifier le cours
→ Enregistrer
→ Détail du cours
```

## 25.3 Parcours de révision

```text
Accueil ou Détail du cours
→ Fiche de révision
→ Exercices
→ Correction
→ Exercice suivant
→ Rapport de séance
→ Exercices ciblés ou Accueil
```

---

# 26. Structure de dossiers proposée

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── onboarding/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── courses.tsx
│   │   └── profile.tsx
│   ├── course/
│   │   ├── add/
│   │   └── [courseId]/
│   ├── session/
│   │   └── [sessionId]/
│   └── report/
├── components/
│   ├── ui/
│   ├── course/
│   ├── exercise/
│   ├── progress/
│   └── shared/
├── db/
│   ├── client.ts
│   ├── schema.ts
│   ├── migrations/
│   └── repositories/
├── services/
│   ├── ai/
│   ├── image/
│   ├── course/
│   ├── exercise/
│   └── progress/
├── stores/
├── hooks/
├── schemas/
├── types/
├── constants/
├── theme/
└── utils/
```

---

# 27. Repositories Drizzle recommandés

- `userRepository`
- `subjectRepository`
- `courseRepository`
- `coursePageRepository`
- `courseAnalysisRepository`
- `conceptRepository`
- `revisionSheetRepository`
- `exerciseRepository`
- `attemptRepository`
- `sessionRepository`
- `progressRepository`
- `reportRepository`
- `recommendationRepository`

Chaque repository doit contenir uniquement les opérations de données.

---

# 28. Exigences non fonctionnelles

## 28.1 Performance

- ouverture de l’accueil en moins de 2 secondes ;
- navigation fluide ;
- miniatures optimisées ;
- compression des images avant envoi à Ollama ;
- analyse des pages une par une ;
- indicateur de progression pendant les appels IA ;
- délai d’attente configurable ;
- possibilité d’annuler ou de relancer une analyse ;
- chargement différé des images ;
- requêtes SQLite indexées ;
- listes rendues avec `FlatList`.

## 28.2 Fiabilité

- reprise après fermeture ;
- transactions pour compilation et suppression ;
- sauvegarde avant appel IA ;
- aucune perte d’image en cas d’erreur.

## 28.3 Accessibilité

- zones tactiles de 44 × 44 px minimum ;
- texte principal de 16 px minimum ;
- contraste suffisant ;
- libellés visibles ;
- statut accompagné d’un texte ;
- compatibilité lecteur d’écran pour les actions importantes.

## 28.4 Confidentialité

- profil et progression stockés localement ;
- information claire avant l’envoi d’images vers le PC exécutant Ollama ;
- les images ne doivent être envoyées qu’à l’URL configurée ;
- suppression des fichiers temporaires après analyse lorsque possible ;
- possibilité de supprimer toutes les données ;
- absence de publicité dans le MVP ;
- aucune publication automatique ;
- aucune exposition publique du port Ollama.

## 28.5 Compatibilité

- Android prioritaire ;
- iOS compatible via Expo ;
- écrans de petite taille pris en charge ;
- fonctionnement portrait prioritaire.

---

# 29. Stratégie de tests

## 29.1 Tests unitaires

- calcul de progression ;
- détermination du statut d’une notion ;
- validation Zod ;
- recommandations ;
- ordre des pages ;
- score de session.

## 29.2 Tests de composants

- bouton principal ;
- carte de cours ;
- sélecteur de classe ;
- formulaire onboarding ;
- exercice ;
- correction ;
- rapport.

## 29.3 Tests d’intégration

- création de profil ;
- ajout d’un cours ;
- compilation ;
- sauvegarde ;
- démarrage de session ;
- enregistrement d’une tentative ;
- génération d’un rapport.

## 29.4 Tests manuels prioritaires

- fermeture pendant une session ;
- photos floues ;
- absence de connexion ;
- erreur IA ;
- base vide ;
- suppression d’un cours ;
- redémarrage après onboarding.

---

# 30. Priorités de développement

## Priorité P0 — Indispensable

- onboarding ;
- profil local ;
- accueil ;
- matières ;
- ajout de plusieurs images ;
- compilation ;
- cours ;
- fiche ;
- exercices ;
- correction ;
- progression ;
- rapport ;
- SQLite ;
- navigation.

## Priorité P1 — Importante

- vérification de la qualité des images ;
- reprise de séance ;
- exercices ciblés ;
- recommandations ;
- résultat par notion ;
- états d’erreur complets.

## Priorité P2 — Après le MVP

- PDF ;
- traduction malagasy avancée ;
- partage hors ligne ;
- notifications ;
- synchronisation ;
- espace enseignant ;
- contenu validé par programme scolaire.

---

# 31. Critères de réussite du MVP

Le MVP est considéré comme fonctionnel si un utilisateur peut :

1. créer son profil ;
2. ajouter quatre photos d’un cours ;
3. modifier l’ordre des pages ;
4. compiler le cours ;
5. confirmer le titre ;
6. consulter une fiche ;
7. répondre à plusieurs exercices ;
8. recevoir une correction ;
9. voir une notion à renforcer ;
10. recevoir deux exercices ciblés ;
11. terminer une séance ;
12. consulter un rapport ;
13. fermer et rouvrir l’application sans perdre ses données ;
14. connecter l’application à Ollama sur le réseau local ;
15. afficher un message utile si le PC ou Ollama est indisponible ;
16. continuer à consulter les cours déjà générés sans connexion à Ollama.

---

# 32. Définition de terminé

Une fonctionnalité est terminée lorsque :

- l’interface est conforme au design system ;
- le comportement nominal fonctionne ;
- les erreurs sont gérées ;
- les données sont sauvegardées ;
- les types TypeScript sont définis ;
- les entrées sont validées ;
- les tests essentiels passent ;
- l’écran fonctionne sur Android ;
- l’accessibilité minimale est respectée ;
- aucune donnée temporaire n’est codée en dur dans la version finale.

---

# 33. Livrables attendus

- projet React Native Expo ;
- code TypeScript ;
- navigation Expo Router ;
- schéma Drizzle ;
- migrations SQLite ;
- composants Gluestack ;
- styles NativeWind ;
- interface `AIProvider` ;
- implémentation `OllamaAIProvider` ;
- fichier `.env.example` ;
- script ou documentation de configuration Ollama ;
- données de démonstration ;
- tests principaux ;
- README d’installation ;
- documentation de l’architecture ;
- APK ou build Expo de démonstration.

---

# 34. Configuration de développement Ollama

## 34.1 Préparation du PC

Le développeur doit :

1. installer Ollama ;
2. télécharger le modèle configuré ;
3. autoriser l’écoute sur le réseau local ;
4. redémarrer le service ;
5. récupérer l’adresse IP locale ;
6. vérifier l’accès à `/api/tags`.

Exemple :

```bash
ollama pull gemma4:e2b
curl http://localhost:11434/api/tags
hostname -I
```

## 34.2 Configuration de l’application

Créer un fichier `.env` à partir de `.env.example` :

```env
EXPO_PUBLIC_AI_PROVIDER=ollama
EXPO_PUBLIC_OLLAMA_BASE_URL=http://192.168.1.25:11434
EXPO_PUBLIC_OLLAMA_MODEL=gemma4:e2b
```

## 34.3 Vérification au démarrage

En mode développement, l’application doit proposer un test de connexion :

```text
Serveur IA : disponible
Modèle : gemma4:e2b
Adresse : 192.168.1.25:11434
```

En cas d’échec :

```text
Mianatra ne parvient pas à joindre le moteur de révision.

Vérifie que :
- le PC et le téléphone utilisent le même Wi-Fi ;
- Ollama est démarré ;
- l’adresse IP est correcte ;
- le modèle est installé.
```

## 34.4 Évolution future

Après le MVP, `OllamaAIProvider` pourra être remplacé ou complété par :

- un fournisseur cloud sécurisé ;
- un serveur backend intermédiaire ;
- un modèle Gemma embarqué sur Android ;
- une sélection automatique selon les capacités de l’appareil.

La logique fonctionnelle, les écrans et les modèles de données ne doivent pas dépendre du fournisseur utilisé.

---

# 35. Résumé du parcours central

```text
L’élève crée son profil
        ↓
Il ajoute plusieurs photos de son cours
        ↓
Mianatra compile et analyse le contenu
        ↓
L’élève vérifie les informations
        ↓
Mianatra génère une fiche et des exercices
        ↓
L’élève répond
        ↓
Mianatra corrige et identifie les difficultés
        ↓
L’application génère des exercices ciblés
        ↓
L’élève reçoit un rapport et une prochaine recommandation
```
