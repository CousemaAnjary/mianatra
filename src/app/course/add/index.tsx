import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AddPageButton, CoursePageGrid, ImportStepHeader } from "@/src/features/course-import/components";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { demoCourse, demoCoursePages, type DemoCoursePage } from "@/src/data/demo-data";
import { spacing } from "@/src/theme";

function normalizePages(pages: DemoCoursePage[]): DemoCoursePage[] {
  return pages.map((page, index) => ({ ...page, order: index + 1 }));
}

export default function AddCourseScreen() {
  const [pages, setPages] = useState<DemoCoursePage[]>(demoCoursePages);
  const availablePages = useMemo(
    () => demoCoursePages.filter((demoPage) => !pages.some((page) => page.id === demoPage.id)),
    [pages],
  );

  function removePage(id: string) {
    setPages((currentPages) => normalizePages(currentPages.filter((page) => page.id !== id)));
  }

  function movePage(id: string, direction: "left" | "right") {
    setPages((currentPages) => {
      const index = currentPages.findIndex((page) => page.id === id);
      const nextIndex = direction === "left" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= currentPages.length) {
        return currentPages;
      }

      const nextPages = [...currentPages];
      const currentPage = nextPages[index];
      const targetPage = nextPages[nextIndex];
      nextPages[index] = targetPage;
      nextPages[nextIndex] = currentPage;

      return normalizePages(nextPages);
    });
  }

  function addDemoPage() {
    const nextPage = availablePages[0];

    if (!nextPage) {
      Alert.alert("Aucune page disponible", "Toutes les pages de démonstration sont déjà ajoutées.");
      return;
    }

    setPages((currentPages) => normalizePages([...currentPages, nextPage]));
  }

  function compilePages() {
    if (pages.length === 0) {
      Alert.alert("Aucune page", "Ajoute au moins une page avant de compiler le cours.");
      return;
    }

    Alert.alert(
      "Compiler les pages",
      `Compiler ${pages.length} page${pages.length > 1 ? "s" : ""} de démonstration ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Compiler",
          onPress: () =>
            router.push({
              pathname: "/course/[courseId]",
              params: { courseId: demoCourse.id },
            }),
        },
      ],
    );
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <ImportStepHeader
        onOptionsPress={() => Alert.alert("Options", "Options disponibles prochainement.")}
      />

      <View style={styles.intro}>
        <AppText variant="heading">Prends en photo les pages de ton cours</AppText>
        <AppText tone="secondary">Tu peux ajouter plusieurs pages.</AppText>
      </View>

      {pages.length > 0 ? (
        <CoursePageGrid
          pages={pages}
          onRemove={removePage}
          onMoveLeft={(id) => movePage(id, "left")}
          onMoveRight={(id) => movePage(id, "right")}
        />
      ) : (
        <AppCard style={styles.emptyCard}>
          <AppText variant="subtitle">Aucune page ajoutée.</AppText>
          <AppText tone="secondary">
            Ajoute une page de démonstration pour continuer la compilation.
          </AppText>
        </AppCard>
      )}

      <AddPageButton onPress={addDemoPage} />

      {availablePages.length === 0 ? (
        <AppText variant="caption" tone="muted">
          Toutes les pages de démonstration sont déjà visibles.
        </AppText>
      ) : null}

      <AppButton
        title="Compiler les pages"
        iconName="check"
        disabled={pages.length === 0}
        accessibilityHint="Demande une confirmation puis ouvre le détail du cours"
        onPress={compilePages}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[5],
    paddingBottom: spacing[8],
  },
  intro: {
    gap: spacing[2],
  },
  emptyCard: {
    gap: spacing[3],
  },
});
