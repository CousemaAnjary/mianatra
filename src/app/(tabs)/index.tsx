import { Pressable, View } from "react-native";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { CourseCard } from "@/src/components/core";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ProgressBar,
} from "@/src/components/shared";
import { useHomeDashboard } from "@/src/features/home/hooks/use-home-dashboard";
import { colors } from "@/src/theme";

function openCourse(courseId: string) {
  router.push({
    pathname: "/course/[courseId]",
    params: { courseId },
  });
}

function openSession(sessionId: string) {
  router.push({
    pathname: "/session/[sessionId]",
    params: { sessionId },
  });
}

export default function HomeScreen() {
  const { dashboard, errorMessage, reload, status } = useHomeDashboard();

  if (status === "loading") {
    return (
      <AppScreen contentClassName="gap-5 pb-10">
        <AppCard className="gap-3">
          <AppText variant="subtitle">Chargement de ton accueil…</AppText>
          <AppText tone="secondary">On récupère ton profil et tes cours enregistrés.</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (status === "error" || !dashboard) {
    return (
      <AppScreen contentClassName="gap-5 pb-10">
        <AppCard className="gap-3">
          <AppText variant="subtitle">{"Impossible de charger l'accueil"}</AppText>
          <AppText tone="secondary">{errorMessage ?? "Une erreur est survenue."}</AppText>
          <AppButton title="Réessayer" iconName="redo" onPress={reload} />
          <AppButton title="Revenir à l'onboarding" iconName="user-plus" variant="secondary" onPress={() => router.replace("/onboarding")} />
        </AppCard>
      </AppScreen>
    );
  }

  const activeSession = dashboard.activeSession;

  return (
    <AppScreen contentClassName="gap-5 pb-10">
      <View className="gap-2">
        <AppText variant="title">{`Bonjour, ${dashboard.displayName}`}</AppText>
        <AppText variant="subtitle" tone="secondary">
          Prête pour une petite révision ?
        </AppText>
      </View>

      {activeSession ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reprendre ma séance"
          onPress={() => openSession(activeSession.id)}
          className="active:opacity-80"
        >
          <AppCard className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#D94B24]">
                <FontAwesome5 name="play" size={18} color={colors.white} />
              </View>
              <View className="flex-1">
                <AppText variant="subtitle">Reprendre ma séance</AppText>
                <AppText tone="secondary">{activeSession.courseTitle}</AppText>
              </View>
            </View>
            <ProgressBar
              value={
                activeSession.totalExercises > 0
                  ? Math.round((activeSession.currentExerciseIndex / activeSession.totalExercises) * 100)
                  : 0
              }
              accessibilityLabel="Progression de la séance active"
            />
            <AppText tone="secondary">
              {activeSession.totalExercises > 0
                ? `${Math.min(activeSession.currentExerciseIndex + 1, activeSession.totalExercises)} sur ${activeSession.totalExercises} exercices`
                : "Aucun exercice disponible"}
            </AppText>
          </AppCard>
        </Pressable>
      ) : null}

      <View className="flex-row items-center justify-between gap-3">
        <AppText variant="heading">Cours récents</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir tous mes cours"
          onPress={() => router.push("/courses")}
          className="min-h-11 justify-center active:opacity-80"
        >
          <AppText variant="label" tone="secondary">
            Voir tout
          </AppText>
        </Pressable>
      </View>

      <View className="gap-3">
        {dashboard.recentCourses.length > 0 ? (
          dashboard.recentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                title: course.title,
                subject: course.subject,
                grade: course.grade,
                pageCount: course.pageCount,
                progress: course.progress,
                iconName: course.iconName,
                color: course.subjectColor,
                focusText: course.progress > 0 ? `${course.progress}% de progression` : null,
              }}
              onPress={() => openCourse(course.id)}
            />
          ))
        ) : (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Aucun cours pour le moment</AppText>
            <AppText tone="secondary">Ajoute un cours depuis ta galerie pour le retrouver ici.</AppText>
          </AppCard>
        )}
      </View>

      <AppButton
        title="Ajouter un cours"
        iconName="plus"
        onPress={() => router.push("/course/add")}
      />
    </AppScreen>
  );
}
