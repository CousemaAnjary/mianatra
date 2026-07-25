import { StyleSheet, View } from "react-native";
import type { DemoCoursePage } from "@/src/data/demo-data";
import { spacing } from "@/src/theme";
import { CoursePageItem } from "./CoursePageItem";

type CoursePageGridProps = {
  pages: DemoCoursePage[];
  onRemove: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
};

export function CoursePageGrid({
  pages,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: CoursePageGridProps) {
  return (
    <View style={styles.grid}>
      {pages.map((page, index) => (
        <View key={page.id} style={styles.cell}>
          <CoursePageItem
            page={page}
            index={index}
            canMoveLeft={index > 0}
            canMoveRight={index < pages.length - 1}
            onRemove={onRemove}
            onMoveLeft={onMoveLeft}
            onMoveRight={onMoveRight}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  cell: {
    width: "48%",
  },
});
