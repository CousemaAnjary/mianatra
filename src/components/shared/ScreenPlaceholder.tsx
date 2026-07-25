import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, spacing } from "@/src/theme";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppScreen } from "./AppScreen";
import { AppText } from "./AppText";
import { ScreenHeader } from "./ScreenHeader";

type ScreenPlaceholderProps = {
  title: string;
  description: string;
  showBack?: boolean;
};

export function ScreenPlaceholder({
  title,
  description,
  showBack = true,
}: ScreenPlaceholderProps) {
  return (
    <AppScreen>
      <ScreenHeader title={title} showBack={showBack} />
      <View style={styles.content}>
        <AppCard style={styles.card}>
          <AppText variant="subtitle">{title}</AppText>
          <AppText tone="secondary">{description}</AppText>
          {showBack ? (
            <AppButton
              title="Retour"
              iconName="arrow-left"
              variant="secondary"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            />
          ) : null}
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    gap: spacing[4],
    backgroundColor: colors.surface,
  },
});
