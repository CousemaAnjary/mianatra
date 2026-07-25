import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { AddPageButton, CoursePageGrid, ImportStepHeader } from "@/src/features/course-import/components";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { Input, InputField } from "@/src/components/ui/input";
import { getCourseImportDefaults, getOrCreateCourseImportSubject } from "@/src/features/course-import/services/course-import.service";
import { expoGalleryImportService } from "@/src/features/course-import/services/gallery-import.expo";
import {
  MAX_GALLERY_COURSE_PAGES,
  GalleryImportError,
  moveSelectedCoursePage,
  removeSelectedCoursePage,
  type SelectedCoursePage,
} from "@/src/features/course-import/services/gallery-import.service";

export default function AddCourseScreen() {
  const [pages, setPages] = useState<SelectedCoursePage[]>([]);
  const [title, setTitle] = useState("Nouveau cours");
  const [grade, setGrade] = useState("2nde");
  const [subjectName, setSubjectName] = useState("SVT");
  const [isPicking, setIsPicking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCourseImportDefaults()
      .then((defaults) => {
        if (!mounted) {
          return;
        }
        setSubjectName(defaults.subjectName);
        setTitle(defaults.title);
        setGrade(defaults.grade);
      })
      .catch(() => {
        if (mounted) {
          setErrorMessage("Impossible de charger les matières disponibles.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function removePage(id: string) {
    setPages((currentPages) => removeSelectedCoursePage(currentPages, id));
  }

  function movePage(id: string, direction: "left" | "right") {
    setPages((currentPages) => moveSelectedCoursePage(currentPages, id, direction));
  }

  async function chooseImages() {
    setErrorMessage(null);
    setIsPicking(true);
    try {
      const result = await expoGalleryImportService.pickPages();
      if (result.status === "cancelled") {
        return;
      }
      setPages(result.pages);
    } catch (error) {
      const message = error instanceof GalleryImportError ? error.message : "Impossible d’ouvrir la galerie.";
      setErrorMessage(message);
      Alert.alert("Import impossible", message);
    } finally {
      setIsPicking(false);
    }
  }

  async function createCourse() {
    if (!subjectName.trim()) {
      const message = "Renseigne la matière du cours.";
      setErrorMessage(message);
      Alert.alert("Cours impossible", message);
      return;
    }
    if (pages.length === 0) {
      const message = "Choisis au moins une image avant de créer le cours.";
      setErrorMessage(message);
      Alert.alert("Aucune page", message);
      return;
    }

    setErrorMessage(null);
    setIsCreating(true);
    try {
      const subject = await getOrCreateCourseImportSubject(subjectName);
      const result = await expoGalleryImportService.createCourse({
        subjectId: subject.id,
        title,
        grade,
        pages,
      });
      router.replace({
        pathname: "/course/[courseId]",
        params: { courseId: result.course.id },
      });
    } catch (error) {
      const message = error instanceof GalleryImportError ? error.message : "Impossible de créer le cours.";
      setErrorMessage(message);
      Alert.alert("Cours impossible", message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <AppScreen contentClassName="gap-5 pb-8">
      <ImportStepHeader
        onOptionsPress={() => Alert.alert("Options", "Options disponibles prochainement.")}
      />

      <View className="gap-2">
        <AppText variant="heading">Ajoute les pages de ton cours</AppText>
        <AppText tone="secondary">Choisis de 1 à {MAX_GALLERY_COURSE_PAGES} images depuis ta galerie.</AppText>
      </View>

      <AppCard className="gap-4">
        <View className="gap-2">
          <AppText variant="label">Titre du cours</AppText>
          <Input variant="rounded" size="xl" className="border-[#E8D9C7] bg-[#FFFDF8]">
            <InputField
              value={title}
              onChangeText={setTitle}
              placeholder="Nouveau cours"
              className="text-[#2F241F]"
              returnKeyType="done"
            />
          </Input>
        </View>
        <View className="gap-2">
          <AppText variant="label">Matière</AppText>
          <Input variant="rounded" size="xl" className="border-[#E8D9C7] bg-[#FFFDF8]">
            <InputField
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder="SVT"
              className="text-[#2F241F]"
              returnKeyType="done"
            />
          </Input>
        </View>
        <View className="gap-2">
          <AppText variant="label">Classe</AppText>
          <Input variant="rounded" size="xl" className="border-[#E8D9C7] bg-[#FFFDF8]">
            <InputField
              value={grade}
              onChangeText={setGrade}
              placeholder="2nde"
              className="text-[#2F241F]"
              returnKeyType="done"
            />
          </Input>
        </View>
      </AppCard>

      {pages.length > 0 ? (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText variant="subtitle">Pages sélectionnées</AppText>
            <AppText variant="label" tone="secondary">
              {pages.length} / {MAX_GALLERY_COURSE_PAGES}
            </AppText>
          </View>
          <CoursePageGrid
            pages={pages}
            onRemove={removePage}
            onMoveLeft={(id) => movePage(id, "left")}
            onMoveRight={(id) => movePage(id, "right")}
          />
        </View>
      ) : (
        <AppCard className="gap-3">
          <AppText variant="subtitle">Aucune page ajoutée.</AppText>
          <AppText tone="secondary">Choisis les photos ou captures de ton cours pour continuer.</AppText>
        </AppCard>
      )}

      <AddPageButton onPress={chooseImages} disabled={isPicking || isCreating} />

      {errorMessage ? (
        <AppText variant="caption" tone="error">
          {errorMessage}
        </AppText>
      ) : null}

      <AppButton
        title="Créer le cours"
        iconName="check"
        loading={isCreating}
        disabled={pages.length === 0 || !subjectName.trim() || isPicking}
        accessibilityHint="Crée le cours avec les pages sélectionnées puis ouvre son détail"
        onPress={createCourse}
      />
    </AppScreen>
  );
}
