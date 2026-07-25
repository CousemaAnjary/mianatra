import { Redirect } from "expo-router";

export default function Index() {
  /**
   * ! STATE (état, données) de l'application
   */
  const isSignedIn = true;

  /**
   * ! COMPORTEMENT (méthodes, fonctions) de l'application
   */
  if (isSignedIn) {
    return <Redirect href={"/(tabs)"} />;
  }

  /**
   * ! AFFICHAGE (render) de l'application
   */
  return <Redirect href={"/(tabs)"} />;
}