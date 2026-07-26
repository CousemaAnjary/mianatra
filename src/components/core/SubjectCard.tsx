import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppCard, AppText, ProgressBar } from "@/src/components/shared";
import { colors } from "@/src/theme";

export type SubjectCardData = {
  id: string;
  name: string;
  color?: string | null;
  iconName?: React.ComponentProps<typeof FontAwesome5>["name"] | string | null;
  chapterCount: number;
  progress: number;
  mainWeakness?: string | null;
};

type SubjectCardProps = {
  subject: SubjectCardData;
  onPress: () => void;
};

export function SubjectCard({ subject, onPress }: SubjectCardProps) {
  const chapterLabel = `${subject.chapterCount} chapitre${subject.chapterCount > 1 ? "s" : ""}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la matière ${subject.name}`}
      onPress={onPress}
      className="active:opacity-80"
    >
      <AppCard className="flex-row items-center gap-4 p-4">
        <View
          accessibilityLabel={`Icône ${subject.name}`}
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: subject.color ?? colors.secondary }}
        >
          <FontAwesome5
            name={subject.iconName ?? "book-open"}
            size={26}
            color={colors.white}
          />
        </View>
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <AppText variant="subtitle">{subject.name}</AppText>
              <AppText tone="secondary">{chapterLabel}</AppText>
            </View>
            <AppText variant="label">{subject.progress}%</AppText>
          </View>
          <ProgressBar
            value={subject.progress}
            accessibilityLabel={`Progression ${subject.name}`}
          />
          <AppText tone="secondary">
            {subject.mainWeakness ? `À renforcer : ${subject.mainWeakness}` : "Pas encore révisé"}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}
