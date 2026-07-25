import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function TabLayout() {
  /**
   * ! STATE (état, données) de l'application
   */

  /**
   * ! COMPORTEMENT (méthodes, fonctions) de l'application
   */

  /**
   * ! AFFICHAGE (render) de l'application
   */
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8B1F34",
        tabBarInactiveTintColor: "#2A1A14",
        tabBarStyle: {
          backgroundColor: "#FBF6EE",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="info-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}