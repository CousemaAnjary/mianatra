# Mianatra — Design System

## 1. Présentation du produit

**Mianatra Tout Cours** est une application mobile éducative destinée aux lycéens malagasy, de la classe de **Seconde à la Terminale**.

Son objectif est d’aider les élèves à préparer le baccalauréat à partir de leurs propres cours.

L’élève peut :

* photographier plusieurs pages de son cahier ;
* importer un cours ;
* compiler les pages en un seul chapitre ;
* obtenir une fiche de révision ;
* réaliser des exercices personnalisés ;
* recevoir des indices et des explications ;
* identifier les notions maîtrisées et celles à renforcer ;
* suivre sa progression.

L’application doit placer l’élève au centre de l’expérience.

---

# 2. Vision du design

## Concept

**Chaleur studieuse**

L’interface doit donner l’impression d’un espace personnel dans lequel l’élève peut apprendre calmement, progresser à son rythme et se sentir encouragé.

Le design doit être :

* chaleureux ;
* accueillant ;
* calme ;
* moderne ;
* simple ;
* motivant ;
* légèrement ludique ;
* adapté aux adolescents ;
* culturellement pertinent pour Madagascar ;
* jamais enfantin.

## Sentiment recherché

L’utilisateur doit ressentir :

> « Cette application comprend mes difficultés et m’aide sans me juger. »

## Mots-clés visuels

* cahier ;
* papier ;
* chaleur ;
* concentration ;
* progression ;
* confiance ;
* jeunesse ;
* accompagnement ;
* culture malagasy contemporaine ;
* apprentissage personnalisé.

---

# 3. Principes UX

## 3.1 L’élève avant la technologie

Ne pas mettre en avant l’intelligence artificielle.

Éviter les formulations comme :

* « Analyse par IA » ;
* « Génération intelligente » ;
* « Modèle multimodal ».

Préférer :

* « Mianatra prépare ton cours » ;
* « Voici ce que tu peux renforcer » ;
* « Essayons avec un exemple plus simple ».

## 3.2 Une action principale par écran

Chaque écran doit avoir un seul bouton principal clairement visible.

Exemples :

* **Commencer**
* **Ajouter mon cours**
* **Compiler les pages**
* **Commencer ma révision**
* **Valider ma réponse**
* **Continuer**

## 3.3 Progression plutôt que performance

Éviter les termes :

* échec ;
* mauvais ;
* faible ;
* nul ;
* insuffisant.

Utiliser :

* maîtrisé ;
* en progression ;
* à renforcer ;
* à revoir ;
* pas encore acquis.

## 3.4 Réduire les choix

L’application doit recommander la prochaine action au lieu d’afficher trop d’options.

Exemple :

> « Reprenons les fonctions pendant 10 minutes. »

## 3.5 Encourager sans infantiliser

Les messages doivent être positifs, mais sobres.

Bon exemple :

> « Tu maîtrises bien les équations simples. Travaillons maintenant les fractions. »

Mauvais exemple :

> « Super champion ! Tu as gagné 500 étoiles magiques ! »

---

# 4. Palette de couleurs

## 4.1 Couleurs principales

### Primary — Terracotta

```text
Primary 50:  #FFF1EB
Primary 100: #FCDDD0
Primary 200: #F8BBA4
Primary 300: #EF9070
Primary 400: #E46B47
Primary 500: #D94B24
Primary 600: #C43E1C
Primary 700: #A83219
Primary 800: #882A1A
Primary 900: #70261B
```

Couleur principale recommandée :

```text
Primary: #D94B24
```

Utilisations :

* boutons principaux ;
* navigation active ;
* appels à l’action ;
* progression importante ;
* liens actifs ;
* icônes principales.

### Secondary — Vert ravinala

```text
Secondary 50:  #EDF7F4
Secondary 100: #D3EBE4
Secondary 200: #A8D7CB
Secondary 300: #76BEAE
Secondary 400: #4B9F91
Secondary 500: #2E7D70
Secondary 600: #24675D
Secondary 700: #20534C
Secondary 800: #1D433E
Secondary 900: #193834
```

Couleur secondaire recommandée :

```text
Secondary: #2E7D70
```

Utilisations :

* compétences maîtrisées ;
* barres de progression ;
* confirmations ;
* cours terminés ;
* éléments rassurants.

### Accent — Soleil doré

```text
Accent 50:  #FFF9E8
Accent 100: #FFF0C2
Accent 200: #FFE08A
Accent 300: #F7C95A
Accent 400: #F2B84B
Accent 500: #E89E25
Accent 600: #CF7D17
Accent 700: #AC5B17
Accent 800: #8C461A
Accent 900: #743A19
```

Couleur d’accent recommandée :

```text
Accent: #F2B84B
```

Utilisations :

* indices ;
* séries de révision ;
* badges ;
* progression intermédiaire ;
* encouragements ;
* éléments ludiques secondaires.

---

## 4.2 Couleurs neutres

```text
Background:       #FFF7E8
Surface:          #FFFDF8
Surface Soft:     #FAF1E2
Surface Elevated: #FFFFFF

Text Primary:     #2F241F
Text Secondary:   #6E5D53
Text Muted:       #9B887B
Text Disabled:    #BFAFA4

Border:           #E8D9C7
Border Strong:    #D5C1AB
Divider:          #EFE3D4
```

## 4.3 Couleurs sémantiques

### Succès

```text
Success:          #2E7D70
Success Surface:  #E8F5F1
Success Border:   #B7DDD4
```

Libellé pédagogique :

> Maîtrisé

### Progression

```text
Progress:         #F2B84B
Progress Surface: #FFF6DA
Progress Border:  #F7D981
```

Libellé pédagogique :

> En progression

### À renforcer

```text
Needs Work:         #D94B24
Needs Work Surface: #FFF0EA
Needs Work Border:  #F2B29B
```

Libellé pédagogique :

> À renforcer

### Information

```text
Info:         #427E9E
Info Surface: #ECF5F9
Info Border:  #BDDCE9
```

### Erreur système

```text
Error:         #B53434
Error Surface: #FCEDED
Error Border:  #EABBBB
```

La couleur d’erreur système est réservée aux problèmes techniques :

* fichier non lisible ;
* absence de connexion ;
* champ obligatoire ;
* import impossible.

Elle ne doit pas servir à représenter les difficultés scolaires de l’élève.

---

# 5. Règles d’utilisation des couleurs

## Répartition recommandée

* 65 % de crème, ivoire et surfaces neutres ;
* 20 % de terracotta ;
* 10 % de vert ;
* 5 % de jaune et d’éléments décoratifs.

## Règles

* Ne jamais utiliser le jaune avec du texte blanc.
* Utiliser du texte brun foncé sur le jaune.
* Éviter les fonds terracotta sur de grandes surfaces.
* Réserver le terracotta aux actions importantes.
* Ne pas utiliser uniquement la couleur pour transmettre une information.
* Accompagner chaque statut d’un texte ou d’une icône.

Exemple :

```text
● Maîtrisé
● En progression
● À renforcer
```

---

# 6. Typographie

## Police principale

**Nunito Sans**

Utiliser cette police pour :

* les titres ;
* les boutons ;
* les paragraphes ;
* les formulaires ;
* les exercices ;
* les statistiques.

Fallback :

```css
font-family: "Nunito Sans", "Inter", Arial, sans-serif;
```

## Hiérarchie typographique

### Display

```text
Taille : 32 px
Hauteur de ligne : 40 px
Graisse : 800
```

Utilisation :

* nom de l’application ;
* message principal d’onboarding.

### Heading 1

```text
Taille : 28 px
Hauteur de ligne : 36 px
Graisse : 800
```

Utilisation :

* titre principal d’écran.

### Heading 2

```text
Taille : 24 px
Hauteur de ligne : 32 px
Graisse : 700
```

### Heading 3

```text
Taille : 20 px
Hauteur de ligne : 28 px
Graisse : 700
```

### Title

```text
Taille : 18 px
Hauteur de ligne : 26 px
Graisse : 700
```

Utilisation :

* titres des cartes ;
* titre d’un cours ;
* question d’exercice.

### Body Large

```text
Taille : 17 px
Hauteur de ligne : 26 px
Graisse : 500
```

### Body

```text
Taille : 16 px
Hauteur de ligne : 24 px
Graisse : 400
```

### Body Small

```text
Taille : 14 px
Hauteur de ligne : 20 px
Graisse : 500
```

### Caption

```text
Taille : 12 px
Hauteur de ligne : 16 px
Graisse : 600
```

### Button

```text
Taille : 16 px
Hauteur de ligne : 20 px
Graisse : 700
```

## Règles typographiques

* Ne pas écrire de longues phrases entièrement en majuscules.
* Limiter la largeur des paragraphes.
* Utiliser au minimum 16 px pour les consignes importantes.
* Utiliser une graisse de 600 ou 700 pour les actions.
* Garder une hauteur de ligne généreuse.
* Ne pas utiliser plus de quatre niveaux hiérarchiques sur un même écran.

---

# 7. Espacement

Utiliser une grille basée sur **4 px**.

```text
Space 1:  4 px
Space 2:  8 px
Space 3:  12 px
Space 4:  16 px
Space 5:  20 px
Space 6:  24 px
Space 8:  32 px
Space 10: 40 px
Space 12: 48 px
Space 16: 64 px
```

## Marges principales

```text
Marge mobile horizontale : 20 px
Marge de section : 24 à 32 px
Espacement entre cartes : 12 à 16 px
Padding d’une carte : 16 à 20 px
```

---

# 8. Rayons des angles

```text
Radius Small:  8 px
Radius Medium: 12 px
Radius Large:  16 px
Radius XL:     20 px
Radius XXL:    28 px
Radius Pill:   999 px
```

Utilisations :

* champs : 12 px ;
* boutons : 14 à 16 px ;
* cartes : 18 à 20 px ;
* grandes illustrations : 24 à 28 px ;
* badges : forme pilule.

---

# 9. Ombres

Les ombres doivent être légères et chaleureuses.

## Ombre carte

```css
box-shadow: 0 4px 14px rgba(89, 56, 36, 0.08);
```

## Ombre élément élevé

```css
box-shadow: 0 8px 24px rgba(89, 56, 36, 0.12);
```

## Règles

* Ne pas utiliser d’ombre noire forte.
* Ne pas mettre d’ombre sur tous les composants.
* Combiner une bordure légère et une ombre douce.
* Réserver les ombres aux cartes principales et aux modales.

---

# 10. Iconographie

## Style

Utiliser des icônes :

* simples ;
* arrondies ;
* linéaires ;
* avec une épaisseur régulière ;
* faciles à identifier ;
* sans trop de détails.

Style recommandé :

* Lucide Icons ;
* Material Symbols Rounded ;
* Phosphor Icons Rounded.

## Taille

```text
Small:  16 px
Medium: 20 px
Large:  24 px
XL:     32 px
```

## Icônes principales

```text
Accueil          : maison
Mes cours        : livre ouvert
Profil           : utilisateur
Ajouter          : plus
Photographier    : appareil photo
Importer         : image ou fichier
Réviser          : cartes ou livre
Exercices        : crayon
Résultats        : graphique
Indice           : ampoule
Progression      : cible ou tendance
Matière          : icône spécifique
Notification     : cloche
Retour           : flèche gauche
Suivant          : flèche droite
```

---

# 11. Illustrations

## Style recommandé

Illustrations 2D éditoriales :

* formes douces ;
* contours discrets ;
* palette chaude ;
* personnages adolescents ;
* proportions naturelles ;
* vêtements contemporains ;
* décors simples ;
* peu de détails ;
* arrière-plans crème.

## Représentation

Les illustrations doivent représenter :

* des lycéennes et lycéens malagasy ;
* différents teints de peau ;
* différents types de cheveux ;
* des vêtements modernes et quotidiens ;
* des cahiers, téléphones, sacs et calculatrices ;
* des situations de travail individuel ou en groupe.

## À éviter

* apparence enfantine ;
* têtes disproportionnées ;
* mascottes animales centrales ;
* baobabs ou lémuriens sur tous les écrans ;
* clichés ruraux systématiques ;
* illustrations génériques occidentales ;
* confettis excessifs.

---

# 12. Motifs culturels

S’inspirer subtilement des motifs géométriques du **lamba malagasy**.

## Utilisations possibles

* bande décorative sur l’onboarding ;
* détail en bas d’une carte ;
* écran de chargement ;
* motif discret dans une illustration ;
* séparateur entre deux sections ;
* encadrement d’un badge spécial.

## Règles

* Ne jamais utiliser un motif complexe derrière un texte.
* Ne pas dépasser 10 % de la surface d’un écran.
* Garder des couleurs cohérentes avec la palette.
* Utiliser les motifs comme signature, pas comme décoration permanente.

---

# 13. Composants

## 13.1 Bouton principal

### Style

```text
Hauteur : 54 px
Fond : Primary 500
Texte : blanc
Rayon : 16 px
Padding horizontal : 20 px
Police : 16 px / 700
Icône optionnelle : 20 px
```

### États

```text
Default : Primary 500
Pressed : Primary 700
Disabled : Primary 200
Loading : Primary 500 avec indicateur
```

### Exemples

* Commencer
* Continuer ma révision
* Compiler les pages
* Enregistrer le cours
* Valider ma réponse

---

## 13.2 Bouton secondaire

```text
Hauteur : 52 px
Fond : transparent ou Surface
Bordure : Primary 300
Texte : Primary 600
Rayon : 16 px
```

Exemples :

* Voir ma fiche
* Faire des exercices
* Voir mes erreurs

---

## 13.3 Bouton tertiaire

```text
Fond : transparent
Texte : Text Secondary ou Primary 600
Pas de bordure
```

Exemples :

* Plus tard
* Voir tout
* Ignorer
* Modifier

---

## 13.4 Bouton d’indice

```text
Fond : Accent 50
Bordure : Accent 200
Texte : Text Primary
Icône : ampoule Accent 600
Hauteur : 50 px
Rayon : 14 px
```

Libellé :

> Donne-moi un indice

---

## 13.5 Champ de formulaire

```text
Hauteur minimale : 54 px
Fond : Surface
Bordure : Border Strong
Rayon : 12 px
Padding : 16 px
Texte : Text Primary
Placeholder : Text Muted
```

### Focus

```text
Bordure : Primary 500
Contour externe : Primary 100
```

### Erreur

```text
Bordure : Error
Message : Error
```

---

## 13.6 Sélecteur de classe

Présenter les choix dans des boutons segmentés.

```text
2nde | 1ère | Terminale
```

### Sélectionné

```text
Fond : Primary 500
Texte : blanc
```

### Non sélectionné

```text
Fond : Surface
Bordure : Border
Texte : Text Primary
```

---

## 13.7 Carte de cours

### Contenu

* icône de la matière ;
* nom de la matière ;
* nombre de chapitres ;
* progression ;
* notion à renforcer ;
* chevron facultatif.

### Style

```text
Fond : Surface
Bordure : Border
Rayon : 18 px
Padding : 16 px
Ombre légère
```

### Exemple

```text
Mathématiques
4 chapitres                         62 %

████████████░░░░░

À renforcer : fonctions
```

---

## 13.8 Carte de recommandation

Cette carte doit être le premier élément important de l’accueil.

### Style

```text
Fond : Accent 100 ou dégradé chaud très léger
Bordure : Accent 200
Rayon : 20 px
Padding : 20 px
```

### Contenu

* petit libellé « Pour toi » ou « À faire maintenant » ;
* matière ;
* chapitre ;
* raison de la recommandation ;
* durée estimée ;
* bouton principal.

---

## 13.9 Barre de progression

```text
Hauteur : 8 à 10 px
Fond : Surface Soft
Progression : Secondary 500
Rayon : Pill
```

Pour « à renforcer », ne pas remplacer toute la barre par du rouge. La barre représente une progression globale.

---

## 13.10 Badge

```text
Hauteur : 28 à 32 px
Padding horizontal : 10 px
Rayon : Pill
Police : 12 ou 14 px / 700
```

Exemples :

* 4 jours de suite
* Maîtrisé
* En progression
* À renforcer
* 10 minutes

---

## 13.11 Miniature de page

Pour l’ajout de cours :

```text
Ratio : 3:4
Rayon : 12 px
Bordure : Border
Numéro de page dans un badge
Bouton supprimer en haut à droite
```

États :

* normal ;
* sélectionné ;
* flou ;
* en cours d’analyse ;
* erreur.

---

## 13.12 Navigation inférieure

Trois entrées seulement :

```text
Accueil
Mes cours
Profil
```

### Style

```text
Hauteur : 72 à 80 px
Fond : Surface
Bordure supérieure : Divider
Icône : 22 px
Libellé : 12 px / 600
```

### État actif

```text
Icône et texte : Primary 500
```

### État inactif

```text
Icône et texte : Text Secondary
```

---

# 14. Matières et couleurs

Les matières peuvent utiliser une couleur secondaire dans leur icône, mais les cartes restent neutres.

```text
Mathématiques       : #2E7D70
Physique-Chimie     : #E89E25
Histoire-Géographie : #9A5A32
Français            : #7356A8
Malagasy            : #C45E46
SVT                 : #4E8B57
Philosophie         : #536A8A
Anglais             : #427E9E
```

Ne pas utiliser ces couleurs comme grands fonds. Les utiliser pour :

* les icônes ;
* les petits badges ;
* les traits décoratifs ;
* les repères visuels.

---

# 15. Ton rédactionnel

## Personnalité

Mianatra parle comme un accompagnateur :

* calme ;
* positif ;
* direct ;
* respectueux ;
* encourageant ;
* jamais autoritaire ;
* jamais trop familier.

## Exemples

### Accueil

> Bonjour Fara 👋
> Prête pour une petite révision ?

### Recommandation

> Reprenons les fonctions pendant 10 minutes.

### Réponse correcte

> Exact. Tu as bien identifié l’image de 2.

### Réponse incorrecte

> Pas encore. Regarde d’abord la valeur sur l’axe horizontal.

### Difficulté répétée

> Cette notion semble encore difficile. Essayons avec un exemple plus simple.

### Fin de séance

> Tu progresses bien sur la lecture des graphiques.

### Point à renforcer

> Les antécédents demandent encore un peu de pratique.

---

# 16. Animations

Les animations doivent être rapides et discrètes.

## Durées

```text
Micro-interaction : 150 ms
Transition : 250 ms
Carte ou panneau : 300 ms
Animation de réussite : maximum 600 ms
```

## Animations recommandées

* remplissage progressif d’une barre ;
* apparition douce d’un message ;
* légère vibration visuelle en cas d’erreur système ;
* check animé après l’import d’une page ;
* progression circulaire ;
* changement fluide entre deux exercices.

## À éviter

* confettis à chaque réponse ;
* animations qui bloquent l’utilisateur ;
* mascotte constamment animée ;
* sons automatiques ;
* transitions supérieures à une seconde.

---

# 17. Accessibilité

* Contraste minimum de 4,5:1 pour les textes normaux.
* Zone tactile minimale de 44 × 44 px.
* Texte principal d’au moins 16 px.
* Les statuts doivent comporter un texte et pas seulement une couleur.
* Les icônes importantes doivent avoir un libellé.
* Les paragraphes doivent être courts.
* Les consignes doivent être divisées en étapes.
* Prévoir un mode texte agrandi dans une version future.
* Ne pas utiliser de texte sur des motifs complexes.
* Permettre de reprendre une séance interrompue.
* Ne pas imposer une limite de temps pour répondre.

---

# 18. Écrans principaux à générer

## Écran 1 — Onboarding

Contenu :

* motif malagasy discret en haut ;
* logo Mianatra Tout Cours ;
* illustration de deux lycéens ;
* prénom ;
* âge ;
* classe ;
* progression de l’onboarding ;
* bouton Suivant.

## Écran 2 — Accueil

Contenu :

* message personnalisé ;
* série de révision ;
* carte de recommandation ;
* liste de trois matières ;
* progression par matière ;
* bouton Ajouter un cours ;
* navigation inférieure.

## Écran 3 — Ajouter un cours

Contenu :

* étape actuelle ;
* titre ;
* plusieurs miniatures de pages ;
* possibilité de réorganiser ;
* ajouter une page ;
* compiler les pages ;
* signalement d’une image floue.

## Écran 4 — Détail du cours

Contenu :

* matière ;
* titre du chapitre ;
* progression circulaire ;
* notions maîtrisées ;
* notions en progression ;
* notions à renforcer ;
* onglets fiche, exercices, résultats ;
* boutons Réviser, Faire des exercices, Voir mes erreurs.

## Écran 5 — Exercice

Contenu :

* progression de la séance ;
* titre de la notion ;
* consigne ;
* graphique, formule ou image ;
* champ de réponse ;
* bouton indice ;
* bouton validation ;
* décoration culturelle discrète.

## Écran 6 — Rapport de séance

Contenu :

* score ;
* progrès ;
* point fort ;
* point à renforcer ;
* recommandation suivante ;
* bouton continuer ;
* bouton retour à l’accueil.

---

# 19. Design tokens

```json
{
  "color": {
    "primary": {
      "50": "#FFF1EB",
      "100": "#FCDDD0",
      "200": "#F8BBA4",
      "300": "#EF9070",
      "400": "#E46B47",
      "500": "#D94B24",
      "600": "#C43E1C",
      "700": "#A83219",
      "800": "#882A1A",
      "900": "#70261B"
    },
    "secondary": {
      "50": "#EDF7F4",
      "100": "#D3EBE4",
      "200": "#A8D7CB",
      "300": "#76BEAE",
      "400": "#4B9F91",
      "500": "#2E7D70",
      "600": "#24675D",
      "700": "#20534C",
      "800": "#1D433E",
      "900": "#193834"
    },
    "accent": {
      "50": "#FFF9E8",
      "100": "#FFF0C2",
      "200": "#FFE08A",
      "300": "#F7C95A",
      "400": "#F2B84B",
      "500": "#E89E25",
      "600": "#CF7D17"
    },
    "background": "#FFF7E8",
    "surface": "#FFFDF8",
    "surfaceSoft": "#FAF1E2",
    "textPrimary": "#2F241F",
    "textSecondary": "#6E5D53",
    "textMuted": "#9B887B",
    "border": "#E8D9C7",
    "success": "#2E7D70",
    "progress": "#F2B84B",
    "needsWork": "#D94B24",
    "error": "#B53434"
  },
  "spacing": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64
  },
  "radius": {
    "small": 8,
    "medium": 12,
    "large": 16,
    "xl": 20,
    "xxl": 28,
    "pill": 999
  },
  "typography": {
    "fontFamily": "Nunito Sans",
    "display": {
      "fontSize": 32,
      "lineHeight": 40,
      "fontWeight": 800
    },
    "heading1": {
      "fontSize": 28,
      "lineHeight": 36,
      "fontWeight": 800
    },
    "heading2": {
      "fontSize": 24,
      "lineHeight": 32,
      "fontWeight": 700
    },
    "heading3": {
      "fontSize": 20,
      "lineHeight": 28,
      "fontWeight": 700
    },
    "title": {
      "fontSize": 18,
      "lineHeight": 26,
      "fontWeight": 700
    },
    "body": {
      "fontSize": 16,
      "lineHeight": 24,
      "fontWeight": 400
    },
    "bodySmall": {
      "fontSize": 14,
      "lineHeight": 20,
      "fontWeight": 500
    },
    "caption": {
      "fontSize": 12,
      "lineHeight": 16,
      "fontWeight": 600
    },
    "button": {
      "fontSize": 16,
      "lineHeight": 20,
      "fontWeight": 700
    }
  }
}
```

---

# 20. Prompt principal pour Stitch AI

Create a polished mobile application design system and high-fidelity UI for an educational application named “Mianatra Tout Cours”.

The application is designed for Malagasy high-school students from Seconde to Terminale who are preparing for the baccalaureate.

The central experience is student-focused. Students photograph or upload multiple pages of their handwritten courses, compile them into a chapter, receive revision summaries, complete personalized exercises, identify concepts they have mastered or need to reinforce, and follow their progress.

Use a “warm study” visual direction.

The interface must feel warm, calm, comfortable, motivating, modern and slightly playful, but never childish.

Use a warm cream background #FFF7E8, off-white cards #FFFDF8, terracotta primary color #D94B24, deep ravinala green #2E7D70, soft golden yellow #F2B84B and dark cocoa text #2F241F.

Use Nunito Sans with rounded and highly readable typography. Titles should be bold, friendly and modern. Body text should be at least 16 px.

Use large rounded cards, 18 to 20 px corner radius, subtle warm shadows, generous white space and clear visual hierarchy.

Use subtle geometric patterns inspired by Malagasy lamba textiles as small decorative accents only. Do not place patterns behind text and do not use cultural clichés such as lemurs or baobabs everywhere.

Represent modern Malagasy teenagers with natural proportions, contemporary clothing, notebooks, phones, backpacks and calculators. Use warm editorial 2D illustrations.

The application should feel appropriate for students aged approximately 15 to 20.

Use encouraging language. Replace negative labels such as “weakness” or “failed” with:

* Mastered
* In progress
* To reinforce

Do not emphasize artificial intelligence. Present the application as a calm learning companion.

Each screen must have one clear primary action.

Create the following screens:

1. Onboarding and profile setup:

* Mianatra Tout Cours logo
* subtle Malagasy textile pattern
* illustration of two Malagasy high-school students
* first name field
* age field
* class selector: Seconde, Première, Terminale
* onboarding progress
* primary Next button

2. Home dashboard:

* personalized greeting
* study streak
* recommended revision card
* subject name and chapter
* reason for recommendation
* estimated duration
* main Continue revision button
* list of saved subjects with progress bars
* Add a course button
* bottom navigation with Home, My courses and Profile

3. Add a course:

* step indicator
* subject selection
* multiple photographed notebook-page thumbnails
* page numbers
* delete, crop, rotate and reorder options
* image quality warning for blurry pages
* Add another page button
* Compile pages primary button

4. Course detail:

* subject and chapter title
* number of pages
* last revision date
* circular chapter progress indicator
* mastered, in progress and to reinforce concepts
* tabs for Revision sheet, Exercises and Results
* buttons for Revise course, Do exercises and View mistakes

5. Exercise session:

* progress indicator such as question 2 of 5
* chapter and skill name
* question or graph
* answer field
* Hint button with soft yellow styling
* Validate answer primary button
* calm, distraction-free layout

6. Session report:

* session completed state
* number of correct answers
* strength
* concept to reinforce
* next recommended activity
* Continue training button
* Return home secondary button

Use semantic colors:

* green for mastered
* golden yellow for in progress
* terracotta for to reinforce
* red only for technical errors

Avoid:

* childish mascots
* excessive gamification
* bright neon colors
* overly dense screens
* large dark backgrounds
* generic Western stock-student imagery
* excessive confetti
* complicated charts
* too many navigation items

The final result should look like a premium, professional, accessible and culturally grounded mobile education product created for Madagascar.

