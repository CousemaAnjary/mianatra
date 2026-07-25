import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, spacing } from "@/src/theme";

type AppCardProps = ViewProps & {
  children: React.ReactNode;
};

export function AppCard({ children, style, ...props }: AppCardProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing[5],
  },
});
