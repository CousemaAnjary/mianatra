import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { CourseCard, GradeFilter, type GradeFilterValue } from "@/src/components/core";
import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from "@/src/components/shared";
import { useCoursesList } from "@/src/features/courses/hooks/use-courses-list";

export default function CoursesScreen() {
  const { errorMessage, grades, items, reload, status } = useCoursesList();
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterValue>("Tous");
  const filterValues: GradeFilterValue[] = grades;
  const effectiveSelectedFilter = filterValues.includes(selectedFilter) ? selectedFilter : "Tous";
  const filteredCourses = useMemo(
    () =>
      effectiveSelectedFilter === "Tous"
        ? items
        : items.filter((course) => course.grade === effectiveSelectedFilter),
    [effectiveSelectedFilter, items],
  );

  function openCourse(courseId: string) {
    router.push({
      pathname: "/course/[courseId]",
      params: { courseId },
    });
  }

  return (
    <AppScreen contentClassName="gap-5 pb-10">
      <ScreenHeader title="Mes cours" subtitle="Tous tes cours au même endroit." />

      <GradeFilter
        values={filterValues}
        selectedValue={effectiveSelectedFilter}
        onChange={setSelectedFilter}
      />

      <View className="gap-3">
        {status === "loading" ? (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Chargement de tes cours…</AppText>
            <AppText tone="secondary">On récupère les cours enregistrés sur ce téléphone.</AppText>
          </AppCard>
        ) : null}

        {status === "error" ? (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Impossible de charger tes cours</AppText>
            <AppText tone="secondary">{errorMessage ?? "Une erreur est survenue."}</AppText>
            <AppButton title="Réessayer" iconName="redo" variant="secondary" onPress={reload} />
          </AppCard>
        ) : null}

        {status === "ready" && items.length === 0 ? (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Aucun cours pour le moment</AppText>
            <AppText tone="secondary">Ajoute un cours depuis ta galerie pour le retrouver ici.</AppText>
          </AppCard>
        ) : null}

        {status === "ready" && items.length > 0 && filteredCourses.length === 0 ? (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Aucun cours pour ce filtre.</AppText>
            <AppText tone="secondary">Choisis une autre classe ou ajoute un nouveau cours.</AppText>
          </AppCard>
        ) : null}

        {status === "ready" && filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
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
                focusText:
                  course.masteredCount + course.progressingCount + course.needsWorkCount > 0
                    ? `${course.masteredCount} maîtrisé(s) • ${course.progressingCount} en progression • ${course.needsWorkCount} à renforcer`
                    : null,
              }}
              onPress={() => openCourse(course.id)}
            />
          ))
        ) : null}
      </View>

      <AppButton
        title="Ajouter un cours"
        iconName="plus"
        onPress={() => router.push("/course/add")}
      />
    </AppScreen>
  );
}
