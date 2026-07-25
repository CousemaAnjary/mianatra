import { View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppCard, AppText } from "@/src/components/shared";
import type { DemoRecentActivity } from "@/src/data/demo-data";
import { colors } from "@/src/theme";

type RecentActivityListProps = {
  activities: DemoRecentActivity[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <AppCard className="gap-3">
      <AppText variant="subtitle">Dernières activités</AppText>
      {activities.map((activity, index) => (
        <View
          key={activity.id}
          className={[
            "min-h-14 flex-row items-center gap-3",
            index < activities.length - 1 ? "border-b border-[#E8D9C7]" : "",
          ].join(" ")}
        >
          <FontAwesome5 name={activity.iconName} size={22} color={colors.textSecondary} />
          <AppText className="flex-1">{activity.title}</AppText>
          <AppText variant="label">{activity.score}%</AppText>
        </View>
      ))}
    </AppCard>
  );
}
