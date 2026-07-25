import { Alert, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { CourseCard, RecommendationCard } from "@/src/components/core";
import {
  AppButton,
  AppScreen,
  AppText,
  StatusBadge,
} from "@/src/components/shared";
import { demoCourse, demoHomeCourses, demoProfile, demoSession, type DemoCourse } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export default function HomeScreen() {
  function openCourse(course: DemoCourse) {
    router.push({
      pathname: "/course/[courseId]",
      params: { courseId: course.id },
    });
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="title">{`Bonjour ${demoProfile.firstName} 👋`}</AppText>
          <AppText variant="subtitle" tone="secondary">
            Prête pour une petite révision ?
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() =>
            Alert.alert("Notifications", "Aucune nouvelle notification pour cette démonstration.")
          }
          style={styles.notificationButton}
        >
          <FontAwesome5 name="bell" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.streakWrap}>
        <StatusBadge label="4 jours de suite" tone="warning" />
      </View>

      <RecommendationCard
        course={demoCourse}
        onContinue={() =>
          router.push({
            pathname: "/session/[sessionId]",
            params: { sessionId: demoSession.id },
          })
        }
      />

      <View style={styles.sectionHeader}>
        <AppText variant="heading">Mes cours</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir tous les cours"
          onPress={() => router.push("/courses")}
          style={styles.linkButton}
        >
          <AppText variant="label" tone="secondary">
            Voir tout
          </AppText>
        </Pressable>
      </View>

      <View style={styles.courseList}>
        {demoHomeCourses.map((course) => (
          <CourseCard key={course.id} course={course} onPress={openCourse} />
        ))}
      </View>

      <AppButton
        title="Ajouter un cours"
        iconName="plus"
        onPress={() => router.push("/course/add")}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: spacing[2],
  },
  notificationButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakWrap: {
    alignSelf: "flex-end",
    marginTop: -spacing[3],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  linkButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  courseList: {
    gap: spacing[3],
  },
});
