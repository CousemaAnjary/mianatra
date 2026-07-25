import { StyleSheet, View } from "react-native";
import {
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
  StatusBadge,
} from "@/src/components/shared";
import { demoProfile, demoSession } from "@/src/data/demo-data";
import { spacing } from "@/src/theme";

export default function ProfileScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Profil" subtitle="Informations de démonstration" />
      <AppCard style={styles.card}>
        <AppText variant="heading">{demoProfile.firstName}</AppText>
        <View style={styles.row}>
          <StatusBadge label={`${demoProfile.age} ans`} tone="progress" />
          <StatusBadge label={demoProfile.grade} tone="success" />
          <StatusBadge label={demoProfile.language} tone="warning" />
        </View>
        <AppText tone="secondary">{demoSession.strength}</AppText>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
});
