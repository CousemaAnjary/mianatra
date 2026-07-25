import { StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppCard, AppText } from "@/src/components/shared";
import type { DemoRecentActivity } from "@/src/data/demo-data";
import { colors, spacing } from "@/src/theme";

type RecentActivityListProps = {
  activities: DemoRecentActivity[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="subtitle">Dernières activités</AppText>
      {activities.map((activity, index) => (
        <View
          key={activity.id}
          style={[
            styles.row,
            index < activities.length - 1 && styles.rowBorder,
          ]}
        >
          <FontAwesome5 name={activity.iconName} size={22} color={colors.textSecondary} />
          <AppText style={styles.title}>{activity.title}</AppText>
          <AppText variant="label">{activity.score}%</AppText>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
  },
});
