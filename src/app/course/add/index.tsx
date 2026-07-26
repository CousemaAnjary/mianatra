import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router } from "expo-router";
import { AddPageButton, CoursePageGrid, ImportStepHeader } from "@/src/features/course-import/components";
import type { Subject } from "@/src/db";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { Input, InputField } from "@/src/components/ui/input";
import { compileCourse, getCourseImportDefaults, getOrCreateCourseImportSubject } from "@/src/features/course-import/services/course-import.service";
import { expoGalleryImportService } from "@/src/features/course-import/services/gallery-import.expo";
import {
  MAX_GALLERY_COURSE_PAGES,
  GalleryImportError,
  moveSelectedCoursePage,
  removeSelectedCoursePage,
  type SelectedCoursePage,
} from "@/src/features/course-import/services/gallery-import.service";
import { useCourseProcessing } from "@/src/features/course-processing";
import { listSubjects } from "@/src/features/subjects";

type AddCourseStep = 1 | 2 | 3;

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function AddCourseScreen() {
  const [step, setStep] = useState<AddCourseStep>(1);
  const [pages, setPages] = useState<SelectedCoursePage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState("Nouveau cours");
  const [grade, setGrade] = useState("2nde");
  const [subjectName, setSubjectName] = useState("SVT");
  const [isPicking, setIsPicking] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledCourseId, setCompiledCourseId] = useState<string | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processing = useCourseProcessing(compiledCourseId ?? undefined);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCourseImportDefaults(), listSubjects()])
      .then(([defaults, availableSubjects]) => {
        if (!mounted) {
          return;
        }
        setSubjects(availableSubjects);
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

  function goToPagesStep() {
    if (!normalizeText(subjectName)) {
      const message = "Choisis ou crée une matière avant de continuer.";
      setErrorMessage(message);
      Alert.alert("Matière requise", message);
      return;
    }
    setErrorMessage(null);
    setStep(2);
  }

  async function chooseImages() {
    setErrorMessage(null);
    setIsPicking(true);
    try {
      const result = await expoGalleryImportService.pickPages();
      if (result.status === "cancelled") {
        return;
      }
      const importToken = Date.now().toString(36);
      if (pages.length + result.pages.length > MAX_GALLERY_COURSE_PAGES) {
        setErrorMessage(`Seules les ${MAX_GALLERY_COURSE_PAGES} premières pages sont conservées.`);
      }
      setPages((currentPages) => {
        const nextImportedPages = result.pages.map((page, pageIndex) => ({
          ...page,
          id: `${importToken}-${currentPages.length + pageIndex}-${page.id}`,
        }));
        const mergedPages = [...currentPages, ...nextImportedPages].slice(0, MAX_GALLERY_COURSE_PAGES);
        return mergedPages.map((page, pageIndex) => ({ ...page, pageIndex }));
      });
    } catch (error) {
      const message = error instanceof GalleryImportError ? error.message : "Impossible d’ouvrir la galerie.";
      setErrorMessage(message);
      Alert.alert("Import impossible", message);
    } finally {
      setIsPicking(false);
    }
  }

  async function compileSelectedPages() {
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
    setIsCompiling(true);
    try {
      const subject = await getOrCreateCourseImportSubject(subjectName);
      const result = await expoGalleryImportService.createCourse({
        subjectId: subject.id,
        title,
        grade,
        pages,
      });
      await compileCourse(result.course.id);
      setCompiledCourseId(result.course.id);
      setSubjectName(subject.name);
      setStep(3);
    } catch (error) {
      const message = error instanceof GalleryImportError ? error.message : "Impossible de compiler les pages du cours.";
      setErrorMessage(message);
      Alert.alert("Compilation impossible", message);
    } finally {
      setIsCompiling(false);
    }
  }

  async function saveAnalyzedCourse() {
    setIsSavingCourse(true);
    try {
      await processing.confirmAndContinue?.();
      if (compiledCourseId) {
        router.replace({
          pathname: "/course/[courseId]",
          params: { courseId: compiledCourseId },
        });
      }
    } catch {
      // Le contrôleur expose déjà le message utilisateur dans processing.error.
    } finally {
      setIsSavingCourse(false);
    }
  }

  const normalizedSubjectName = normalizeText(subjectName);
  const isProcessingBusy = ["analyzing", "persisting", "generating_sheet", "generating_exercises"].includes(processing.status);
  const detectedAnalysis = processing.pendingAnalysis ?? processing.result.analysis;

  return (
    <AppScreen contentClassName="gap-5 pb-8">
      <ImportStepHeader
        currentStep={step}
        onOptionsPress={() => Alert.alert("Options", "Options disponibles prochainement.")}
      />

      {step === 1 ? (
        <>
          <View className="gap-2">
            <AppText variant="heading">Choisis la matière</AppText>
            <AppText tone="secondary">Sélectionne une matière existante ou écris-en une nouvelle.</AppText>
          </View>

          {subjects.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {subjects.map((subject) => {
                const isSelected = normalizeText(subjectName).toLocaleLowerCase() === subject.name.toLocaleLowerCase();
                return (
                  <Pressable
                    key={subject.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSubjectName(subject.name)}
                    className={[
                      "min-h-11 rounded-full border px-4 py-3 active:opacity-80",
                      isSelected ? "border-[#D94B24] bg-[#D94B24]" : "border-[#E8D9C7] bg-[#FFFDF8]",
                    ].join(" ")}
                  >
                    <AppText variant="label" tone={isSelected ? "inverse" : "primary"}>
                      {subject.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <AppCard className="gap-4">
            <View className="gap-2">
              <AppText variant="label">Nouvelle matière</AppText>
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
          </AppCard>

          <AppButton
            title="Continuer"
            iconName="arrow-right"
            iconPosition="right"
            disabled={!normalizedSubjectName}
            onPress={goToPagesStep}
          />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <View className="gap-2">
            <AppText variant="heading">Ajoute les pages de ton cours</AppText>
            <AppText tone="secondary">Sélectionne, supprime et réordonne de 1 à {MAX_GALLERY_COURSE_PAGES} images.</AppText>
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
            <AppText tone="secondary">Matière : {normalizedSubjectName}</AppText>
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

          <AddPageButton onPress={chooseImages} disabled={isPicking || isCompiling} />
          <View className="flex-row gap-3">
            <AppButton title="Retour" iconName="arrow-left" variant="secondary" className="flex-1" onPress={() => setStep(1)} />
            <AppButton
              title="Compiler les pages"
              iconName="layer-group"
              className="flex-[2]"
              loading={isCompiling}
              disabled={pages.length === 0 || !normalizedSubjectName || isPicking}
              accessibilityHint="Compile les pages sélectionnées avant l'analyse"
              onPress={compileSelectedPages}
            />
          </View>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <View className="gap-2">
            <AppText variant="heading">Analyse du cours</AppText>
            <AppText tone="secondary">Vérifie le titre, la matière, les pages et les notions avant l’enregistrement.</AppText>
          </View>

          <AppCard className="gap-4">
            <View className="gap-2">
              <AppText variant="subtitle">Cours compilé</AppText>
              <AppText tone="secondary">
                {title} • {normalizedSubjectName} • {pages.length} page(s)
              </AppText>
            </View>

            <View className="gap-2">
              <AppText variant="label">Traitement</AppText>
              <AppText tone="secondary">{processing.progress.message}</AppText>
            </View>

            {detectedAnalysis ? (
              <View className="gap-3">
                <View className="gap-1">
                  <AppText variant="label">Titre détecté</AppText>
                  <AppText tone="secondary">{detectedAnalysis.detectedTitle}</AppText>
                </View>
                <View className="gap-1">
                  <AppText variant="label">Matière détectée</AppText>
                  <AppText tone="secondary">{detectedAnalysis.detectedSubject}</AppText>
                </View>
                <View className="gap-1">
                  <AppText variant="label">Pages analysées</AppText>
                  <AppText tone="secondary">
                    {detectedAnalysis.successfulPageCount} / {detectedAnalysis.pageResults.length} page(s)
                  </AppText>
                  {detectedAnalysis.failedPageCount > 0 ? (
                    <AppText tone="error">{detectedAnalysis.failedPageCount} page(s) non analysée(s)</AppText>
                  ) : null}
                </View>
                <View className="gap-1">
                  <AppText variant="label">Notions détectées</AppText>
                  <AppText tone="secondary">{detectedAnalysis.concepts.length} notion(s)</AppText>
                </View>
                {detectedAnalysis.concepts.slice(0, 6).map((concept) => (
                  <AppText key={concept.name} tone="secondary">
                    • {concept.name}
                  </AppText>
                ))}
              </View>
            ) : null}

            {processing.error ? <AppText tone="error">{processing.error}</AppText> : null}
          </AppCard>

          {!detectedAnalysis ? (
            <AppButton
              title="Analyser"
              iconName="magic"
              loading={isProcessingBusy}
              disabled={!compiledCourseId || !processing.hasLoadedDetail}
              onPress={() => void processing.startProcessing?.()?.catch(() => undefined)}
            />
          ) : (
            <AppButton
              title="Enregistrer le cours"
              iconName="save"
              loading={isSavingCourse || isProcessingBusy}
              disabled={!processing.pendingAnalysis}
              onPress={() => void saveAnalyzedCourse()}
            />
          )}

          {processing.error ? (
            <AppButton title="Réessayer" iconName="redo" variant="secondary" onPress={() => void processing.retry?.()?.catch(() => undefined)} />
          ) : null}
        </>
      ) : null}

      {errorMessage ? (
        <AppText variant="caption" tone="error">
          {errorMessage}
        </AppText>
      ) : null}
    </AppScreen>
  );
}
