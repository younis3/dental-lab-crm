import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

type LogoMarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** The Nadeem tooth mark, lifted from the printed logo as transparent line art. */
export function LogoMark({ size = 72, style }: LogoMarkProps) {
  return (
    <Image
      source={require('../../assets/images/logo/mark.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessible
      accessibilityLabel="Nadeem Dental Company"
    />
  );
}
