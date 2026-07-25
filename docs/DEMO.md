# Démonstration Mianatra

Durée cible : 3 à 5 minutes.

## Préparation

Lancer l'application :

```bash
npx expo start --clear --port 8099 --host localhost
```

Sur web, ouvrir `http://localhost:8099`. Sur mobile, scanner le QR code avec Expo Go ou ouvrir l'émulateur Android.

## Script

1. Ouvrir l'onboarding.
   Résultat attendu : le motif lamba, l'illustration et le formulaire s'affichent.

2. Présenter le compte Fara.
   Saisir `Fara`, `17`, sélectionner `2nde`, puis toucher `Commencer`.

3. Montrer l'accueil.
   Résultat attendu : message Bonjour Fara, recommandation de révision, trois cartes de cours et onglets.

4. Toucher `Voir tout`.
   Résultat attendu : écran Mes cours avec les filtres Tous, 2nde, 1ère et Tale.

5. Toucher `Ajouter un cours`.
   Résultat attendu : quatre pages de démonstration sont visibles.

6. Réorganiser ou supprimer/restaurer une page.
   Résultat attendu : les pages sont renumérotées et le bouton compiler reste cohérent.

7. Toucher `Compiler les pages`, puis confirmer.
   Résultat attendu : ouverture du détail Fonctions du second degré.

8. Toucher `Ma fiche` ou `Réviser le cours`.
   Résultat attendu : fiche de révision avec quatre sections, graphique et formule.

9. Toucher `Faire des exercices`.
   Résultat attendu : première question de la session, progression 1 sur 5 et champ de réponse.

10. Donner une mauvaise réponse, par exemple `0`, puis toucher `Valider ma réponse`.
    Résultat attendu : correction lisible, réponse attendue et méthode.

11. Continuer jusqu'au rapport.
    Résultat attendu : score calculé localement, point fort, notion à renforcer et accès aux exercices ciblés.

12. Toucher `Faire une série ciblée`.
    Résultat attendu : série courte marquée comme ciblée.

13. Revenir au rapport ou aux résultats, puis ouvrir le profil depuis l'onglet.
    Résultat attendu : avatar, progression 58 %, statistiques et menu.

## Solutions de secours

- Si le navigateur web échoue, utiliser Expo Go ou l'émulateur Android.
- Si Node signale une incompatibilité, utiliser Node `>=22.16.0`.
- Si une correction est ouverte directement, revenir à l'exercice et valider une réponse avant de poursuivre.
