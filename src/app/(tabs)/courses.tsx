import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { CourseCard, GradeFilter, type GradeFilterValue } from "@/src/components/core";
import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from "@/src/components/shared";
import { demoCourses, demoGrades, type DemoCourse } from "@/src/data/demo-data";

export default function CoursesScreen() {
  const filterValues: GradeFilterValue[] = ["Tous", ...demoGrades];
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterValue>("Tous");
  const filteredCourses = useMemo(
    () =>
      selectedFilter === "Tous"
        ? demoCourses
        : demoCourses.filter((course) => course.grade === selectedFilter),
    [selectedFilter],
  );

  function openCourse(course: DemoCourse) {
    router.push({
      pathname: "/course/[courseId]",
      params: { courseId: course.id },
    });
  }

  return (
    <AppScreen contentClassName="gap-5 pb-10">
      <ScreenHeader title="Mes cours" subtitle="Tous tes cours au même endroit." />

      <GradeFilter
        values={filterValues}
        selectedValue={selectedFilter}
        onChange={setSelectedFilter}
      />

      <View className="gap-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onPress={openCourse} />
          ))
        ) : (
          <AppCard className="gap-3">
            <AppText variant="subtitle">Aucun cours pour ce filtre.</AppText>
            <AppText tone="secondary">
              Les cours de démonstration apparaîtront ici dès que ce niveau aura du contenu.
            </AppText>
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
