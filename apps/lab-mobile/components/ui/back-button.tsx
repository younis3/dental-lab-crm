import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { elevation } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

export function BackButton() {
  const theme = useTheme();
  const router = useRouter();
  const { ui } = useLanguage();

  return (
    <PressableScale
      onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
      accessibilityRole="button"
      accessibilityLabel={ui.actionBack}
      hitSlop={8}
      style={[
        styles.button,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
        elevation(1, theme.scheme),
      ]}>
      <Icon name="chevron-back" size={20} color={theme.color.text} directional />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
