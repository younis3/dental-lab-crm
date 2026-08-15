import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

import { mirror } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  /** Flips arrows and chevrons when the layout is right-to-left. */
  directional?: boolean;
};

export function Icon({ name, size = 20, color, style, directional = false }: IconProps) {
  const { isRtl } = useLanguage();

  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={[directional ? mirror(isRtl) : null, style]}
    />
  );
}
