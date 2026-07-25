# Mianatra AIProvider serveur

Ce module met en place uniquement l'infrastructure serveur de generation IA.
Il ne branche pas encore l'application Expo, les ecrans, les hooks, ni les
pipelines metier d'analyse de cours.

## Fournisseur

Gemma 4 est consomme via la Gemini API avec le SDK officiel `@google/genai`.
Le provider concret est `Gemma4ApiProvider` et utilise l'API:

```ts
client.models.generateContent(...)
```

Le modele par defaut est `gemma-4-26b-a4b-it`.
Le seul modele alternatif autorise est `gemma-4-31b-it`.

## Variables serveur

Copier `server/.env.example` vers `server/.env` pour une verification manuelle
cote serveur:

```env
GEMINI_API_KEY=replace-with-server-side-key
GEMMA_MODEL=gemma-4-26b-a4b-it
GEMMA_TIMEOUT_MS=120000
GEMMA_MAX_OUTPUT_TOKENS=8192
```

La cle se cree dans Google AI Studio. Elle ne doit jamais etre placee dans
`EXPO_PUBLIC_*`, `app.json`, le bundle Expo ou les captures.

Variables publiques explicitement interdites:

- prefixe public Expo + `GEMINI_API_KEY`;
- prefixe public Expo + `GOOGLE_API_KEY`;
- prefixe public Expo + `GEMMA_API_KEY`.

## Architecture

Le lot implemente uniquement:

```text
AIService -> AIProvider -> Gemma4ApiProvider -> Gemini API
```

Le futur mobile devra appeler un backend securise via HTTP. Ce client HTTP et
le proxy ne sont pas fournis dans ce lot.

## AIProvider

`AIProvider` expose uniquement une abstraction technique:

- `getStatus`
- `generateText`
- `generateFromImage`

Il n'expose pas d'operation metier comme `analyzeCourse`,
`generateExercises`, `generateRevisionSheet`, `classifyMistake` ou
`generateReport`.

## AIService

`AIService` est une facade injectable. Les tests peuvent fournir
`FakeAIProvider`; la production serveur fournit `Gemma4ApiProvider`.

La generation structuree suit ce flux:

1. appel du provider;
2. extraction prudente du JSON;
3. `JSON.parse`;
4. validation locale Zod;
5. retour type.

Le code ne fait pas de cast du resultat parse en type attendu.

## Image base64

`generateFromImage` attend une image deja preparee:

- `imageBase64` sans prefixe data URL;
- `mimeType` parmi `image/jpeg`, `image/png`, `image/webp`.

Le provider ne lit pas de fichier Expo, ne recoit pas d'URI `file://`, ne
redimensionne pas, ne compresse pas et ne persiste pas l'image.

## Timeout et annulation

Le SDK `@google/genai@2.13.0` supporte `abortSignal` et `httpOptions.timeout`
dans `generateContent` et `models.list`. Le provider transmet les deux.

Limite documentee par les types du SDK: `AbortSignal` annule l'operation cote
client, mais ne garantit pas l'annulation du traitement deja parti cote service
distant.

## Logs

Les logs techniques acceptent seulement:

- requestId;
- operation;
- provider;
- modele;
- duree;
- succes/echec;
- code erreur.

Ils excluent cle API, prompt complet, base64, reponse complete, donnees
personnelles et contenu de cours.

## Verification manuelle

La commande suivante n'est pas appelee par les tests automatiques:

```bash
npm run gemma:check
```

Elle charge la configuration serveur, verifie le provider, verifie la presence
du modele configure et affiche uniquement provider, modele, disponibilite,
latence et resultat. Ajouter `-- --generate` pour une generation courte.

Tester manuellement:

1. creer `server/.env`;
2. ajouter `GEMINI_API_KEY`;
3. choisir `GEMMA_MODEL`;
4. lancer `npm run gemma:check`;
5. tester un modele absent;
6. tester une cle invalide;
7. tester un timeout tres bas;
8. verifier que la cle n'apparait pas dans `dist` apres export Expo.

## Limites du lot

Non realise volontairement:

- analyse complete de cours;
- boucle page par page;
- fusion multi-page;
- generation de fiches;
- generation d'exercices;
- correction pedagogique;
- classification metier des erreurs;
- generation des rapports;
- persistance SQLite de resultats IA;
- hooks React;
- integration ecrans;
- proxy HTTP mobile;
- deploiement backend.
