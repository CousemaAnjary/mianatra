import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppCard, AppText, ProgressBar } from "@/src/components/shared";
import type { DemoCourse } from "@/src/data/demo-data";
import { colors } from "@/src/theme";

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
      className="active:opacity-80"
    >
      <AppCard className="flex-row items-center gap-4 p-4">
        <View
          accessibilityLabel={`Icône ${course.subject}`}
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: courseIconBackground[course.id] ?? colors.secondary }}
        >
          <FontAwesome5
            name={course.iconName ?? "book-open"}
            size={26}
            color={colors.white}
          />
        </View>
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
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
