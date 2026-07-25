import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { CourseTopBar } from "@/src/features/courses/components";
import { RevisionSection } from "@/src/features/revision/components";
import { demoCourses, demoRevisionSheet, demoSession } from "@/src/data/demo-data";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

export default function RevisionSheetScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = demoCourses.find((demoItem) => demoItem.id === courseId);
  const sheet = demoRevisionSheet.courseId === courseId ? demoRevisionSheet : undefined;

  if (!course || !sheet) {
    return (
      <AppScreen contentClassName="gap-4 pb-8">
        <CourseTopBar title="Ma fiche" />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Fiche indisponible</AppText>
          <AppText tone="secondary">
            {"Aucune fiche de démonstration n'est disponible pour ce cours."}
          </AppText>
          <AppButton
            title="Retour aux cours"
            iconName="arrow-left"
            onPress={() => router.replace("/courses")}
          />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentClassName="gap-4 pb-8">
      <CourseTopBar
        title="Ma fiche"
        onOptionsPress={() =>
          Alert.alert(
            "Options de la fiche",
            "Modifier la fiche — disponible prochainement\nRégénérer une section — disponible prochainement",
          )
        }
      />
      <AppText variant="heading">{sheet.summaryTitle}</AppText>
      <AppText variant="heading">{sheet.title}</AppText>

      {sheet.sections.map((section) => (
        <RevisionSection key={section.id} section={section} />
      ))}

      <AppButton
        title="Faire des exercices"
        iconName="pen"
        onPress={() =>
          router.push({
            pathname: "/session/[sessionId]",
            params: { sessionId: demoSession.id },
          })
        }
      />
    </AppScreen>
  );
}
