import { Redirect, Stack } from 'expo-router';

import { DrawerHost } from '@/components/navigation/drawer';
import { useAuth } from '@/store/auth-store';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <DrawerHost>
      <Stack screenOptions={{ headerShown: false }} />
    </DrawerHost>
  );
}
