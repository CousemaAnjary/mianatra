import { Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppCard, AppText, ProgressBar } from "@/src/components/shared";
import type { DemoCourse } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

type CourseCardProps = {
  course: DemoCourse;
  onPress: (course: DemoCourse) => void;
};

const courseIconBackground: Record<string, string> = {
  "demo-second-degree-functions": colors.secondary,
  "demo-electricity": colors.accent,
  "demo-important-dates": colors.subjectHistory,
  "demo-dissertation": colors.subjectFrench,
  "demo-genetics": colors.subjectSvt,
};

export function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${course.subject}`}
      onPress={() => onPress(course)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <AppCard style={styles.card}>
        <View
          accessibilityLabel={`Icône ${course.subject}`}
          style={[
            styles.icon,
            { backgroundColor: courseIconBackground[course.id] ?? colors.secondary },
          ]}
        >
          <FontAwesome5
            name={course.iconName ?? "book-open"}
            size={26}
            color={colors.white}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <AppText variant="subtitle">{course.subject}</AppText>
              <AppText tone="secondary">{course.chapters ?? course.pageCount} chapitres</AppText>
            </View>
            <AppText variant="label">{course.progress}%</AppText>
          </View>
          <ProgressBar
            value={course.progress}
            accessibilityLabel={`Progression ${course.subject}`}
          />
          <AppText tone="secondary">À renforcer : {course.focus}</AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.large,
  },
  content: {
    flex: 1,
    gap: spacing[2],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  titleGroup: {
    flex: 1,
  },
});
