import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

import { mirror } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export type IconName = ComponentProps<typeof Ionicons>['name'];
/** Extra nav glyphs that Ionicons does not ship, such as the todo checklist. */
export type NavIconName = IconName | 'todo';

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

/** Tab bar and drawer glyph. `todo` is Material's checklist — a list with ticks. */
export function NavIcon({
  name,
  size = 20,
  color,
  style,
}: {
  name: NavIconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  if (name === 'todo') {
    return <MaterialIcons name="checklist" size={size} color={color} style={style} />;
  }

  return <Icon name={name} size={size} color={color} />;
}
