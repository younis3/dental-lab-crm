import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { elevation, radius } from '@/constants/design';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

type LogoMarkProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function LogoMark({ size = 72, style }: LogoMarkProps) {
  const theme = useTheme();
  const inner = size * 0.58;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View
        style={[
          styles.halo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.color.brandSoft,
          },
        ]}
      />
      <LinearGradient
        colors={theme.gradient.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.mark,
          {
            width: inner,
            height: inner,
            borderRadius: radius.md,
            shadowColor: theme.color.brand,
          },
          elevation(3, theme.scheme),
        ]}>
        <Icon name="diamond-outline" size={inner * 0.46} color="#FFFFFF" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute' },
  mark: { alignItems: 'center', justifyContent: 'center' },
});
