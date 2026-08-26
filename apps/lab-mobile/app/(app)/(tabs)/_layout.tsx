import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/tab-bar';

/**
 * Every workspace tab is registered here; the bar itself decides which of them
 * the signed-in role sees, and supplies the translated labels.
 */
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        sceneStyle: { backgroundColor: 'transparent' },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="folders" />
    </Tabs>
  );
}
