import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type CourseProgressRingProps = {
  value: number;
  size?: number;
};

export function CourseProgressRing({ value, size = 118 }: CourseProgressRingProps) {
  const radius = size * 0.38;
  const strokeWidth = Math.max(8, size * 0.08);
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <View
      accessibilityLabel={`Progression du chapitre : ${normalizedValue} pour cent`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: normalizedValue }}
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceSoft}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.secondary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - normalizedValue / 100)}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute">
        <AppText variant="heading">{normalizedValue}%</AppText>
      </View>
    </View>
  );
}
