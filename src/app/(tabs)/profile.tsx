import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Svg, { Circle } from "react-native-svg";
import { ProfileMenuRow } from "@/src/components/core";
import {
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import {
  demoProfile,
  demoProfileMenu,
  demoProfileStats,
  type DemoProfileMenuItem,
} from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export default function ProfileScreen() {
  function handleMenuPress(item: DemoProfileMenuItem) {
    if (item.action === "logout") {
      Alert.alert(
        "Déconnexion de démonstration",
        "Aucune donnée ne sera supprimée dans cette version.",
      );
      return;
    }

    Alert.alert(item.label, "Disponible prochainement");
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Profil" subtitle="Ton espace de progression" />

      <View style={styles.identity}>
        <View style={styles.avatarWrap}>
          <Image
            source={require("../../../assets/mianatra/illustration_student_reading.png")}
            accessibilityLabel="Avatar de Fara"
            accessibilityIgnoresInvertColors
            style={styles.avatar}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier le profil"
            style={styles.editButton}
            onPress={() => Alert.alert("Profil", "Disponible prochainement")}
          >
            <FontAwesome5 name="pencil-alt" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <AppText variant="title">{demoProfile.firstName}</AppText>
        <AppText variant="subtitle" tone="secondary">
          {`${demoProfile.age} ans • ${demoProfile.grade}`}
        </AppText>
      </View>

      <AppCard style={styles.progressCard}>
        <AppText variant="subtitle">Ma progression globale</AppText>
        <View style={styles.progressContent}>
          <View style={styles.ring}>
            <Svg width={118} height={118} viewBox="0 0 118 118" accessibilityLabel="Progression globale 58 pour cent">
              <Circle cx="59" cy="59" r="46" stroke={colors.surfaceSoft} strokeWidth="10" fill="none" />
              <Circle
                cx="59"
                cy="59"
                r="46"
                stroke={colors.secondary}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - demoProfileStats.globalProgress / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="59, 59"
              />
            </Svg>
            <View style={styles.ringLabel}>
              <AppText variant="heading">{demoProfileStats.globalProgress}%</AppText>
            </View>
          </View>
          <View style={styles.legend}>
            <LegendRow color={colors.secondary} label="Maîtrisé" value={`${demoProfileStats.mastered} notions`} />
            <LegendRow color={colors.accent} label="En progression" value={`${demoProfileStats.progressing} notions`} />
            <LegendRow color={colors.primary} label="À renforcer" value={`${demoProfileStats.needsWork} notions`} />
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.menuCard}>
        {demoProfileMenu.map((item) => (
          <ProfileMenuRow key={item.id} item={item} onPress={handleMenuPress} />
        ))}
      </AppCard>
    </AppScreen>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText style={styles.legendLabel}>{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[5],
    paddingBottom: spacing[10],
  },
  identity: {
    alignItems: "center",
    gap: spacing[4],
  },
  avatarWrap: {
    width: 148,
    height: 148,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: colors.surfaceSoft,
  },
  editButton: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressCard: {
    gap: spacing[4],
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  ring: {
    width: 118,
    height: 118,
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: {
    position: "absolute",
  },
  legend: {
    flex: 1,
    gap: spacing[3],
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    flex: 1,
  },
  menuCard: {
    paddingVertical: spacing[2],
  },
});
