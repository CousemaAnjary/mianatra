# Mianatra - spec
## Positionnement

**Mianatra Tout Cours** est une application de révision destinée uniquement aux lycéens malagasy, de la **Seconde à la Terminale**.

L’application transforme les photos des cours de l’élève en :

* fiches de révision ;
* exercices personnalisés ;
* explications simples ;
* suivi des points forts et des difficultés ;
* séances adaptées à son niveau ;
* préparation progressive au baccalauréat.

L’élève est au centre de l’application. Il ne doit pas chercher longtemps quoi faire : l’application lui montre directement la prochaine action utile.

---

# Structure minimale de l’application

Le premier MVP peut fonctionner avec seulement **cinq écrans principaux**.

## Écran 1 — Bienvenue et profil

### Objectif

Faire connaissance avec l’élève et personnaliser l’expérience dès la première ouverture.

L’application ne lui demande pas ce qu’il souhaite faire. Elle comprend automatiquement que son objectif est de progresser et de préparer le baccalauréat.

### Informations demandées

* prénom ou pseudonyme ;
* âge ;
* classe ;
* série, lorsque cela est nécessaire ;
* langue préférée.

### Exemple

**Bienvenue sur Mianatra 👋**

> Faisons connaissance pour préparer tes révisions.

Champs :

```text
Comment veux-tu qu’on t’appelle ?
[ Fara ]

Quel âge as-tu ?
[ 17 ans ]

Quelle est ta classe ?
[ Seconde ] [ Première ] [ Terminale ]

Quelle est ta série ?
[ A ] [ C ] [ D ] [ L ] [ S ] [ Autre ]

Langue des explications
[ Français ] [ Malagasy ] [ Français + Malagasy ]
```

Bouton principal :

> **Commencer**

### Remarques UX

* Une seule question visible à la fois.
* Barre de progression courte : `1 sur 4`.
* Grandes zones cliquables.
* Possibilité de choisir un pseudonyme.
* Les questions sur la série s’affichent seulement lorsque cela est utile.
* Le ton reste amical, mais pas enfantin.

---

## Écran 2 — Accueil et liste des cours

Cet écran devient le véritable centre de l’application.

Il regroupe :

* les cours enregistrés ;
* la prochaine révision recommandée ;
* la progression ;
* les matières à renforcer ;
* l’accès rapide pour ajouter un cours.

### En-tête personnalisé

```text
Bonjour Fara 👋
Prête pour une petite révision ?
```

L’application peut adapter le message :

```text
Il te reste 10 minutes ?
Reprenons les fonctions.
```

### Bloc principal : prochaine action

L’application recommande directement une action utile.

```text
À faire maintenant

Mathématiques
Fonctions du second degré

Tu avais rencontré des difficultés
sur la lecture des graphiques.

Durée estimée : 10 minutes
```

Bouton :

> **Continuer ma révision**

L’élève n’a donc pas besoin de choisir lui-même parmi trop d’options.

### Section « Mes cours »

Les cours apparaissent sous forme de cartes simples.

```text
Mathématiques
4 chapitres • Progression : 62 %
À renforcer : fonctions

Physique-Chimie
3 chapitres • Progression : 48 %
À renforcer : électricité

Histoire-Géographie
2 chapitres • Progression : 75 %
À renforcer : dates importantes
```

Chaque carte contient :

* le nom de la matière ;
* le nombre de chapitres ;
* une petite barre de progression ;
* le principal point à renforcer ;
* la dernière date de révision.

### Bouton principal

Un bouton fixe reste visible en bas de l’écran :

> **＋ Ajouter un cours**

### Cas du premier lancement

Lorsque l’élève n’a encore ajouté aucun cours :

```text
Ajoute ton premier cours

Prends en photo les pages de ton cahier.
Mianatra les transformera en révision.
```

Bouton :

> **Photographier mon premier cours**

---

## Écran 3 — Ajouter un cours

### Objectif

Permettre à l’élève de photographier plusieurs pages d’un même cours, de les organiser et de les envoyer ensemble.

Cette fonctionnalité est essentielle, car un chapitre peut contenir plusieurs pages de cahier.

### Étape 1 : choisir la matière

```text
Dans quelle matière se trouve ce cours ?
```

L’application propose d’abord les matières déjà utilisées :

* Mathématiques ;
* Physique-Chimie ;
* Français ;
* Malagasy ;
* Histoire-Géographie ;
* Philosophie ;
* Sciences de la vie et de la Terre ;
* autres matières.

L’élève peut aussi créer une nouvelle matière.

### Étape 2 : ajouter les pages

L’élève peut :

* prendre une photo ;
* ajouter une image depuis la galerie ;
* importer un fichier PDF ;
* ajouter plusieurs pages à la suite.

L’écran affiche les photos sous forme de miniatures :

```text
Page 1    Page 2    Page 3
  ✓         ✓         ✓
```

Actions disponibles :

* ajouter une page ;
* supprimer une page ;
* refaire une photo ;
* recadrer ;
* tourner l’image ;
* modifier l’ordre des pages.

Bouton principal :

> **Ajouter une autre page**

Lorsque toutes les pages sont présentes :

> **Compiler les pages**

### Vérifications automatiques

Avant de continuer, l’application signale les problèmes simples :

```text
La page 2 semble floue.
Veux-tu reprendre la photo ?
```

ou :

```text
La page 3 semble être à l’envers.
```

L’élève peut corriger ou continuer.

### Étape 3 : vérifier le cours détecté

Après l’analyse, l’application affiche :

```text
Matière détectée
Mathématiques

Titre détecté
Fonctions du second degré

Nombre de pages
4

Notions principales
- représentation graphique ;
- sommet d’une parabole ;
- variations ;
- équation du second degré.
```

L’élève peut modifier le titre si nécessaire.

Bouton :

> **Enregistrer le cours**

### Écran de traitement

Le message doit rester simple :

```text
Mianatra prépare ton cours…

✓ Pages regroupées
✓ Notions principales détectées
✓ Fiche de révision préparée
✓ Premiers exercices créés
```

---

## Écran 4 — Détail d’un cours

Cet écran s’ouvre lorsqu’un élève sélectionne une matière ou un chapitre.

### Partie supérieure

```text
Mathématiques

Fonctions du second degré
4 pages de cours
Dernière révision : hier
```

### Progression du chapitre

```text
Progression : 62 %

Maîtrisé
- reconnaître une fonction ;
- calculer une image.

En progression
- déterminer le sommet.

À renforcer
- lire une courbe ;
- résoudre graphiquement.
```

Le vocabulaire doit rester positif.

Éviter :

> « Faiblesses »

Préférer :

> « À renforcer »

### Actions principales

Seulement trois actions sont nécessaires :

> **Réviser le cours**

> **Faire des exercices**

> **Voir mes erreurs**

### Contenu du cours

L’application peut afficher trois onglets simples :

#### Ma fiche

Résumé court des notions importantes.

#### Mes exercices

Exercices disponibles et état d’avancement.

#### Mes résultats

Progression, erreurs fréquentes et recommandations.

Il ne faut pas créer trois écrans séparés. Ces informations peuvent rester dans le même écran.

### Action recommandée

L’application met toujours une action en avant :

```text
Recommandation pour toi

Refais deux exercices sur la lecture
des graphiques avant de continuer.
```

Bouton :

> **Commencer**

---

## Écran 5 — Session de révision

C’est l’écran principal d’apprentissage.

### Début de séance

```text
Révision ciblée

Mathématiques
Lecture d’un graphique

5 questions
Environ 8 minutes
```

Bouton :

> **Démarrer**

### Présentation des exercices

Un seul exercice apparaît à la fois.

```text
Question 2 sur 5

Observe le graphique.
Quelle est l’image de 2 ?
```

L’élève peut :

* saisir une réponse ;
* choisir une proposition ;
* ajouter une photo de son calcul ;
* demander un indice.

Boutons :

> **Donne-moi un indice**

> **Valider ma réponse**

### Après une mauvaise réponse

L’application ne donne pas immédiatement toute la solution.

Elle suit plusieurs niveaux :

1. rappeler la notion ;
2. donner un indice ;
3. montrer une première étape ;
4. expliquer la solution.

Exemple :

```text
Pas encore, mais ton raisonnement commence bien.

Sur l’axe horizontal, cherche la valeur 2.
Puis regarde la valeur correspondante
sur l’axe vertical.
```

### Adaptation automatique

Si l’élève répète la même erreur, l’application propose un exercice plus simple.

```text
Cette notion semble encore difficile.
Essayons avec un exemple plus simple.
```

Si l’élève réussit facilement :

```text
Très bien.
Passons à un exercice de niveau supérieur.
```

---

# Fin de séance

Il n’est pas nécessaire de créer un sixième écran permanent.

Le rapport peut apparaître à la fin de la session sous forme de résumé.

```text
Séance terminée 🎯

4 réponses correctes sur 5

Point fort
Tu lis correctement les coordonnées
sur un graphique.

À renforcer
Tu confonds encore parfois l’image
et l’antécédent.

Prochaine étape
Deux exercices ciblés demain.
```

Boutons :

> **Continuer avec 2 exercices**

> **Retour à mes cours**

Le résultat est ensuite enregistré automatiquement sur l’écran d’accueil.

---

# Navigation minimale

La barre de navigation peut contenir seulement trois éléments :

```text
Accueil    Mes cours    Profil
```

Le bouton **Ajouter un cours** reste accessible depuis l’accueil et la liste des cours.

Il n’est pas nécessaire d’ajouter immédiatement :

* un onglet calendrier ;
* un onglet statistiques ;
* un onglet chatbot ;
* un onglet communauté ;
* un onglet classement.

---

# Fonctionnalités essentielles du MVP

## À développer

1. Création du profil.
2. Liste des cours enregistrés.
3. Ajout de plusieurs photos pour un cours.
4. Réorganisation et compilation des pages.
5. Détection de la matière et du chapitre.
6. Génération d’une fiche courte.
7. Génération d’exercices.
8. Correction et explication.
9. Détection des points maîtrisés et à renforcer.
10. Génération d’exercices ciblés.
11. Rapport simple après chaque séance.
12. Sauvegarde de la progression.

## À garder pour plus tard

* préparation automatique d’un calendrier complet jusqu’au baccalauréat ;
* notifications ;
* espace parent ;
* espace professeur ;
* classement entre élèves ;
* messagerie ;
* groupes d’étude ;
* reconnaissance vocale complète ;
* toutes les matières simultanément ;
* examens blancs complets ;
* partage entre téléphones ;
* téléchargement de contenus communautaires.

---

# Direction visuelle

## Style général

L’application doit être :

* moderne ;
* légère ;
* dynamique ;
* rassurante ;
* adaptée aux adolescents ;
* ni trop scolaire, ni trop enfantine.

## Univers visuel

Éviter :

* les dessins trop enfantins ;
* les mascottes de maternelle ;
* les couleurs trop nombreuses ;
* les écrans remplis de texte ;
* les clichés visuels sur Madagascar.

Privilégier :

* cartes arrondies ;
* icônes simples ;
* illustrations abstraites ;
* photos ou formes inspirées de cahiers, surligneurs et feuilles ;
* petites animations lors des progrès ;
* graphiques très faciles à comprendre.

## Ludification légère

La motivation peut venir de :

* séries de jours de révision ;
* barre de progression ;
* objectifs personnels ;
* petites félicitations ;
* badges sobres ;
* évolution d’un niveau.

Exemples :

```text
3 jours de révision régulière
```

```text
Nouveau progrès :
Équations simples maîtrisées
```

Il ne faut pas transformer l’application en jeu complet. Le but principal reste la réussite scolaire.

---

# Principe central de l’expérience

À chaque ouverture, l’élève doit immédiatement comprendre :

1. où il en est ;
2. ce qu’il doit réviser ;
3. pourquoi cette révision est recommandée ;
4. combien de temps elle prendra ;
5. quels progrès il a déjà réalisés.

La page d’accueil ne doit donc pas seulement afficher des cours. Elle doit dire à l’élève :

> **Voici la prochaine petite action qui peut réellement t’aider à progresser.**

---

# Parcours utilisateur complet

```text
Création du profil
        ↓
Accueil personnalisé
        ↓
Ajout de plusieurs photos
        ↓
Compilation du cours
        ↓
Fiche de révision
        ↓
Exercices
        ↓
Analyse des erreurs
        ↓
Exercices ciblés
        ↓
Rapport de progression
        ↓
Nouvelle recommandation sur l’accueil
```

---

# Les cinq écrans retenus

## 1. Bienvenue et profil

Pour connaître l’élève et adapter les contenus.

## 2. Accueil et liste des cours

Pour afficher ses matières, ses progrès et sa prochaine révision.

## 3. Ajouter un cours

Pour photographier, importer, classer et compiler plusieurs pages.

## 4. Détail d’un cours

Pour consulter la fiche, les exercices et les points à renforcer.

## 5. Session de révision

Pour apprendre, répondre, recevoir des indices et progresser.

Cette structure est suffisante pour un premier MVP clair, cohérent et démontrable.

