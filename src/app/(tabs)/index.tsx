import { Alert, Pressable, View } from "react-native";
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
import { colors } from "@/src/theme";

export default function HomeScreen() {
  function openCourse(course: Pick<DemoCourse, "id">) {
    router.push({
      pathname: "/course/[courseId]",
      params: { courseId: course.id },
    });
  }

  return (
    <AppScreen contentClassName="gap-5 pb-10">
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-2">
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
          className="h-12 w-12 items-center justify-center rounded-full border border-[#E8D9C7] bg-[#FFFDF8] active:opacity-80"
        >
          <FontAwesome5 name="bell" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View className="-mt-3 self-end">
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

      <View className="flex-row items-center justify-between gap-3">
        <AppText variant="heading">Mes cours</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir tous les cours"
          onPress={() => router.push("/courses")}
          className="min-h-11 justify-center active:opacity-80"
        >
          <AppText variant="label" tone="secondary">
            Voir tout
          </AppText>
        </Pressable>
      </View>

      <View className="gap-3">
        {demoHomeCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              id: course.id,
              title: course.subject,
              subject: course.subject,
              grade: course.grade,
              pageCount: course.chapters ?? course.pageCount,
              progress: course.progress,
              iconName: course.iconName,
              color: null,
              focusText: `À renforcer : ${course.focus}`,
            }}
            onPress={() => openCourse(course)}
          />
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
