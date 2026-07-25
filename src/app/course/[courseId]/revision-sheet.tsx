import { Alert } from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { CourseTopBar } from "@/src/features/courses/components";
import { getCourseDetail } from "@/src/features/courses";
import { RevisionSection } from "@/src/features/revision/components";
import { loadLatestRevisionSheet, type RevisionSheetViewState } from "@/src/features/revision-sheet/services/revision-sheet-view.service";
import { startRealCourseSession } from "@/src/features/study-session/services/real-session-view.service";
import { demoCourses, demoRevisionSheet, demoSession } from "@/src/data/demo-data";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

export default function RevisionSheetScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const resolvedCourseId = Array.isArray(courseId) ? courseId[0] : courseId;
  const [realCourseExists, setRealCourseExists] = useState(false);
  const [realSheet, setRealSheet] = useState<RevisionSheetViewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const course = demoCourses.find((demoItem) => demoItem.id === resolvedCourseId);
  const sheet = demoRevisionSheet.courseId === resolvedCourseId ? demoRevisionSheet : undefined;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!resolvedCourseId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        await getCourseDetail(resolvedCourseId);
        const loadedSheet = await loadLatestRevisionSheet(resolvedCourseId);
        if (!cancelled) {
          setRealCourseExists(true);
          setRealSheet(loadedSheet);
        }
      } catch {
        if (!cancelled) {
          setRealCourseExists(false);
          setRealSheet(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [resolvedCourseId]);

  async function startExercises() {
    if (!resolvedCourseId || !realCourseExists) {
      router.push({ pathname: "/session/[sessionId]", params: { sessionId: demoSession.id } });
      return;
    }
    setSessionError(null);
    const session = await startRealCourseSession(resolvedCourseId);
    if (!session) {
      setSessionError("Aucun exercice réel n'est disponible pour ce cours.");
      return;
    }
    router.push({ pathname: "/session/[sessionId]", params: { sessionId: session.id } });
  }

  if (isLoading) {
    return (
      <AppScreen contentClassName="gap-4 pb-8">
        <CourseTopBar title="Ma fiche" />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Chargement de la fiche</AppText>
          <AppText tone="secondary">Préparation du contenu...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (realCourseExists && realSheet?.status !== "ready") {
    return (
      <AppScreen contentClassName="gap-4 pb-8">
        <CourseTopBar title="Ma fiche" />
        <AppCard className="gap-3">
          <AppText variant="subtitle">{realSheet?.status === "invalid" ? "Fiche invalide" : "Fiche absente"}</AppText>
          <AppText tone="secondary">
            {realSheet?.status === "invalid"
              ? "La fiche enregistrée ne peut pas être affichée."
              : "Génère une fiche depuis le détail du cours."}
          </AppText>
          <AppButton title="Retour au cours" iconName="arrow-left" onPress={() => router.back()} />
        </AppCard>
      </AppScreen>
    );
  }

  if (realSheet?.status === "ready") {
    const content = realSheet.content;
    const sections = [
      ["Notions clés", content.keyConcepts],
      ["Définitions", content.definitions],
      ["Formules", content.formulas],
      ["Exemples", content.examples],
      ["Erreurs fréquentes", content.commonMistakes],
      ["À retenir", content.importantPoints],
    ] as const;

    return (
      <AppScreen contentClassName="gap-4 pb-8">
        <CourseTopBar title="Ma fiche" />
        <AppText variant="heading">{content.title}</AppText>
        <AppText tone="secondary">{content.summary}</AppText>
        {sections.map(([title, items]) => (
          <AppCard key={title} className="gap-3">
            <AppText variant="subtitle">{title}</AppText>
            {items.length > 0 ? items.map((item) => <AppText key={item} tone="secondary">• {item}</AppText>) : <AppText tone="muted">Aucun élément.</AppText>}
          </AppCard>
        ))}
        {sessionError ? <AppText tone="error">{sessionError}</AppText> : null}
        <AppButton title="Faire des exercices" iconName="pen" onPress={() => void startExercises()} />
      </AppScreen>
    );
  }

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
        onPress={() => void startExercises()}
      />
    </AppScreen>
  );
}
