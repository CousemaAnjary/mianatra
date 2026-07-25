import { Image, StyleSheet, type ImageSourcePropType } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import type { DemoRevisionSection } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

const revisionImages: Record<"function-graph", ImageSourcePropType> = {
  "function-graph": require("../../../../assets/mianatra/image_function_graph_exercise.png"),
};

type RevisionSectionProps = {
  section: DemoRevisionSection;
};

export function RevisionSection({ section }: RevisionSectionProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="subtitle">{section.title}</AppText>
      {section.text ? <AppText tone="secondary">{section.text}</AppText> : null}
      {section.image ? (
        <Image
          source={revisionImages[section.image]}
          accessibilityLabel={`Illustration : ${section.title}`}
          accessibilityIgnoresInvertColors
          style={styles.image}
        />
      ) : null}
      {section.formula ? (
        <AppText variant="heading" style={styles.formula}>
          {section.formula}
        </AppText>
      ) : null}
      {section.formulaDetail ? (
        <AppText tone="secondary">{section.formulaDetail}</AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  image: {
    width: "100%",
    height: 190,
    resizeMode: "contain",
    borderRadius: radius.large,
    backgroundColor: colors.surface,
  },
  formula: {
    fontStyle: "italic",
  },
});
