import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import type { DemoCoursePage } from "@/src/data/demo-data";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

const pageImages: Record<DemoCoursePage["assetName"], ImageSourcePropType> = {
  sample_course_page_1: require("../../../../assets/mianatra/sample_course_page_1.png"),
  sample_course_page_2: require("../../../../assets/mianatra/sample_course_page_2.png"),
  sample_course_page_3: require("../../../../assets/mianatra/sample_course_page_3.png"),
  sample_course_page_4: require("../../../../assets/mianatra/sample_course_page_4.png"),
};

type CoursePageItemProps = {
  page: DemoCoursePage;
  index: number;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onRemove: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
};

export function CoursePageItem({
  page,
  index,
  canMoveLeft,
  canMoveRight,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: CoursePageItemProps) {
  const pageNumber = index + 1;

  return (
    <View style={styles.card}>
      <Image
        source={pageImages[page.assetName]}
        accessibilityLabel={`${page.accessibilityLabel}, position ${pageNumber}`}
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        style={styles.image}
      />
      <View style={styles.numberBadge}>
        <AppText variant="label" tone="inverse">
          {pageNumber}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Supprimer la page ${pageNumber}`}
        onPress={() => onRemove(page.id)}
        style={styles.removeButton}
      >
        <FontAwesome5 name="times" size={18} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.reorderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Déplacer la page ${pageNumber} avant`}
          accessibilityState={{ disabled: !canMoveLeft }}
          disabled={!canMoveLeft}
          onPress={() => onMoveLeft(page.id)}
          style={[styles.moveButton, !canMoveLeft && styles.disabledButton]}
        >
          <FontAwesome5 name="arrow-left" size={14} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Déplacer la page ${pageNumber} après`}
          accessibilityState={{ disabled: !canMoveRight }}
          disabled={!canMoveRight}
          onPress={() => onMoveRight(page.id)}
          style={[styles.moveButton, !canMoveRight && styles.disabledButton]}
        >
          <FontAwesome5 name="arrow-right" size={14} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    overflow: "hidden",
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  numberBadge: {
    position: "absolute",
    left: spacing[3],
    bottom: spacing[3],
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  removeButton: {
    position: "absolute",
    right: spacing[2],
    top: spacing[2],
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reorderRow: {
    position: "absolute",
    right: spacing[2],
    bottom: spacing[2],
    flexDirection: "row",
    gap: spacing[1],
  },
  moveButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.35,
  },
});
