import { Image, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ProgressBar,
  ScreenHeader,
} from "@/src/components/shared";
import { demoCourse, demoSubjects } from "@/src/data/demo-data";
import { radius, spacing } from "@/src/theme";

export default function CoursesScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Mes cours" subtitle="Fondation de la bibliothèque" />

      <AppCard style={styles.card}>
        <Image
          source={require("../../../assets/mianatra/sample_course_page_1.png")}
          accessibilityIgnoresInvertColors
          style={styles.preview}
        />
        <View style={styles.courseText}>
          <AppText variant="subtitle">{demoCourse.title}</AppText>
          <AppText tone="secondary">{demoCourse.subject}</AppText>
          <ProgressBar value={demoCourse.progress} />
        </View>
        <AppButton
          title="Ouvrir le cours"
          onPress={() =>
            router.push({
              pathname: "/course/[courseId]",
              params: { courseId: demoCourse.id },
            })
          }
        />
      </AppCard>

      <View style={styles.subjects}>
        {demoSubjects.map((subject) => (
          <AppCard key={subject.id} style={styles.subjectCard}>
            <AppText variant="label">{subject.name}</AppText>
          </AppCard>
        ))}
      </View>

      <AppButton
        title="Ajouter un cours"
        variant="secondary"
        onPress={() => router.push("/course/add")}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  preview: {
    width: "100%",
    height: 148,
    borderRadius: radius.large,
  },
  courseText: {
    gap: spacing[2],
  },
  subjects: {
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  subjectCard: {
    paddingVertical: spacing[4],
  },
});
