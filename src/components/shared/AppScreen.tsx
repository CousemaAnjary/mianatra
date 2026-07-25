import { SafeAreaView, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, spacing } from "@/src/theme";

type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
};

export function AppScreen({
  children,
  scroll = true,
  padded = true,
  contentStyle,
}: AppScreenProps) {
  const content = (
    <View style={[padded && (scroll ? styles.scrollPadded : styles.padded), contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    flex: 1,
    padding: spacing[5],
  },
  scrollPadded: {
    padding: spacing[5],
  },
});
